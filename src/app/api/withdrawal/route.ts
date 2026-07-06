import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  createWithdrawalRequest,
  getGlobalInfo,
  getOrderByNumberOrInvoice,
  getWithdrawalPage,
} from '@/lib/strapi';
import {
  buildWithdrawalCustomerHtml,
  buildWithdrawalInternalHtml,
  WITHDRAWAL_EMAIL_SUBJECT,
  type WithdrawalRequestData,
} from '@/lib/email-templates/withdrawal-confirmation';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { name, orderNumber, email, bankAccount, returnedItems, unopenedConfirmed } = body as {
    name?: string;
    orderNumber?: string;
    email?: string;
    bankAccount?: string;
    returnedItems?: string;
    unopenedConfirmed?: boolean;
  };

  if (!name || !orderNumber || !email || !bankAccount) {
    return NextResponse.json({ error: 'Všechna povinná pole musí být vyplněna' }, { status: 422 });
  }

  if (unopenedConfirmed !== true) {
    return NextResponse.json(
      { error: 'Je nutné potvrdit, že vracené zboží je neotevřené' },
      { status: 422 }
    );
  }

  // Soft lookup — never blocks the submission (legal requirement: form must always work)
  const order = await getOrderByNumberOrInvoice(orderNumber.trim()).catch(() => null);

  try {
    await createWithdrawalRequest({
      name: name.trim(),
      orderNumber: orderNumber.trim(),
      email: email.trim(),
      bankAccount: bankAccount.trim(),
      returnedItems: returnedItems?.trim() || undefined,
      unopenedConfirmed: true,
      orderDocumentId: order?.documentId,
    });
  } catch (err) {
    console.error('Strapi withdrawal save failed:', err);
    return NextResponse.json({ error: 'Nepodařilo se uložit žádost' }, { status: 500 });
  }

  const [globalInfo, page] = await Promise.all([
    getGlobalInfo().catch(() => null),
    getWithdrawalPage().catch(() => null),
  ]);

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail =
    globalInfo?.contactFromEmail || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const internalEmail = globalInfo?.claimsEmail || globalInfo?.email;

  if (resendKey && globalInfo) {
    const resend = new Resend(resendKey);
    const data: WithdrawalRequestData = {
      name: name.trim(),
      orderNumber: orderNumber.trim(),
      email: email.trim(),
      bankAccount: bankAccount.trim(),
      returnedItems: returnedItems?.trim() || undefined,
    };

    // Customer confirmation
    try {
      await resend.emails.send({
        from: fromEmail,
        to: data.email,
        subject: WITHDRAWAL_EMAIL_SUBJECT,
        html: buildWithdrawalCustomerHtml(data, globalInfo, page?.returnAddress?.trim() || undefined),
        ...(internalEmail ? { replyTo: internalEmail } : {}),
      });
    } catch (err) {
      console.error('Withdrawal customer email failed:', err);
    }

    // Internal notification
    if (internalEmail) {
      const timestamp = new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
      try {
        await resend.emails.send({
          from: fromEmail,
          to: internalEmail,
          subject: `Odstoupení od smlouvy — objednávka ${data.orderNumber}`,
          html: buildWithdrawalInternalHtml(data, order, timestamp),
          replyTo: data.email,
        });
      } catch (err) {
        console.error('Withdrawal internal email failed:', err);
      }
    } else {
      console.warn('Withdrawal: no claimsEmail/email configured in Strapi Global Info');
    }
  }

  return NextResponse.json({ ok: true });
}

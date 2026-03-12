import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { STRAPI_URL } from '@/lib/constants';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { name, email, message } = body as { name?: string; email?: string; message?: string };

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Všechna pole jsou povinná' }, { status: 422 });
  }

  // 1. Save to Strapi
  const strapiRes = await fetch(`${STRAPI_URL}/api/contacts/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    body: JSON.stringify({ data: { name, email, message } }),
  });

  if (!strapiRes.ok) {
    console.error('Strapi contact save failed:', await strapiRes.text());
    return NextResponse.json({ error: 'Nepodařilo se uložit zprávu' }, { status: 500 });
  }

  // 2. Fetch recipient email from Strapi Global Info
  let toEmail: string | undefined;
  let senderFromEmail: string | undefined;
  try {
    const globalRes = await fetch(`${STRAPI_URL}/api/global-info`, {
      headers: {
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
    });
    if (globalRes.ok) {
      const globalData = await globalRes.json();
      toEmail = globalData?.data?.email;
      senderFromEmail = globalData?.data?.contactFromEmail;
    }
  } catch (err) {
    console.error('Failed to fetch global-info email:', err);
  }

  // 3. Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail =
    senderFromEmail ||
    process.env.RESEND_FROM_EMAIL ||
    'onboarding@resend.dev';

  if (resendKey && toEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `Nová zpráva z kontaktního formuláře od ${escapeHtml(name)}`,
        html: `
          <h2>Nová zpráva z kontaktního formuláře</h2>
          <p><strong>Jméno:</strong> ${escapeHtml(name)}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Zpráva:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        `,
        replyTo: email,
      });
    } catch (err) {
      console.error('Resend email failed:', err);
    }
  } else if (resendKey && !toEmail) {
    console.warn('Contact form: no recipient email configured in Strapi Global Info');
  }

  return NextResponse.json({ ok: true });
}

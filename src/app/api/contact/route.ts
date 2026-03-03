import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { name, email, message } }),
  });

  if (!strapiRes.ok) {
    console.error('Strapi contact save failed:', await strapiRes.text());
    return NextResponse.json({ error: 'Nepodařilo se uložit zprávu' }, { status: 500 });
  }

  // 2. Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const toEmail = process.env.RESEND_TO_EMAIL;

  if (resendKey && toEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `Nová zpráva z kontaktního formuláře od ${name}`,
        html: `
          <h2>Nová zpráva z kontaktního formuláře</h2>
          <p><strong>Jméno:</strong> ${name}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Zpráva:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
        replyTo: email,
      });
    } catch (err) {
      // Email failure is non-fatal — message is already saved in Strapi
      console.error('Resend email failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}

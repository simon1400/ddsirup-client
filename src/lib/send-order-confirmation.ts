import { Resend } from 'resend';
import { generateInvoicePdf } from './invoice-pdf';
import { buildOrderConfirmationHtml } from './email-templates/order-confirmation';
import { getGlobalInfo } from './strapi';
import type { Order } from '@/types/order';

import { STRAPI_URL } from './constants';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

/**
 * Upload PDF buffer to Strapi media library and link it to the order.
 */
async function uploadInvoicePdfToStrapi(
  pdfBuffer: Buffer,
  invoiceNumber: string,
  orderId: number
): Promise<void> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
  formData.append('files', blob, `faktura-${invoiceNumber}.pdf`);
  formData.append('ref', 'api::order.order');
  formData.append('refId', String(orderId));
  formData.append('field', 'invoicePdf');

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[upload] Failed to upload PDF to Strapi:', res.status, text);
  }
}

/**
 * Send order confirmation email with PDF invoice attached.
 * Also uploads the PDF to the order record in Strapi.
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  const globalInfo = await getGlobalInfo();
  if (!globalInfo) {
    throw new Error('GlobalInfo not found in Strapi');
  }

  const invoiceNumber = order.invoiceNumber;
  if (!invoiceNumber) {
    throw new Error(`Order ${order.orderNumber} has no invoiceNumber assigned`);
  }

  // Generate PDF and HTML in parallel
  const [pdfBuffer, htmlBody] = await Promise.all([
    generateInvoicePdf(order, globalInfo, invoiceNumber),
    Promise.resolve(buildOrderConfirmationHtml(order, globalInfo)),
  ]);

  // Send email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: globalInfo.orderFromEmail || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: order.customerEmail,
    subject: `Potvrzení objednávky ${order.orderNumber} — DD Sirup`,
    html: htmlBody,
    attachments: [
      {
        filename: `faktura-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  // Upload PDF to Strapi order (non-fatal)
  try {
    await uploadInvoicePdfToStrapi(pdfBuffer, invoiceNumber, order.id);
  } catch (err) {
    console.error('[send-order-confirmation] PDF upload to Strapi failed:', err);
  }
}

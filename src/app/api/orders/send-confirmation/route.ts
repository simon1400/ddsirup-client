import { NextRequest, NextResponse } from 'next/server';
import { getOrder, assignInvoiceNumber } from '@/lib/strapi';
import { sendOrderConfirmation } from '@/lib/send-order-confirmation';

/**
 * Internal API route called by Strapi lifecycle hook
 * when an admin manually changes order status to 'paid'.
 * Protected by a shared secret.
 */
export async function POST(req: NextRequest) {
  // Verify internal secret
  const secret = req.headers.get('x-internal-secret');
  if (!secret || secret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { documentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { documentId } = body;
  if (!documentId) {
    return NextResponse.json({ error: 'documentId required' }, { status: 400 });
  }

  try {
    // Assign invoice number (idempotent)
    const invoiceNumber = await assignInvoiceNumber(documentId);

    // Fetch full order with populated fields
    const order = await getOrder(documentId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderWithInvoice = { ...order, invoiceNumber };
    await sendOrderConfirmation(orderWithInvoice);

    console.log(
      `[send-confirmation] Email sent for order ${order.orderNumber}`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[send-confirmation] Error:', err);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}

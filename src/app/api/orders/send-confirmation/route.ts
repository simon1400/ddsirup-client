import { NextRequest, NextResponse } from 'next/server';
import { getOrder, assignInvoiceNumber } from '@/lib/strapi';
import { sendOrderConfirmation } from '@/lib/send-order-confirmation';
import { sendOrderPurchaseEvent } from '@/lib/facebook-capi';

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

    // Report the sale to Facebook (card payments go through the Comgate
    // webhook; bank transfers reach "paid" only via this manual admin path,
    // so without this they never hit CAPI). Deduplicated by event_id, so a
    // resend for an already-reported order is harmless. Non-fatal.
    try {
      await sendOrderPurchaseEvent(orderWithInvoice);
      console.log(`[send-confirmation] Facebook CAPI Purchase sent for order ${order.orderNumber}`);
    } catch (fbErr) {
      console.error('[send-confirmation] Failed to send Facebook CAPI Purchase:', fbErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[send-confirmation] Error:', err);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}

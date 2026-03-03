import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/comgate';
import {
  getOrderByNumber,
  updateOrderPayment,
  assignInvoiceNumber,
} from '@/lib/strapi';
import { sendOrderConfirmation } from '@/lib/send-order-confirmation';

/**
 * Comgate webhook handler
 * Comgate sends POST with application/x-www-form-urlencoded body
 * Fields: merchant, test, price, curr, label, refId, payerId, method,
 *         account, email, name, transId, secret, status, fee, vs
 */
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = Object.fromEntries(
      text.split('&').map((pair) => {
        const [key, ...rest] = pair.split('=');
        return [decodeURIComponent(key), decodeURIComponent(rest.join('='))];
      })
    );

    // Verify webhook authenticity
    if (!verifyWebhook(params)) {
      console.warn('[webhook] Invalid webhook - secret mismatch');
      return new NextResponse('DENIED', { status: 403 });
    }

    const { transId, refId, status } = params;

    // Map Comgate status to order status
    const orderStatusMap: Record<string, string> = {
      PAID: 'paid',
      CANCELLED: 'cancelled',
      AUTHORIZED: 'processing',
      PENDING: 'pending',
    };

    const orderStatus = orderStatusMap[status] ?? 'pending';

    // Find order by refId (order number)
    const order = await getOrderByNumber(refId);
    if (!order) {
      console.error(`[webhook] Order not found for refId: ${refId}`);
      return new NextResponse('ORDER_NOT_FOUND', { status: 404 });
    }

    // Update payment status in Strapi
    await updateOrderPayment(
      order.documentId,
      transId,
      status,
      orderStatus
    );

    console.log(`[webhook] Order ${refId} → ${status} (transId: ${transId})`);

    // Send confirmation email only when payment is PAID and wasn't already paid
    if (status === 'PAID' && order.orderStatus !== 'paid') {
      try {
        // Assign invoice number (idempotent — returns existing if already assigned)
        const invoiceNumber = await assignInvoiceNumber(order.documentId);
        const orderWithInvoice = { ...order, invoiceNumber };
        await sendOrderConfirmation(orderWithInvoice);
        console.log(`[webhook] Confirmation email sent for order ${refId}`);
      } catch (emailErr) {
        // Email failure is non-fatal — order is already updated
        console.error('[webhook] Failed to send confirmation email:', emailErr);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[webhook] Error:', err);
    return new NextResponse('ERROR', { status: 500 });
  }
}

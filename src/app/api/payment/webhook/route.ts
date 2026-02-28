import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook, getPaymentStatus } from '@/lib/comgate';
import { updateOrderPayment } from '@/lib/strapi';

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

    // Find order by refId (order number) and update
    // NOTE: You need to query Strapi to find the order by orderNumber, then update
    // This is a simplified implementation - enhance with order lookup
    console.log(`[webhook] Order ${refId} → ${status} (transId: ${transId})`);

    // TODO: Find order documentId by refId (orderNumber) in Strapi
    // const order = await findOrderByNumber(refId);
    // if (order) await updateOrderPayment(order.documentId, transId, status, orderStatus);

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[webhook] Error:', err);
    return new NextResponse('ERROR', { status: 500 });
  }
}

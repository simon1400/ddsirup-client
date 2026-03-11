import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/comgate';
import {
  getOrderByNumber,
  updateOrderPayment,
  assignInvoiceNumber,
  updateOrderTracking,
  getGlobalInfo,
} from '@/lib/strapi';
import { sendOrderConfirmation } from '@/lib/send-order-confirmation';
import { createMessengerShipment } from '@/lib/messenger';
import { getBottleWeight } from '@/lib/shipping';
import { MESSENGER_PACKAGE_MAX_KG, PACKAGING_WEIGHT_KG } from '@/lib/constants';

/**
 * Comgate webhook handler
 * Comgate sends POST with application/x-www-form-urlencoded body
 * Fields: merchant, test, price, curr, label, refId, payerId, method,
 *         account, email, name, transId, secret, status, fee, vs
 *
 * We respond OK immediately and process the order in the background
 * so Comgate doesn't time out.
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

    // Update payment status in Strapi (fast operation — do before responding)
    await updateOrderPayment(
      order.documentId,
      transId,
      status,
      orderStatus
    );

    console.log(`[webhook] Order ${refId} → ${status} (transId: ${transId})`);

    // Fire-and-forget: process email, invoice, messenger in background
    if (status === 'PAID' && order.orderStatus !== 'paid') {
      processOrderPaid(order, refId).catch((err) =>
        console.error(`[webhook] Background processing failed for ${refId}:`, err)
      );
    }

    // Respond immediately so Comgate doesn't time out
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[webhook] Error:', err);
    return new NextResponse('ERROR', { status: 500 });
  }
}

/**
 * Background processing for paid orders:
 * - Assign invoice number
 * - Send confirmation email with PDF
 * - Create Messenger shipment
 */
async function processOrderPaid(
  order: Awaited<ReturnType<typeof getOrderByNumber>> & {},
  refId: string
) {
  // 1. Assign invoice number + send email
  try {
    const invoiceNumber = await assignInvoiceNumber(order.documentId);
    const orderWithInvoice = { ...order, invoiceNumber };
    await sendOrderConfirmation(orderWithInvoice);
    console.log(`[webhook] Confirmation email sent for order ${refId}`);
  } catch (emailErr) {
    console.error('[webhook] Failed to send confirmation email:', emailErr);
  }

  // 2. Create Messenger shipment
  try {
    const globalInfo = await getGlobalInfo();
    const shippingAddr = order.shippingAddress ?? order.billingAddress;
    const totalWeight = order.items.reduce(
      (sum, item) => sum + getBottleWeight(item.variantVolume) * item.quantity,
      0,
    );
    const packageCount = Math.max(1, Math.ceil(totalWeight / MESSENGER_PACKAGE_MAX_KG));
    const weightWithPackaging = totalWeight + packageCount * PACKAGING_WEIGHT_KG;

    const shipment = await createMessengerShipment({
      deliveryAddress: shippingAddr,
      customerName: `${order.customerFirstName} ${order.customerLastName}`,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      weightKg: weightWithPackaging,
      packageCount,
      orderNumber: order.orderNumber,
      notes: order.notes,
      testMode: globalInfo?.messengerTestMode,
    });

    await updateOrderTracking(order.documentId, {
      messengerShipmentId: shipment.shipmentId,
      messengerTrackingCode: shipment.trackingCode,
      messengerTrackingUrl: shipment.trackingUrl,
    });
    console.log(`[webhook] Messenger shipment created for order ${refId}: ${shipment.trackingCode}`);
  } catch (messengerErr) {
    console.error('[webhook] Failed to create Messenger shipment:', messengerErr);
  }
}

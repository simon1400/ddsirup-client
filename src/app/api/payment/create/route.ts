import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/comgate';
import {
  createOrder,
  incrementCouponUsage,
  assignInvoiceNumber,
  getOrder,
  getGlobalInfo,
  updateOrderTracking,
} from '@/lib/strapi';
import { sendOrderConfirmation } from '@/lib/send-order-confirmation';
import { createMessengerShipment } from '@/lib/messenger';
import { getBottleWeight } from '@/lib/shipping';
import { MESSENGER_PACKAGE_MAX_KG } from '@/lib/constants';
import type { CreateOrderPayload } from '@/types/order';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateOrderPayload;

    // 1. Create order in Strapi
    const initialStatus = body.paymentMethod === 'TEST' ? 'paid' : 'pending';
    const order = await createOrder({
      ...body,
      orderStatus: initialStatus,
    });

    // 2. Increment coupon usage if a coupon was applied
    if (body.couponCode) {
      await incrementCouponUsage(body.couponCode).catch((err) =>
        console.error('[payment/create] Failed to increment coupon usage:', err)
      );
    }

    // 3. Skip Comgate for test payment method — set status to 'paid' immediately
    if (body.paymentMethod === 'TEST') {
      try {
        const invoiceNumber = await assignInvoiceNumber(order.documentId);
        const fullOrder = await getOrder(order.documentId);
        if (fullOrder) {
          await sendOrderConfirmation({ ...fullOrder, invoiceNumber });
        }
      } catch (emailErr) {
        console.error('[payment/create] TEST email failed:', emailErr);
      }

      // Create Messenger shipment for test orders (non-fatal)
      try {
        const shippingAddr = body.shippingAddress ?? body.billingAddress;
        const totalWeight = body.items.reduce(
          (sum, item) => sum + getBottleWeight(item.variantVolume) * item.quantity,
          0,
        );
        const packageCount = Math.max(1, Math.ceil(totalWeight / MESSENGER_PACKAGE_MAX_KG));

        const shipment = await createMessengerShipment({
          deliveryAddress: shippingAddr,
          customerName: `${body.customerFirstName} ${body.customerLastName}`,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail,
          weightKg: totalWeight,
          packageCount,
          orderNumber: body.orderNumber,
          notes: body.notes,
        });

        await updateOrderTracking(order.documentId, {
          messengerShipmentId: shipment.shipmentId,
          messengerTrackingCode: shipment.trackingCode,
          messengerTrackingUrl: shipment.trackingUrl,
        });
        console.log(`[payment/create] TEST Messenger shipment: ${shipment.trackingCode}`);
      } catch (messengerErr) {
        console.error('[payment/create] TEST Messenger shipment failed:', messengerErr);
      }

      return NextResponse.json({
        orderId: order.documentId,
        orderNumber: body.orderNumber,
      });
    }

    // 4. Create Comgate payment
    const globalInfo = await getGlobalInfo();
    const payment = await createPayment({
      price: Math.round(body.total * 100), // to cents
      curr: body.currency || 'CZK',
      label: body.orderNumber.slice(0, 16),
      refId: body.orderNumber,
      email: body.customerEmail,
      method: body.paymentMethod ?? 'ALL',
      returnUrl: `${BASE_URL}/pokladna/uspech?order=${body.orderNumber}`,
      cancelUrl: `${BASE_URL}/pokladna?cancelled=1`,
      notifUrl: `${BASE_URL}/api/payment/webhook`,
      test: globalInfo?.comgateTestMode,
    });

    if (payment.code !== '0') {
      return NextResponse.json(
        { error: `Comgate: ${payment.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderId: order.documentId,
      orderNumber: body.orderNumber,
      transId: payment.transId,
      redirect: payment.redirect,
    });
  } catch (err) {
    console.error('[payment/create]', err);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}

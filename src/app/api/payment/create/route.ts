import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/comgate';
import {
  createOrder,
  incrementCouponUsage,
  getGlobalInfo,
} from '@/lib/strapi';
import type { CreateOrderPayload } from '@/types/order';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateOrderPayload;

    // 1. Create order in Strapi
    const order = await createOrder({
      ...body,
      orderStatus: 'pending',
    });

    // 2. Increment coupon usage if a coupon was applied
    if (body.couponCode) {
      await incrementCouponUsage(body.couponCode).catch((err) =>
        console.error('[payment/create] Failed to increment coupon usage:', err)
      );
    }

    // 3. Create Comgate payment
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

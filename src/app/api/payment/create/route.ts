import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/comgate';
import { createOrder } from '@/lib/strapi';
import type { CreateOrderPayload } from '@/types/order';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateOrderPayload;

    // 1. Create order in Strapi (status: pending)
    const order = await createOrder({
      ...body,
      status: 'pending',
    });

    // 2. Create Comgate payment
    const payment = await createPayment({
      price: Math.round(body.total * 100), // to cents
      curr: body.currency || 'CZK',
      label: body.orderNumber.slice(0, 16),
      refId: body.orderNumber,
      email: body.customerEmail,
      returnUrl: `${BASE_URL}/checkout/success?order=${body.orderNumber}&transId=PLACEHOLDER`,
      cancelUrl: `${BASE_URL}/checkout?cancelled=1`,
      notifUrl: `${BASE_URL}/api/payment/webhook`,
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

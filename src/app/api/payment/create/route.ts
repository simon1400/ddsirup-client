import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/comgate';
import {
  createOrder,
  incrementCouponUsage,
  getGlobalInfo,
} from '@/lib/strapi';
import { computeAuthoritativeOrder, OrderPricingError } from '@/lib/order-pricing';
import type { CreateOrderPayload } from '@/types/order';
import { SITE_URL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateOrderPayload;

    // 1. Recompute all monetary values server-side from authoritative Strapi
    //    data. Client-sent prices / shipping / discount / total are ignored —
    //    they cannot be trusted (a tampered request could otherwise pay less).
    const priced = await computeAuthoritativeOrder({
      items: body.items,
      couponCode: body.couponCode,
    });

    // 2. Capture Facebook attribution cookies so the server-side CAPI
    //    Purchase (fired from the webhook, where the browser is absent) can
    //    still be matched to the ad click. Without _fbc/_fbp the purchase
    //    lands as an unattributed server event.
    const fbp = req.cookies.get('_fbp')?.value;
    const fbc = req.cookies.get('_fbc')?.value;

    // 3. Create order in Strapi with the verified figures.
    const order = await createOrder({
      ...body,
      items: priced.items,
      subtotal: priced.subtotal,
      shippingCost: priced.shippingCost,
      totalWeight: priced.totalWeight,
      total: priced.total,
      couponCode: priced.couponCode,
      discountAmount: priced.discountAmount > 0 ? priced.discountAmount : undefined,
      orderStatus: 'pending',
      fbp,
      fbc,
    });

    // 4. Increment coupon usage only if the coupon was actually valid & applied.
    if (priced.couponCode) {
      await incrementCouponUsage(priced.couponCode).catch((err) =>
        console.error('[payment/create] Failed to increment coupon usage:', err)
      );
    }

    // 5. Create Comgate payment for the verified total.
    const globalInfo = await getGlobalInfo();
    const payment = await createPayment({
      price: Math.round(priced.total * 100), // to cents
      curr: body.currency || 'CZK',
      label: body.orderNumber.slice(0, 16),
      refId: body.orderNumber,
      email: body.customerEmail,
      method: body.paymentMethod ?? 'ALL',
      returnUrl: `${SITE_URL}/pokladna/uspech?order=${body.orderNumber}`,
      cancelUrl: `${SITE_URL}/pokladna?cancelled=1`,
      notifUrl: `${SITE_URL}/api/payment/webhook`,
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
    if (err instanceof OrderPricingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[payment/create]', err);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}

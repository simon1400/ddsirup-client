import { NextRequest, NextResponse } from 'next/server';
import { resolveCartLines, cartLineIssueMessage } from '@/lib/order-pricing';
import { cartLineKey, type CartLineRef, type CartValidationResponse } from '@/lib/cart-validation';

/**
 * Re-checks a persisted cart against live Strapi data so the customer learns
 * about a sold-out item on /kosik instead of at the payment gateway. This is a
 * UX layer only — the binding check runs again in /api/payment/create.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { items?: CartLineRef[] };
    const lines = (body.items ?? []).filter((l) => typeof l?.productSlug === 'string');

    if (!lines.length) {
      return NextResponse.json<CartValidationResponse>({ items: [] });
    }

    const resolved = await resolveCartLines(lines);

    return NextResponse.json<CartValidationResponse>({
      items: resolved.map((line, idx) => {
        const key = cartLineKey(lines[idx]);
        return line.ok
          ? {
              key,
              available: true,
              unitPrice: line.unitPrice,
              productName: line.productName,
            }
          : {
              key,
              available: false,
              issue: line.issue,
              message: cartLineIssueMessage(line),
              productName: line.productName,
            };
      }),
    });
  } catch (err) {
    console.error('[cart/validate]', err);
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
}

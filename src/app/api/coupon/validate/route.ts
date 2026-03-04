import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/strapi';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Neplatný požadavek' },
        { status: 400 }
      );
    }

    const coupon = await validateCoupon(code, subtotal);
    return NextResponse.json({ data: coupon });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Neplatný kupón';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

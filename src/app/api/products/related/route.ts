import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/strapi';

/**
 * Newest products for the "Související produkty" block on /kosik.
 *
 * Proxied rather than fetched from the browser: NEXT_PUBLIC_STRAPI_URL points
 * at the server-local Strapi (http://localhost:1340 in production), which the
 * visitor's browser cannot reach. Same reason the coupon and search endpoints
 * are proxied.
 */
export async function GET() {
  try {
    const { data } = await getProducts({ pageSize: 4, locale: 'cs' });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[products/related]', err);
    return NextResponse.json([], { status: 200 });
  }
}

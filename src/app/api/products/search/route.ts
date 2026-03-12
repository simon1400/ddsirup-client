import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/strapi';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const { data } = await getProducts({
    search: q,
    pageSize: 6,
    locale: 'cs',
  });

  const suggestions = data.map((p) => ({
    name: p.name,
    slug: p.slug,
    categorySlug: p.category?.slug ?? null,
    price: p.price,
    image: p.images?.[0]?.formats?.thumbnail?.url ?? p.images?.[0]?.url ?? null,
  }));

  return NextResponse.json(suggestions);
}

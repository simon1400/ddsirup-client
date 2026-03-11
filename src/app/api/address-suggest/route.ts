import { NextRequest, NextResponse } from 'next/server';

const MAPY_API_KEY = process.env.MAPY_CZ_API_KEY;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json({ items: [] });
  }

  if (!MAPY_API_KEY) {
    return NextResponse.json({ error: 'Mapy.cz API key not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    query,
    lang: 'cs',
    limit: '5',
    type: 'regional.address',
    apikey: MAPY_API_KEY,
  });

  const res = await fetch(`https://api.mapy.cz/v1/suggest?${params}`, {
    headers: { accept: 'application/json' },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Chyba při komunikaci s Mapy.cz' }, { status: 502 });
  }

  const data = await res.json();

  const items = (data.items || []).map((item: Record<string, unknown>) => {
    const regional = (item.regionalStructure as Array<{ type: string; name: string }>) || [];

    const find = (type: string) => regional.find((r) => r.type === type)?.name || '';

    return {
      label: item.label as string,
      name: item.name as string,
      street: find('regional.street'),
      houseNumber: (item.name as string).replace(find('regional.street'), '').trim(),
      city: find('regional.municipality'),
      cityPart: find('regional.municipality_part'),
      zip: (item.zip as string) || '',
    };
  });

  return NextResponse.json({ items });
}

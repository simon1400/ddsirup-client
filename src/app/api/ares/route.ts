import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ico = req.nextUrl.searchParams.get('ico');

  if (!ico || !/^\d{8}$/.test(ico)) {
    return NextResponse.json({ error: 'Neplatné IČO (musí mít 8 číslic)' }, { status: 400 });
  }

  const res = await fetch(
    `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
    { next: { revalidate: 3600 } },
  );

  if (res.status === 404) {
    return NextResponse.json({ error: 'Subjekt nebyl nalezen v ARES' }, { status: 404 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Chyba při komunikaci s ARES' }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

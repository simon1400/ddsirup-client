import type { Address } from '@/types/order';

const MESSENGER_API_URL_PROD = 'https://api.messenger.cz/MessengerWeb/PublicREST/JSON';
const MESSENGER_API_URL_TEST = 'https://api-test.messenger.cz/MessengerWeb/PublicREST/JSON';
const MESSENGER_IMPORT_KEY = process.env.MESSENGER_IMPORT_KEY ?? '';
const MESSENGER_CUSTOMER_NUMBER = process.env.MESSENGER_CUSTOMER_NUMBER ?? '';
const MESSENGER_PASSWORD = process.env.MESSENGER_PASSWORD ?? '';

// Pickup address — set these to your warehouse/store address
const PICKUP_STREET = process.env.MESSENGER_PICKUP_STREET ?? '';
const PICKUP_HOUSE_NUMBER = process.env.MESSENGER_PICKUP_HOUSE_NUMBER ?? '';
const PICKUP_CITY = process.env.MESSENGER_PICKUP_CITY ?? '';
const PICKUP_ZIP = process.env.MESSENGER_PICKUP_ZIP ?? '';
const PICKUP_CONTACT = process.env.MESSENGER_PICKUP_CONTACT ?? '';
const PICKUP_PHONE = process.env.MESSENGER_PICKUP_PHONE ?? '';
const MESSENGER_SHIPPING_TYPE = process.env.MESSENGER_SHIPPING_TYPE ?? '';

export interface MessengerShipmentResult {
  shipmentId: string;
  trackingCode: string;
  trackingUrl: string;
}

/**
 * Split a street address like "Ulice 123" into street name and house number.
 */
function splitStreetAndNumber(street: string): { streetName: string; houseNumber: string } {
  const match = street.match(/^(.+?)\s+(\d+\S*)$/);
  if (match) return { streetName: match[1], houseNumber: match[2] };
  return { streetName: street, houseNumber: '' };
}

/**
 * Create a shipment in Messenger via their PublicREST importer API.
 * Uses parameter-based auth (customerNumber + password in body).
 */
export async function createMessengerShipment(params: {
  deliveryAddress: Address;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  weightKg: number;
  packageCount: number;
  orderNumber: string;
  notes?: string;
  testMode?: boolean;
}): Promise<MessengerShipmentResult> {
  const isTest = params.testMode ?? false;
  const apiUrl = isTest ? MESSENGER_API_URL_TEST : MESSENGER_API_URL_PROD;
  const { streetName, houseNumber } = splitStreetAndNumber(params.deliveryAddress.street);

  // Per-package weights via the `baliky` field. The label printed by Messenger
  // shows the package weight from this field — without it every package
  // defaults to 1 kg (the top-level `hmotnost` is only the order total and is
  // NOT used on labels). Format per docs: "weight,length,width,height;" per
  // package, weight mandatory as an integer rounded UP to the nearest kg.
  const packageCount = Math.max(1, params.packageCount);
  const perPackageKg = Math.max(1, Math.ceil(params.weightKg / packageCount));
  const baliky = `${perPackageKg},,,;`.repeat(packageCount);

  const payload = {
    // Auth (parameter-based, no HTTP Basic Auth)
    customerNumber: Number(MESSENGER_CUSTOMER_NUMBER),
    password: MESSENGER_PASSWORD,
    importKey: MESSENGER_IMPORT_KEY,

    // Pickup (warehouse)
    ulice_odkud: PICKUP_STREET,
    cislo_domu_odkud: PICKUP_HOUSE_NUMBER,
    mesto_odkud: PICKUP_CITY,
    psc_odkud: PICKUP_ZIP,
    kontaktni_osoba_odkud: PICKUP_CONTACT,
    telefon_odkud: PICKUP_PHONE,

    // Delivery
    ulice_kam: streetName,
    cislo_domu_kam: houseNumber,
    mesto_kam: params.deliveryAddress.city,
    psc_kam: params.deliveryAddress.zip.replace(/\s/g, ''),
    kontaktni_osoba_kam: params.customerName,
    telefon_kam: params.customerPhone ?? '',
    email: params.customerEmail ?? '',
    firma_kam: params.deliveryAddress.company ?? '',

    // Shipment details
    dobirka: 0, // no cash-on-delivery
    typ_prepravy: Number(MESSENGER_SHIPPING_TYPE),
    hmotnost: Number(params.weightKg.toFixed(1)),
    pocet_kusu: params.packageCount,
    baliky,
    kod_zasilky: params.orderNumber,
    poznamka_kam: params.notes ?? '',
  };

  const url = `${apiUrl}/importParcel`;
  console.log(`[messenger] POST ${url}`, JSON.stringify(payload, null, 2));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[messenger] HTTP ${res.status}: ${text}`);
    throw new Error(`Messenger API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[messenger] Response:', JSON.stringify(data, null, 2));

  if (!data.success) {
    const authOk = data.authentification?.success;
    const keyOk = data.importKey?.success;
    const pairsOk = data.pairs?.success;
    const errors = data.dataErrors?.join(', ') ?? 'Unknown error';
    console.error(`[messenger] Import failed — auth:${authOk} key:${keyOk} pairs:${pairsOk} errors:${errors}`);
    throw new Error(`Messenger import failed: ${errors}`);
  }

  return {
    shipmentId: String(data.ids?.[0] ?? ''),
    trackingCode: data.trackingCodes?.[0] ?? '',
    trackingUrl: data.trackingURL ?? '',
  };
}

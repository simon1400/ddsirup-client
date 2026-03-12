import type { Address } from '@/types/order';

const MESSENGER_API_URL_PROD = 'https://api.messenger.cz/MessengerWeb/api/json';
const MESSENGER_API_URL_TEST = 'https://api-test.messenger.cz/MessengerWeb/API/REST/public/json';
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
 * Create a shipment in Messenger via their REST importer API.
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

  const payload = {
    customerNumber: MESSENGER_CUSTOMER_NUMBER,
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
    typ_prepravy: MESSENGER_SHIPPING_TYPE,
    hmotnost: params.weightKg.toFixed(1),
    pocet_kusu: params.packageCount,
    kod_zasilky: params.orderNumber,
    poznamka_kam: params.notes ?? '',
  };

  const basicAuth = Buffer.from(`${MESSENGER_CUSTOMER_NUMBER}:${MESSENGER_PASSWORD}`).toString('base64');

  const res = await fetch(`${apiUrl}/import/importParcel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Messenger API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const result = data.importResult;

  if (!result?.success) {
    const errors = result?.dataErrors?.join(', ') ?? 'Unknown error';
    throw new Error(`Messenger import failed: ${errors}`);
  }

  return {
    shipmentId: String(result.ids?.[0] ?? ''),
    trackingCode: result.trackingCodes?.[0] ?? '',
    trackingUrl: result.trackingURL ?? '',
  };
}

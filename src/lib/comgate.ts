/**
 * Comgate payment gateway integration
 * Docs: https://help.comgate.cz/v1/docs
 */

const COMGATE_URL = 'https://payments.comgate.cz/v1.0';
const MERCHANT = process.env.COMGATE_MERCHANT ?? '';
const SECRET = process.env.COMGATE_SECRET ?? '';

export interface ComgateCreateParams {
  price: number; // in cents (Kč * 100)
  curr: string; // e.g. 'CZK'
  label: string; // max 16 chars
  refId: string; // your order number
  email: string; // customer email
  method?: string; // payment method, 'ALL' = all methods
  country?: string; // e.g. 'CZ'
  lang?: string; // e.g. 'cs'
  prepareOnly?: boolean;
  returnUrl: string;
  cancelUrl: string;
  notifUrl: string;
}

export interface ComgateCreateResponse {
  code: string;
  message: string;
  transId?: string;
  redirect?: string;
}

export interface ComgateStatusResponse {
  code: string;
  message: string;
  merchant: string;
  test: string;
  price: string;
  curr: string;
  label: string;
  refId: string;
  payerId: string;
  method: string;
  account: string;
  email: string;
  name: string;
  transId: string;
  secret: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'AUTHORIZED';
  fee: string;
  vs: string;
}

function buildForm(params: Record<string, string | number | boolean>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function parseResponse(text: string): Record<string, string> {
  return Object.fromEntries(
    text.split('&').map((pair) => {
      const [key, ...rest] = pair.split('=');
      return [safeDecode(key), safeDecode(rest.join('='))];
    })
  );
}

export async function createPayment(
  params: ComgateCreateParams & { test?: boolean }
): Promise<ComgateCreateResponse> {
  const testMode = params.test ?? process.env.COMGATE_TEST === 'true';
  const body = buildForm({
    merchant: MERCHANT,
    secret: SECRET,
    price: params.price,
    curr: params.curr,
    label: params.label.slice(0, 16),
    refId: params.refId,
    email: params.email,
    method: params.method ?? 'ALL',
    country: params.country ?? 'CZ',
    lang: params.lang ?? 'cs',
    prepareOnly: params.prepareOnly ? 'true' : 'false',
    returnUrl: params.returnUrl,
    cancelUrl: params.cancelUrl,
    notifUrl: params.notifUrl,
    test: testMode ? 'true' : 'false',
  });

  const res = await fetch(`${COMGATE_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const text = await res.text();
  const data = parseResponse(text);

  return {
    code: data.code,
    message: data.message,
    transId: data.transId,
    redirect: data.redirect,
  };
}

export async function getPaymentStatus(
  transId: string
): Promise<ComgateStatusResponse> {
  const body = buildForm({ merchant: MERCHANT, secret: SECRET, transId });

  const res = await fetch(`${COMGATE_URL}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const text = await res.text();
  return parseResponse(text) as unknown as ComgateStatusResponse;
}

/** Verify webhook notification from Comgate */
export function verifyWebhook(params: Record<string, string>): boolean {
  // Comgate sends: merchant, test, price, curr, label, refId, payerId, method,
  // account, email, name, transId, secret, status, fee, vs
  return params.merchant === MERCHANT && params.secret === SECRET;
}

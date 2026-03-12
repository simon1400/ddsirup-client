import type { Order } from '@/types/order';
import type { GlobalInfo } from '@/types/global-info';
import { getPaymentLabel, formatPriceFixed, formatDate, getShippingLabel, getStrapiImageUrl } from '@/lib/utils';
import { SITE_URL } from '@/lib/constants';

export function buildOrderConfirmationHtml(
  order: Order,
  globalInfo: GlobalInfo
): string {
  const vatRate = (globalInfo.vatRate ?? 12) / 100;
  const vatPercent = globalInfo.vatRate ?? 12;
  const taxableTotal = order.subtotal - (order.discountAmount ?? 0) + (order.shippingCost ?? 0);
  const vatAmount = taxableTotal - taxableTotal / (1 + vatRate);
  const logoUrl = `${SITE_URL}/logo.png`;
  const orderDate = formatDate(order.createdAt);

  // Build items HTML
  const itemsHtml = order.items
    .map((item) => {
      const thumbUrl = getStrapiImageUrl(item.thumbnail) ?? '';
      const thumbHtml = thumbUrl
        ? `<td style="width:48px;padding:12px 12px 12px 0;vertical-align:middle;">
            <img src="${thumbUrl}" alt="" width="48" height="48" style="display:block;border-radius:6px;object-fit:cover;" />
          </td>`
        : `<td style="width:48px;padding:12px 12px 12px 0;"></td>`;

      const variantText = item.variantName ? ` - ${item.variantName}` : '';

      return `
        <tr>
          ${thumbHtml}
          <td style="padding:12px 0;vertical-align:middle;color:#ffffff;font-size:14px;">
            ${item.productName}${variantText}
          </td>
          <td style="padding:12px 0;vertical-align:middle;color:#aaaaaa;font-size:14px;text-align:center;white-space:nowrap;">
            &times;${item.quantity}
          </td>
          <td style="padding:12px 0;vertical-align:middle;color:#ffffff;font-size:14px;text-align:right;font-weight:600;white-space:nowrap;">
            ${formatPriceFixed(item.totalPrice)}
          </td>
        </tr>`;
    })
    .join('');

  // Discount row
  const discountHtml =
    order.discountAmount && order.discountAmount > 0
      ? `<tr>
          <td style="padding:4px 0;color:#4ade80;font-size:14px;">Sleva${order.couponCode ? ` (${order.couponCode})` : ''}</td>
          <td style="padding:4px 0;color:#4ade80;font-size:14px;text-align:right;">-${formatPriceFixed(order.discountAmount)}</td>
        </tr>`
      : '';

  // Notes section
  const notesHtml = order.notes
    ? `<tr><td colspan="2" style="padding:20px 0 0 0;">
        <div style="border-top:1px solid #333333;padding-top:16px;">
          <p style="margin:0 0 4px 0;font-weight:700;font-size:14px;color:#ffffff;">Poznámky zákazníka</p>
          <p style="margin:0;font-size:14px;color:#cccccc;">${order.notes}</p>
        </div>
      </td></tr>`
    : '';

  // ForChildren / ForBar
  const preferencesHtml = `
    <tr><td colspan="2" style="padding:16px 0 0 0;">
      <div style="border-top:1px solid #333333;padding-top:16px;">
        <p style="margin:0 0 4px 0;font-size:14px;color:#ffffff;"><strong>Nakupuji pro děti?:</strong> ${order.customerForChildren ? 'Ano' : 'Ne'}</p>
        <p style="margin:0;font-size:14px;color:#ffffff;"><strong>Nakupuji pro bar?:</strong> ${order.customerForBar ? 'Ano' : 'Ne'}</p>
      </div>
    </td></tr>`;

  // Billing address
  const billing = order.billingAddress;
  const addressLines = [
    `${order.customerFirstName} ${order.customerLastName}`,
    billing.company ?? '',
    billing.street,
    billing.streetLine2 ?? '',
    `${billing.zip} ${billing.city}`,
    billing.country || 'Česká republika',
    order.customerPhone ? `<a href="tel:${order.customerPhone}" style="color:#E07878;text-decoration:none;">${order.customerPhone}</a>` : '',
    order.customerEmail,
  ]
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 2px 0;font-size:14px;color:#cccccc;">${line}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Potvrzení objednávky</title>
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;">
    <tr>
      <td align="center" style="padding:20px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1a1a1a;border-radius:12px;overflow:hidden;">

          <!-- Logo header -->
          <tr>
            <td style="padding:24px 32px 16px 32px;">
              <img src="${logoUrl}" alt="Doe &amp; Deer Sirup" height="40" style="display:block;height:40px;width:auto;" />
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:0 32px 8px 32px;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">
                Děkujeme Vám za objednávku
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:8px 32px 0 32px;">
              <p style="margin:0 0 8px 0;font-size:15px;color:#cccccc;">
                Dobrý den, ${order.customerFirstName},
              </p>
              <p style="margin:0 0 8px 0;font-size:15px;color:#cccccc;">
                Rádi bychom vám oznámili — vaši objednávku jsme obdrželi a nyní ji zpracováváme.
              </p>
              <p style="margin:0;font-size:15px;color:#cccccc;">
                Zde je přehled toho, co jste si objednali:
              </p>
            </td>
          </tr>

          <!-- Order recap heading -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <h2 style="margin:0 0 4px 0;font-size:20px;font-weight:700;color:#ffffff;">
                Rekapitulace objednávky
              </h2>
              <p style="margin:0;font-size:14px;color:#E07878;">
                Objednávka č. ${order.orderNumber} (${orderDate})
              </p>
            </td>
          </tr>

          <!-- Items table header -->
          <tr>
            <td style="padding:16px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr style="border-bottom:1px solid #333333;">
                  <td style="padding:0 0 8px 0;font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;" colspan="2">Produkt</td>
                  <td style="padding:0 0 8px 0;font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Množství</td>
                  <td style="padding:0 0 8px 0;font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Cena</td>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:8px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #333333;">
                <tr>
                  <td style="padding:12px 0 4px 0;color:#aaaaaa;font-size:14px;">Mezisoučet:</td>
                  <td style="padding:12px 0 4px 0;color:#ffffff;font-size:14px;text-align:right;font-weight:600;">${formatPriceFixed(order.subtotal)}</td>
                </tr>
                ${discountHtml}
                <tr>
                  <td style="padding:4px 0;color:#aaaaaa;font-size:14px;">Doprava (Messenger):</td>
                  <td style="padding:4px 0;color:#ffffff;font-size:14px;text-align:right;font-weight:600;">${formatPriceFixed(order.shippingCost ?? 0)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0 4px 0;font-size:16px;font-weight:700;color:#ffffff;">Cena celkem:</td>
                  <td style="padding:8px 0 4px 0;font-size:20px;font-weight:700;color:#E07878;text-align:right;">${formatPriceFixed(order.total)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 0 4px 0;font-size:13px;color:#888888;text-align:right;">
                    (včetně ${formatPriceFixed(vatAmount)} ${vatPercent}% DPH)
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#aaaaaa;font-size:14px;">Způsob platby:</td>
                  <td style="padding:4px 0;color:#ffffff;font-size:14px;text-align:right;">${getPaymentLabel(order.paymentMethod)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notes -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${notesHtml}
              </table>
            </td>
          </tr>

          <!-- Preferences -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${preferencesHtml}
              </table>
            </td>
          </tr>

          <!-- Billing address -->
          <tr>
            <td style="padding:16px 32px 0 32px;">
              <div style="border-top:1px solid #333333;padding-top:16px;">
                <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#ffffff;">Fakturační adresa</p>
                ${addressLines}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 32px 24px 32px;">
              <div style="border-top:1px solid #333333;padding-top:20px;text-align:center;">
                <p style="margin:0;font-size:13px;color:#E07878;">
                  Děkujeme! Pokud potřebujete s objednávkou pomoci, kontaktujte nás na
                  <a href="mailto:objednavky@ddsirup.co" style="color:#E07878;text-decoration:underline;">objednavky@ddsirup.co</a>.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

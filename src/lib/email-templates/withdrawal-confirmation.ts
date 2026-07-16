import type { Order } from '@/types/order';
import type { GlobalInfo } from '@/types/global-info';
import { formatPriceFixed, formatDate } from '@/lib/utils';

export interface WithdrawalRequestData {
  name: string;
  orderNumber: string;
  email: string;
  bankAccount?: string;
  returnedItems?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const LOGO_URL =
  'https://ik.imagekit.io/vkkv0buihc/doe_deer_napis_bile_d7a7a96308_nOopqct0T.svg?f=png&w=400';

export const WITHDRAWAL_EMAIL_SUBJECT =
  'Potvrzení o přijetí odstoupení od smlouvy – ddsirup.co';

export const DEFAULT_RETURN_ADDRESS = 'Doe&Deer.co s.r.o., Lafayetova 49/5, 779 00 Olomouc';

const EMAIL_INTRO =
  'děkujeme, vaše odstoupení od kupní smlouvy jsme v pořádku přijali. Níže najdete shrnutí žádosti a pokyny k vrácení zboží.';

function buildInstructions(returnAddress: string, bankAccount?: string): string {
  const refundMethod = bankAccount
    ? `bankovním převodem na účet <strong>${escapeHtml(bankAccount)}</strong>`
    : 'stejným způsobem, jakým jste provedli platbu';
  return `
    <p style="margin:0 0 8px 0;"><strong>Jak postupovat:</strong></p>
    <ol style="margin:0;padding-left:20px;">
      <li style="margin-bottom:8px;">Zboží zabalte tak, aby nedošlo k jeho poškození. Vrátit lze pouze <strong>neotevřené zboží v původním obalu</strong> — zboží s porušeným uzávěrem nemůžeme dle § 1837 písm. g) občanského zákoníku přijmout.</li>
      <li style="margin-bottom:8px;">Zboží zašlete do 14 dnů od odeslání odstoupení na adresu: <strong>${escapeHtml(returnAddress)}</strong>. Náklady na zaslání vráceného zboží nesete vy.</li>
      <li>Peníze včetně původního poštovného (ve výši nejlevnějšího nabízeného způsobu dodání) vám vrátíme nejpozději do <strong>14 dnů</strong> od odstoupení od smlouvy ${refundMethod}, ne však dříve, než nám zboží předáte nebo prokážete jeho odeslání.</li>
    </ol>`;
}

function summaryRows(data: WithdrawalRequestData): string {
  const rows: Array<[string, string]> = [
    ['Jméno a příjmení', data.name],
    ['Číslo objednávky', data.orderNumber],
    ['E-mail', data.email],
    [
      'Vrácení peněz',
      data.bankAccount
        ? `Bankovním převodem na účet ${data.bankAccount}`
        : 'Původní platební metodou',
    ],
  ];
  if (data.returnedItems) {
    rows.push(['Vracené zboží', data.returnedItems]);
  }
  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:#aaaaaa;font-size:14px;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:6px 0;color:#ffffff;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');
}

export function buildWithdrawalCustomerHtml(
  data: WithdrawalRequestData,
  globalInfo: GlobalInfo,
  returnAddress: string = DEFAULT_RETURN_ADDRESS
): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr><td align="center" style="padding-bottom:28px;">
          <img src="${LOGO_URL}" alt="Doe &amp; Deer" width="200" style="display:block;" />
        </td></tr>

        <tr><td style="background-color:#242424;border-radius:16px;padding:32px;">
          <h1 style="margin:0 0 16px 0;color:#ffffff;font-size:22px;">Potvrzení o přijetí odstoupení od smlouvy</h1>
          <p style="margin:0 0 24px 0;color:#cccccc;font-size:14px;line-height:1.6;">
            Dobrý den, ${escapeHtml(data.name)},<br />${EMAIL_INTRO}
          </p>

          <div style="border-top:1px solid #333333;padding-top:20px;margin-bottom:24px;">
            <p style="margin:0 0 8px 0;color:#E8635A;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Shrnutí žádosti</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              ${summaryRows(data)}
            </table>
          </div>

          <div style="border-top:1px solid #333333;padding-top:20px;color:#cccccc;font-size:14px;line-height:1.6;">
            ${buildInstructions(returnAddress, data.bankAccount)}
          </div>
        </td></tr>

        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;color:#777777;font-size:12px;line-height:1.6;">
            ${escapeHtml(globalInfo.companyName ?? 'Doe & Deer.co s.r.o.')}${globalInfo.street ? ` &bull; ${escapeHtml(globalInfo.street)}` : ''}${globalInfo.city ? `, ${escapeHtml(globalInfo.city)}` : ''}<br />
            V případě dotazů nás kontaktujte na ${escapeHtml(globalInfo.email ?? 'info@ddsirup.co')}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildWithdrawalInternalHtml(
  data: WithdrawalRequestData,
  order: Order | null,
  timestamp: string
): string {
  const orderHtml = order
    ? `
      <h3 style="margin:24px 0 8px 0;">Objednávka nalezena v systému</h3>
      <p style="margin:0;line-height:1.7;">
        <strong>Číslo objednávky:</strong> ${escapeHtml(order.orderNumber)}<br />
        ${order.invoiceNumber ? `<strong>Číslo faktury:</strong> ${escapeHtml(order.invoiceNumber)}<br />` : ''}
        <strong>Datum objednávky:</strong> ${formatDate(order.createdAt)}<br />
        <strong>Celkem:</strong> ${formatPriceFixed(order.total)}<br />
        <strong>E-mail zákazníka:</strong> ${escapeHtml(order.customerEmail)}<br />
        <strong>Stav objednávky:</strong> ${escapeHtml(order.orderStatus)}
      </p>`
    : `<p style="margin:24px 0 0 0;color:#b91c1c;"><strong>⚠ Objednávka s tímto číslem nebyla v systému nalezena</strong> — zkontrolujte ručně.</p>`;

  return `
    <h2>Nové odstoupení od smlouvy</h2>
    <p style="line-height:1.7;">
      <strong>Jméno:</strong> ${escapeHtml(data.name)}<br />
      <strong>E-mail:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br />
      <strong>Číslo objednávky:</strong> ${escapeHtml(data.orderNumber)}<br />
      <strong>Vrácení peněz:</strong> ${data.bankAccount ? `bankovním převodem na účet ${escapeHtml(data.bankAccount)}` : 'původní platební metodou (účet nevyplněn)'}<br />
      ${data.returnedItems ? `<strong>Vracené zboží:</strong> ${escapeHtml(data.returnedItems)}<br />` : ''}
      <strong>Časové razítko:</strong> ${escapeHtml(timestamp)}
    </p>
    ${orderHtml}`;
}

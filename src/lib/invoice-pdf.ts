import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Order } from '@/types/order';
import type { GlobalInfo } from '@/types/global-info';
import { getPaymentLabel, formatDate } from '@/lib/utils';

// ---- Helpers ----

function formatCzk(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} Kč`;
}



const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.93, 0.93, 0.93);
const LINE_COLOR = rgb(0.8, 0.8, 0.8);

// ---- Drawing helpers ----

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = BLACK,
) {
  page.drawText(text, { x, y, font, size, color });
}

function drawLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness: 0.5,
    color: LINE_COLOR,
  });
}

function textWidth(text: string, font: PDFFont, size: number): number {
  return font.widthOfTextAtSize(text, size);
}

// ---- Main generator ----

export async function generateInvoicePdf(
  order: Order,
  globalInfo: GlobalInfo,
  invoiceNumber: string,
): Promise<Buffer> {
  const vatRate = (globalInfo.vatRate ?? 12) / 100;
  const vatPercent = globalInfo.vatRate ?? 12;

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Embed fonts
  const regularFontBytes = fs.readFileSync(
    path.join(process.cwd(), 'src/fonts/Roboto-Regular.ttf'),
  );
  const boldFontBytes = fs.readFileSync(
    path.join(process.cwd(), 'src/fonts/Roboto-Bold.ttf'),
  );
  const regular = await doc.embedFont(regularFontBytes);
  const bold = await doc.embedFont(boldFontBytes);

  // Embed logo
  const logoPath = path.join(process.cwd(), 'public', 'dd_logo.png');
  let logoImage: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await doc.embedPng(logoBytes);
  }

  const page = doc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  const margin = 50;
  const rightEdge = width - margin;
  let y = 800;

  // ---- Header: logo + company info ----
  if (logoImage) {
    const logoScale = 120 / logoImage.width;
    const logoH = logoImage.height * logoScale;
    page.drawImage(logoImage, {
      x: margin,
      y: y - logoH + 10,
      width: 120,
      height: logoH,
    });
  }

  // Company info (right side)
  const companyLines = [
    { text: globalInfo.companyName, font: bold, size: 10 },
    { text: globalInfo.street ?? '', font: regular, size: 9 },
    { text: globalInfo.city ?? '', font: regular, size: 9 },
    { text: 'Česká republika', font: regular, size: 9 },
    { text: `DIČ: ${globalInfo.dic ?? ''}`, font: regular, size: 9 },
    { text: `IČO: ${globalInfo.ico ?? ''}`, font: regular, size: 9 },
    { text: globalInfo.email ?? '', font: regular, size: 9 },
  ];

  let cy = y;
  for (const line of companyLines) {
    if (!line.text) continue;
    const tw = textWidth(line.text, line.font, line.size);
    drawText(page, line.text, rightEdge - tw, cy, line.font, line.size);
    cy -= line.size + 4;
  }

  // ---- FAKTURA title ----
  y -= 100;
  drawText(page, 'FAKTURA', margin, y, bold, 24);
  y -= 40;

  // ---- Invoice metadata (right column) ----
  const metaData = [
    ['Číslo faktury:', invoiceNumber],
    ['Číslo objednávky:', order.orderNumber],
    ['Datum objednávky:', formatDate(order.createdAt)],
    ['Způsob platby:', getPaymentLabel(order.paymentMethod)],
  ];

  let metaY = y;
  const metaLabelX = 360;
  const metaValX = 470;
  for (const [label, value] of metaData) {
    drawText(page, label, metaLabelX, metaY, bold, 9);
    drawText(page, value, metaValX, metaY, regular, 9);
    metaY -= 14;
  }

  // ---- Billing address (left) ----
  const billing = order.billingAddress;
  const customerName = `${order.customerFirstName} ${order.customerLastName}`;
  const resolveCountry = (c?: string) =>
    !c || c === 'CZ' ? 'Česká republika' : c;

  drawText(page, 'Fakturační adresa', margin, y, bold, 9);
  y -= 14;

  const billingLines: string[] = [
    customerName,
    ...(billing.company ? [billing.company] : []),
    billing.street,
    ...(billing.streetLine2 ? [billing.streetLine2] : []),
    `${billing.zip} ${billing.city}`,
    resolveCountry(billing.country),
    order.customerEmail,
    order.customerPhone ?? '',
  ].filter(Boolean);

  if (billing.ico) billingLines.push(`IČO: ${billing.ico}`);
  if (billing.dic) billingLines.push(`DIČ: ${billing.dic}`);

  let custY = y;
  for (const line of billingLines) {
    drawText(page, line, margin, custY, regular, 9);
    custY -= 12;
  }

  y = Math.min(custY, metaY) - 20;

  // ---- Items table ----
  const colX = [margin, margin + 160, margin + 230, margin + 290, margin + 350, margin + 400, margin + 450];
  const headers = ['Produkt', 'Cena/mj', 'Množství:', 'Základ', '% DPH', 'DPH', 'Cena s\nDPH'];

  // Header background
  page.drawRectangle({
    x: margin - 4,
    y: y - 4,
    width: rightEdge - margin + 8,
    height: 16,
    color: LIGHT_GRAY,
  });

  // Header text
  for (let i = 0; i < headers.length; i++) {
    const hText = headers[i].replace('\n', ' ');
    if (i === 0) {
      drawText(page, hText, colX[i], y, bold, 8);
    } else {
      const tw = textWidth(hText, bold, 8);
      drawText(page, hText, colX[i] - tw + (i < 3 ? 30 : 40), y, bold, 8);
    }
  }

  y -= 6;
  drawLine(page, margin - 4, y, rightEdge + 4, y);
  y -= 14;

  // Item rows
  for (const item of order.items) {
    const unitBase = item.unitPrice / (1 + vatRate);
    const lineBase = unitBase * item.quantity;
    const lineVat = item.totalPrice - lineBase;
    const label = item.productName + (item.variantName ? ` - ${item.variantName}` : '');

    drawText(page, label, colX[0], y, regular, 9);

    const vals = [
      formatCzk(item.unitPrice),
      String(item.quantity),
      formatCzk(lineBase),
      `${vatPercent} %`,
      formatCzk(lineVat),
      formatCzk(item.totalPrice),
    ];

    for (let i = 0; i < vals.length; i++) {
      const tw = textWidth(vals[i], regular, 9);
      drawText(page, vals[i], colX[i + 1] - tw + (i < 2 ? 30 : 40), y, regular, 9);
    }

    y -= 18;
  }

  drawLine(page, margin - 4, y + 4, rightEdge + 4, y + 4);
  y -= 10;

  // ---- Notes (left) + Summary (right) ----
  if (order.notes) {
    drawText(page, 'Poznámky zákazníka:', margin, y, bold, 9);
    y -= 13;
    drawText(page, order.notes, margin, y, regular, 9);
    y -= 16;
  }

  // Summary table (right side)
  const summaryX = 360;
  const summaryValX = rightEdge;
  let sy = y + (order.notes ? 29 : 0);

  const shippingCost = order.shippingCost ?? 0;
  const discountAmt = order.discountAmount ?? 0;
  const totalWithVat = order.total;
  const totalBase = totalWithVat / (1 + vatRate);
  const totalVat = totalWithVat - totalBase;

  const summaryLines: [string, string, boolean][] = [
    ['Mezisoučet', formatCzk(order.subtotal), false],
  ];

  if (discountAmt > 0) {
    summaryLines.push([
      `Sleva${order.couponCode ? ` (${order.couponCode})` : ''}`,
      `- ${formatCzk(discountAmt)}`,
      false,
    ]);
  }

  summaryLines.push(
    ['Doprava', formatCzk(shippingCost), false],
  );

  // Separator before VAT breakdown
  summaryLines.push(
    [`Základ bez DPH`, formatCzk(totalBase), false],
    [`DPH ${vatPercent} %`, formatCzk(totalVat), false],
  );

  // Total
  summaryLines.push(
    ['Celkem s DPH', formatCzk(totalWithVat), true],
  );

  for (const [label, value, isBold] of summaryLines) {
    const f = isBold ? bold : regular;
    const size = label === 'Celkem s DPH' ? 11 : 9;

    // Draw separator line before "Základ bez DPH"
    if (label === 'Základ bez DPH') {
      drawLine(page, summaryX, sy + 10, rightEdge, sy + 10);
      sy -= 4;
    }
    // Draw separator line before "Celkem s DPH"
    if (label === 'Celkem s DPH') {
      drawLine(page, summaryX, sy + 10, rightEdge, sy + 10);
      sy -= 4;
    }

    drawText(page, label, summaryX, sy, f, size);
    const tw = textWidth(value, f, size);
    drawText(page, value, summaryValX - tw, sy, f, size);
    sy -= size + 5;
  }

  // Generate PDF bytes
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}


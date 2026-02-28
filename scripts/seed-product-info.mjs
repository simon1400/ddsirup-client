/**
 * Seed product info boxes, ingredients, origin and related products
 * from old ddsirup.co WP site into Strapi.
 *
 * Run: node scripts/seed-product-info.mjs
 */

import { readFileSync } from 'fs';
import path from 'path';

// ---- Config ----
const STRAPI_URL = 'http://localhost:1337';
// Load token from .env.local
const envPath = path.resolve('d:/ddsirup/client/.env.local');
const envContent = readFileSync(envPath, 'utf8');
const TOKEN = envContent.match(/STRAPI_API_TOKEN=(.+)/)?.[1]?.trim() ?? '';
if (!TOKEN) throw new Error('STRAPI_API_TOKEN not found in .env.local');

const WP_BASE = 'https://ddsirup.co/produkt';
const DELAY_MS = 600; // polite delay between requests

// Strapi slug → WP slug (only where they differ)
const SLUG_MAP = {
  'jahoda': 'sirup-3',
  'hruska-skorice-badyan': 'hruska-skorice-banan',
};

// ---- Helpers ----
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Strapi GET ${path} → ${res.status}`);
  return res.json();
}

async function strapiPut(path, data) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Strapi PUT ${path} → ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#[0-9]+;/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/\u2060/g, '') // word joiner char
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract bullet-point text between two markers in HTML. */
function extractSection(html, startKeyword, endKeyword) {
  const start = html.indexOf(startKeyword);
  if (start < 0) return null;
  const end = endKeyword ? html.indexOf(endKeyword, start + startKeyword.length) : start + 4000;
  const chunk = html.slice(start, end > 0 ? end : start + 4000);

  // Extract list items – <li> or <p> tags inside this chunk
  const items = [];

  // Look for <li> items
  const liMatches = [...chunk.matchAll(/<li[^>]*>(.*?)<\/li>/gs)];
  for (const m of liMatches) {
    const text = stripTags(m[1]).replace(/^[•\-\*⁠\s]+/, '').trim();
    if (text) items.push(text);
  }

  // If no li, look for paragraphs or plain bullet text
  if (items.length === 0) {
    // Extract text after the heading
    const textChunk = chunk.replace(new RegExp(`.*?${escRe(startKeyword)}`), '').slice(0, 2000);
    const plain = stripTags(textChunk);
    // Split on bullet characters
    const bullets = plain.split(/[•⁠]+/).map(s => s.trim()).filter(Boolean);
    if (bullets.length > 1) {
      bullets.forEach(b => { if (b.length > 3) items.push(b); });
    } else {
      // Try splitting on newline / sentence boundary
      const lines = plain.split(/\n|(?<=\.) /).map(s => s.trim()).filter(s => s.length > 5);
      items.push(...lines.slice(0, 8));
    }
  }

  return items.length ? items.join('\n') : null;
}

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSimpleText(html, keyword) {
  const idx = html.indexOf(keyword);
  if (idx < 0) return null;
  const chunk = html.slice(idx, idx + 500);
  return stripTags(chunk).slice(keyword.length).split(/Zem[eě]|Vyrobeno|Souv/)[0].trim();
}

async function fetchWpPage(wpSlug) {
  const url = `${WP_BASE}/${wpSlug}/`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ddsirup-scraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parsePage(html) {
  const result = {
    infoBoxes: [],
    ingredients: null,
    countryOfOrigin: 'Česká Republika',
    madeIn: 'Česká Republika',
    relatedSlugs: [],
  };

  // --- "Chuť" box: uses et_pb_blurb with h4.et_pb_module_header per item ---
  const chutIdx = html.indexOf('Chu\u0165</h2>');
  if (chutIdx >= 0) {
    // The blurb items follow until the next h2 section
    const nextH2 = html.indexOf('<h2>', chutIdx + 10);
    const chunk = html.slice(chutIdx, nextH2 > 0 ? nextH2 : chutIdx + 4000);
    const items = [...chunk.matchAll(/<h4[^>]*et_pb_module_header[^>]*><span>(.*?)<\/span><\/h4>/gs)]
      .map(m => stripTags(m[1]).trim())
      .filter(Boolean);
    if (items.length > 0) {
      result.infoBoxes.push({ title: 'Chuť', content: items.join('\n') });
    }
  }

  // --- "Jak se starat o sirup?" box: uses <p><span>• text</span></p> ---
  const staratIdx = html.indexOf('starat o sirup?</h2>');
  if (staratIdx >= 0) {
    const nextH2 = html.indexOf('<h2>', staratIdx + 10);
    const chunk = html.slice(staratIdx, nextH2 > 0 ? nextH2 : staratIdx + 3000);
    // Split by bullet character •
    const plain = stripTags(chunk)
      .replace(/Jak se starat o sirup\?/g, '')
      .trim();
    const items = plain
      .split(/[•⁠]+/)
      .map(s => s.replace(/^\s+|\s+$/g, '').replace(/\u2060/g, ''))
      .filter(s => s.length > 3 && !s.match(/^\s*starat/));
    if (items.length > 0) {
      result.infoBoxes.push({ title: 'Jak se starat o sirup?', content: items.join('\n') });
    }
  }

  // --- "Na co se hodí?" box: uses <ul><li> ---
  const hodiIdx = html.indexOf('se hod\u00ed?</h2>');
  if (hodiIdx >= 0) {
    const nextH2 = html.indexOf('<h2>', hodiIdx + 10);
    const chunk = html.slice(hodiIdx, nextH2 > 0 ? nextH2 : hodiIdx + 3000);
    const items = [...chunk.matchAll(/<li[^>]*>(.*?)<\/li>/gs)]
      .map(m => stripTags(m[1]).trim())
      .filter(Boolean);
    if (items.length > 0) {
      result.infoBoxes.push({ title: 'Na co se hodí?', content: items.join('\n') });
    }
  }

  // --- "Čím je vyjímečný?" box: uses <ul><li> ---
  const vyjIdx = html.indexOf('vyj\u00edme\u010dn\u00fd?</h2>');
  if (vyjIdx >= 0) {
    const nextSection = html.indexOf('Slo\u017een\u00ed:', vyjIdx);
    const chunk = html.slice(vyjIdx, nextSection > 0 ? nextSection : vyjIdx + 3000);
    const items = [...chunk.matchAll(/<li[^>]*>(.*?)<\/li>/gs)]
      .map(m => stripTags(m[1]).trim())
      .filter(Boolean);
    if (items.length > 0) {
      result.infoBoxes.push({ title: 'Čím je vyjímečný?', content: items.join('\n') });
    }
  }

  // --- Ingredients: "Složení: X Konzervant: Y" ---
  const sloIdx = html.indexOf('Slo\u017een\u00ed:');
  if (sloIdx >= 0) {
    // Find the text node containing Složení (in et_pb_text_inner)
    const chunk = html.slice(sloIdx, sloIdx + 600);
    const text = stripTags(chunk).replace(/\s+/g, ' ').trim();
    const m = text.match(/Slo\u017een\u00ed:\s*(.+?)(?:\s*Zem[eě]\s|$)/s);
    if (m) result.ingredients = m[1].trim();
  }

  // --- Country / Made in ---
  const footerIdx = html.indexOf('Zem\u011b p\u016fvodu:');
  if (footerIdx >= 0) {
    const chunk = html.slice(footerIdx, footerIdx + 300);
    const text = stripTags(chunk).replace(/\s+/g, ' ').trim();
    const mOrig = text.match(/Zem[eě] p\u016fvodu:\s*([^\s].*?)(?:\s+Vyrobeno:|$)/s);
    if (mOrig) result.countryOfOrigin = mOrig[1].trim();
    const mMade = text.match(/Vyrobeno:\s*([^\s].*?)(?:\s+Souv|$)/s);
    if (mMade) result.madeIn = mMade[1].trim();
  }

  // --- Related products ---
  const relIdx = html.indexOf('Souvisej\u00edc\u00ed');
  if (relIdx >= 0) {
    const relChunk = html.slice(relIdx, relIdx + 5000);
    const links = [...relChunk.matchAll(/href="https:\/\/ddsirup\.co\/produkt\/([^"\/]+)\//g)];
    result.relatedSlugs = [...new Set(links.map(m => m[1]))];
  }

  return result;
}

// ---- Main ----
async function main() {
  console.log('Fetching all products from Strapi...');
  const { data: products } = await strapiGet(
    '/products?pagination[pageSize]=100&locale=cs&fields[0]=slug&fields[1]=documentId&fields[2]=name'
  );
  console.log(`Found ${products.length} products\n`);

  // Build WP-slug → Strapi documentId map
  const wpSlugToDocId = {};
  for (const p of products) {
    const wpSlug = Object.entries(SLUG_MAP).find(([s]) => s === p.slug)?.[1] ?? p.slug;
    wpSlugToDocId[wpSlug] = p.documentId;
  }

  let ok = 0, fail = 0;

  for (const product of products) {
    const { slug, documentId, name } = product;
    const wpSlug = SLUG_MAP[slug] ?? slug;

    process.stdout.write(`[${slug}] Fetching WP page...`);

    let html;
    try {
      html = await fetchWpPage(wpSlug);
    } catch (e) {
      console.log(` SKIP (${e.message})`);
      fail++;
      await sleep(DELAY_MS);
      continue;
    }

    const parsed = parsePage(html);

    // Map related WP slugs → Strapi document IDs
    const relatedDocIds = parsed.relatedSlugs
      .map(wpS => wpSlugToDocId[wpS])
      .filter(Boolean);

    // Build update payload
    const updateData = {
      ingredients: parsed.ingredients,
      countryOfOrigin: parsed.countryOfOrigin,
      madeIn: parsed.madeIn,
      infoBoxes: parsed.infoBoxes.map(({ title, content }) => ({ title, content })),
      relatedProducts: relatedDocIds,
    };

    console.log(` boxes:${parsed.infoBoxes.length} related:${relatedDocIds.length}`);

    try {
      await strapiPut(`/products/${documentId}?locale=cs`, updateData);
      console.log(`  ✓ ${name}`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
      fail++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone: ${ok} updated, ${fail} failed`);
}

main().catch(console.error);

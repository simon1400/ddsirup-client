import fs from 'fs';
let env = '';
try { env = fs.readFileSync('.env.local', 'utf8'); } catch(e) {}
if (!env) { try { env = fs.readFileSync('.env', 'utf8'); } catch(e) {} }
const tokenMatch = env.match(/STRAPI_API_TOKEN=(.+)/);
const STRAPI_TOKEN = tokenMatch ? tokenMatch[1] : '';

import { STRAPI_URL } from './src/lib/constants';
import qs from 'qs';

const query = qs.stringify(
    {
      populate: {
        heroVideo: true,
        heroPosterImage: true,
        heroCategories: { fields: ['name', 'slug', 'color'] },
        seo: { populate: ['metaImage', 'openGraph', 'openGraph.ogImage'] },
        sections: {
          on: {
            'sections.categories-section': {
              populate: {
                categories: {
                  populate: ['image', 'parent'],
                  fields: ['name', 'slug', 'color'],
                },
              },
            },
            'sections.text-section': {
              populate: '*',
            },
            'sections.products-slider': {
              populate: {
                products: {
                  populate: ['images', 'variants', 'category'],
                  filters: { publishedAt: { $notNull: true } },
                },
              },
            },
            'sections.reviews-section': {
              populate: '*',
            },
            'sections.features': {
              populate: {
                blocks: {
                  populate: ['icon'],
                },
              },
            },
            'sections.contact-form': {
              populate: ['icon'],
            },
          },
        },
      },
    },
    { encodeValuesOnly: true }
  );

fetch(`${STRAPI_URL}/api/homepage?${query}`, {
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
  }
}).then(async res => {
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}).catch(console.error);

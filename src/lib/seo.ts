import type { Metadata } from 'next';
import { getStrapiImageUrl } from './utils';
import { SITE_URL } from './constants';
import type { StrapiImage } from '@/types/strapi';

const SITE_NAME = 'DD Sirup';
const DEFAULT_DESCRIPTION =
  'Prémiové české sirupy z přírodních ingrediencí. Ovocné, bylinné a hřejivé sirupy pro každého i pro barmany.';

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function buildPageMetadata(options: {
  title: string;
  description?: string;
  path: string;
  ogImage?: StrapiImage | null;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const { title, description, path, ogImage, ogType = 'website', noIndex } = options;
  const canonical = getCanonicalUrl(path);
  const imageUrl = ogImage ? getStrapiImageUrl(ogImage.url) : `${SITE_URL}/og-default.jpg`;
  const desc = description ?? DEFAULT_DESCRIPTION;

  return {
    title,
    description: desc,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'cs_CZ',
      type: ogType as 'website',
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: ogImage?.width ?? 1200,
                height: ogImage?.height ?? 630,
                alt: ogImage?.alternativeText ?? title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function buildProductJsonLd(product: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  images?: { url: string; alternativeText?: string | null }[];
  variants?: { sku?: string; name: string; price?: number; stock: number }[];
  category?: { name: string };
  stock: number;
}) {
  const imageUrl = product.images?.[0]?.url
    ? getStrapiImageUrl(product.images[0].url)
    : null;

  const offers = product.variants?.length
    ? product.variants.map((v) => ({
        '@type': 'Offer' as const,
        name: v.name,
        sku: v.sku ?? undefined,
        price: v.price ?? product.price,
        priceCurrency: 'CZK',
        availability:
          v.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url: getCanonicalUrl(`/produkty/${product.slug}`),
      }))
    : [
        {
          '@type': 'Offer' as const,
          price: product.price,
          priceCurrency: 'CZK',
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: getCanonicalUrl(`/produkty/${product.slug}`),
        },
      ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description
      ? stripHtml(product.description).slice(0, 500)
      : undefined,
    image: imageUrl ?? undefined,
    brand: { '@type': 'Brand', name: 'DD Sirup' },
    category: product.category?.name ?? 'Sirupy',
    offers: offers.length === 1 ? offers[0] : offers,
  };
}

export function buildOrganizationJsonLd(globalInfo: {
  companyName: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  ico?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: globalInfo.companyName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: globalInfo.email ?? undefined,
    telephone: globalInfo.phone ?? undefined,
    address:
      globalInfo.street || globalInfo.city
        ? {
            '@type': 'PostalAddress',
            streetAddress: globalInfo.street ?? undefined,
            addressLocality: globalInfo.city ?? undefined,
            addressCountry: 'CZ',
          }
        : undefined,
    taxID: globalInfo.ico ?? undefined,
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/produkty?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

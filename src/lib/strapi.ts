import qs from 'qs';
import type {
  StrapiListResponse,
  StrapiResponse,
} from '@/types/strapi';
import type { Product, Category, ProductsFilter } from '@/types/product';
import type { CreateOrderPayload, Order } from '@/types/order';
import type { AppliedCoupon } from '@/types/coupon';
import type { NavigationItem, FooterNavGroup } from '@/types/navigation';
import type { GlobalInfo } from '@/types/global-info';
import type { Homepage } from '@/types/homepage';
import type { ContactPage } from '@/types/contact-page';
import type { InfoPage } from '@/types/info-page';
import type { WholesalePage } from '@/types/wholesale-page';
import type { Review } from '@/types/review';

import { STRAPI_URL } from './constants';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

async function strapiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error?.error?.message ?? `Strapi error: ${res.status}`);
  }

  return res.json();
}

// ---- Products ----

export async function getProducts(
  filter: ProductsFilter = {}
): Promise<StrapiListResponse<Product>> {
  const {
    category,
    parentCategory,
    search,
    minPrice,
    maxPrice,

    page = 1,
    pageSize = 24,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    locale = 'cs',
  } = filter;

  const filters: Record<string, unknown> = {};
  if (category) filters.category = { slug: { $eq: category } };
  else if (parentCategory) filters.category = { parent: { slug: { $eq: parentCategory } } };
  if (search) filters.name = { $containsi: search };
  if (minPrice !== undefined) filters.price = { ...((filters.price as object) ?? {}), $gte: minPrice };
  if (maxPrice !== undefined) filters.price = { ...((filters.price as object) ?? {}), $lte: maxPrice };


  const query = qs.stringify(
    {
      filters,
      populate: ['images', 'category', 'variants'],
      pagination: { page, pageSize },
      sort: [`${sortBy}:${sortOrder}`],
      locale,
    },
    { encodeValuesOnly: true }
  );

  return strapiRequest<StrapiListResponse<Product>>(`/products?${query}`, {
    next: { revalidate: 0, tags: ['products'] },
  });
}

export async function getProduct(slug: string, locale = 'cs'): Promise<Product | null> {
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        'images',
        'category',
        'category.parent',
        'variants',
        'infoBoxes',
        'recipes.badge',
        'directions',
        'calculation',
        'reviews',
        'relatedProducts.images',
        'relatedProducts.variants',
        'seo',
        'seo.metaImage',
        'seo.openGraph',
        'seo.openGraph.ogImage',
      ],
      locale,
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<Product>>(`/products?${query}`, {
    next: { revalidate: 0, tags: ['products', `product-${slug}`] },
  });

  return res.data[0] ?? null;
}

export async function getFeaturedProducts(locale = 'cs'): Promise<Product[]> {
  const res = await getProducts({ pageSize: 8, locale });
  return res.data;
}

// ---- Categories ----

export async function getCategories(locale = 'cs', parentOnly = false): Promise<Category[]> {
  const query = qs.stringify(
    {
      filters: parentOnly ? { parent: { $null: true } } : undefined,
      populate: ['image', 'children'],
      sort: ['sortOrder:asc', 'name:asc'],
      locale,
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<Category>>(`/categories?${query}`, {
    next: { revalidate: 0, tags: ['categories'] },
  });

  return res.data;
}

export async function getCategory(slug: string, locale = 'cs'): Promise<Category | null> {
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: ['image', 'children', 'parent', 'parent.children', 'seo', 'seo.metaImage', 'seo.openGraph'],
      locale,
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<Category>>(`/categories?${query}`);
  return res.data[0] ?? null;
}

// ---- Navigation ----

export async function getNavigation(): Promise<NavigationItem[]> {
  const query = qs.stringify(
    {
      populate: {
        items: {
          populate: {
            category: {
              populate: {
                children: {
                  sort: ['sortOrder:asc', 'name:asc'],
                },
              },
            },
          },
        },
      },
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiResponse<{ items: NavigationItem[] }>>(
    `/navigation?${query}`,
    { next: { revalidate: 0, tags: ['navigation'] } }
  );

  return res.data?.items ?? [];
}

// ---- Orders ----

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await strapiRequest<StrapiResponse<Order>>('/orders', {
    method: 'POST',
    body: JSON.stringify({ data: payload }),
  });
  return res.data;
}

export async function getOrder(documentId: string): Promise<Order | null> {
  const query = qs.stringify({ populate: '*' }, { encodeValuesOnly: true });
  const res = await strapiRequest<StrapiResponse<Order>>(
    `/orders/${documentId}?${query}`,
    { cache: 'no-store' }
  );
  return res.data ?? null;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const query = qs.stringify(
    {
      filters: { orderNumber: { $eq: orderNumber } },
      populate: '*',
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<Order>>(`/orders?${query}`, {
    cache: 'no-store',
  });

  return res.data[0] ?? null;
}

export async function updateOrder(
  documentId: string,
  data: Partial<CreateOrderPayload>
): Promise<Order> {
  const res = await strapiRequest<StrapiResponse<Order>>(`/orders/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
  return res.data;
}

export async function updateOrderPayment(
  documentId: string,
  comgateTransId: string,
  comgateStatus: string,
  orderStatus: string
): Promise<Order> {
  const res = await strapiRequest<StrapiResponse<Order>>(`/orders/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: { comgateTransId, comgateStatus, orderStatus } }),
  });
  return res.data;
}

export async function assignInvoiceNumber(documentId: string): Promise<string> {
  const res = await strapiRequest<{ invoiceNumber: string }>(
    '/orders/assign-invoice-number',
    {
      method: 'POST',
      body: JSON.stringify({ documentId }),
      cache: 'no-store',
    }
  );
  return res.invoiceNumber;
}

export async function updateOrderTracking(
  documentId: string,
  tracking: {
    messengerShipmentId: string;
    messengerTrackingCode: string;
    messengerTrackingUrl: string;
  }
): Promise<void> {
  await strapiRequest(`/orders/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: tracking }),
  });
}

// ---- Coupons ----

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<AppliedCoupon> {
  const json = await strapiRequest<{ data: AppliedCoupon }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });

  return json.data;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  await strapiRequest('/coupons/increment-usage', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// ---- Reviews ----

export async function getReviews(): Promise<Review[]> {
  const query = qs.stringify(
    {
      sort: ['createdAt:desc'],
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<Review>>(`/reviews?${query}`, {
    next: { revalidate: 0, tags: ['reviews'] },
  }).catch(() => null);

  return res?.data ?? [];
}

// ---- Homepage ----

export async function getHomepage(): Promise<Homepage | null> {
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

  const res = await strapiRequest<StrapiResponse<Homepage>>(`/homepage?${query}`, {
    next: { revalidate: 0, tags: ['homepage'] },
  }).catch(() => null);

  return res?.data ?? null;
}

// ---- Contact Page ----

export async function getContactPage(): Promise<ContactPage | null> {
  const query = qs.stringify(
    { populate: ['seo', 'seo.metaImage', 'seo.openGraph'] },
    { encodeValuesOnly: true }
  );
  const res = await strapiRequest<StrapiResponse<ContactPage>>(`/contact-page?${query}`, {
    next: { revalidate: 0, tags: ['contact-page'] },
  }).catch(() => null);

  return res?.data ?? null;
}

// ---- Wholesale Page ----

export async function getWholesalePage(): Promise<WholesalePage | null> {
  const query = qs.stringify(
    { populate: ['seo', 'seo.metaImage', 'seo.openGraph'] },
    { encodeValuesOnly: true }
  );
  const res = await strapiRequest<StrapiResponse<WholesalePage>>(`/wholesale-page?${query}`, {
    next: { revalidate: 0, tags: ['wholesale-page'] },
  }).catch(() => null);

  return res?.data ?? null;
}

// ---- Global Info ----

export async function getGlobalInfo(): Promise<GlobalInfo | null> {
  const res = await strapiRequest<StrapiResponse<GlobalInfo>>('/global-info', {
    next: { revalidate: 0, tags: ['global-info'] },
  }).catch(() => null);

  return res?.data ?? null;
}

// ---- Footer Navigation ----

export async function getFooterNavGroups(): Promise<FooterNavGroup[]> {
  const query = qs.stringify(
    {
      populate: {
        footerNavGroups: {
          populate: ['links'],
        },
      },
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiResponse<{ footerNavGroups: FooterNavGroup[] }>>(
    `/navigation?${query}`,
    { next: { revalidate: 0, tags: ['navigation'] } }
  ).catch(() => null);

  return res?.data?.footerNavGroups ?? [];
}

// ---- Info Pages ----

export async function getInfoPages(): Promise<InfoPage[]> {
  const query = qs.stringify(
    {
      fields: ['title', 'slug'],
      sort: ['title:asc'],
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<InfoPage>>(
    `/info-pages?${query}`,
    { next: { revalidate: 0, tags: ['info-pages'] } }
  ).catch(() => null);

  return res?.data ?? [];
}

export async function getInfoPage(slug: string): Promise<InfoPage | null> {
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: ['seo', 'seo.metaImage', 'seo.openGraph'],
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<InfoPage>>(
    `/info-pages?${query}`,
    { next: { revalidate: 0, tags: ['info-pages', `info-page-${slug}`] } }
  ).catch(() => null);

  return res?.data?.[0] ?? null;
}

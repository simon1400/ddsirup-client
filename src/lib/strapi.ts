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

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
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
    featured,
    search,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    pageSize = 24,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    locale = 'cs',
  } = filter;

  const filters: Record<string, unknown> = {};
  if (category) filters.category = { slug: { $eq: category } };
  else if (parentCategory) filters.category = { parent: { slug: { $eq: parentCategory } } };
  if (featured !== undefined) filters.featured = { $eq: featured };
  if (search) filters.name = { $containsi: search };
  if (minPrice !== undefined) filters.price = { ...((filters.price as object) ?? {}), $gte: minPrice };
  if (maxPrice !== undefined) filters.price = { ...((filters.price as object) ?? {}), $lte: maxPrice };
  if (inStock) filters.stock = { $gt: 0 };

  const query = qs.stringify(
    {
      filters,
      populate: ['thumbnail', 'category', 'variants'],
      pagination: { page, pageSize },
      sort: [`${sortBy}:${sortOrder}`],
      locale,
    },
    { encodeValuesOnly: true }
  );

  return strapiRequest<StrapiListResponse<Product>>(`/products?${query}`, {
    next: { revalidate: 60, tags: ['products'] },
  });
}

export async function getProduct(slug: string, locale = 'cs'): Promise<Product | null> {
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        'images',
        'thumbnail',
        'category',
        'variants',
        'infoBoxes',
        'relatedProducts.thumbnail',
        'relatedProducts.variants',
      ],
      locale,
    },
    { encodeValuesOnly: true }
  );

  const res = await strapiRequest<StrapiListResponse<Product>>(`/products?${query}`, {
    next: { revalidate: 60, tags: ['products', `product-${slug}`] },
  });

  return res.data[0] ?? null;
}

export async function getFeaturedProducts(locale = 'cs'): Promise<Product[]> {
  const res = await getProducts({ featured: true, pageSize: 8, locale });
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
    next: { revalidate: 300, tags: ['categories'] },
  });

  return res.data;
}

export async function getCategory(slug: string, locale = 'cs'): Promise<Category | null> {
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: ['image', 'children', 'parent'],
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
    { next: { revalidate: 300, tags: ['navigation'] } }
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
  const res = await strapiRequest<StrapiResponse<Order>>(`/orders/${documentId}`);
  return res.data ?? null;
}

export async function updateOrderPayment(
  documentId: string,
  comgateTransId: string,
  comgateStatus: string,
  status: string
): Promise<Order> {
  const res = await strapiRequest<StrapiResponse<Order>>(`/orders/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: { comgateTransId, comgateStatus, status } }),
  });
  return res.data;
}

// ---- Coupons ----

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<AppliedCoupon> {
  const STRAPI_PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
  const res = await fetch(`${STRAPI_PUBLIC_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error?.error?.message ?? 'Neplatný kupón');
  }

  const json = await res.json();
  return json.data as AppliedCoupon;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  await strapiRequest('/coupons/increment-usage', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// ---- Homepage ----

export async function getHomepage(): Promise<Homepage | null> {
  const query = qs.stringify(
    {
      populate: {
        heroVideo: true,
        heroCategories: { fields: ['name', 'slug', 'color'] },
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
                  populate: ['thumbnail', 'variants'],
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
    next: { revalidate: 60, tags: ['homepage'] },
  }).catch(() => null);

  return res?.data ?? null;
}

// ---- Global Info ----

export async function getGlobalInfo(): Promise<GlobalInfo | null> {
  const res = await strapiRequest<StrapiResponse<GlobalInfo>>('/global-info', {
    next: { revalidate: 300, tags: ['global-info'] },
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
    { next: { revalidate: 300, tags: ['navigation'] } }
  ).catch(() => null);

  return res?.data?.footerNavGroups ?? [];
}

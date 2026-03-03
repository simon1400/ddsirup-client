'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Product } from '@/types/product';
import type { StrapiListResponse } from '@/types/strapi';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

async function fetchProduct(slug: string, locale = 'cs'): Promise<Product | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'populate[0]': 'images',
    'populate[1]': 'category',
    'populate[2]': 'variants',
    locale,
  });

  const { data } = await axios.get<StrapiListResponse<Product>>(
    `${STRAPI_URL}/api/products?${params.toString()}`
  );

  return data.data[0] ?? null;
}

export function useProduct(slug: string, locale = 'cs') {
  return useQuery({
    queryKey: ['product', slug, locale],
    queryFn: () => fetchProduct(slug, locale),
    enabled: Boolean(slug),
  });
}

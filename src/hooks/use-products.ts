'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Product, ProductsFilter } from '@/types/product';
import type { StrapiListResponse } from '@/types/strapi';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

async function fetchProducts(filter: ProductsFilter): Promise<StrapiListResponse<Product>> {
  const params = new URLSearchParams();
  if (filter.category) params.set('filters[category][slug][$eq]', filter.category);
  if (filter.search) params.set('filters[name][$containsi]', filter.search);
  if (filter.inStock) params.set('filters[stock][$gt]', '0');
  params.set('populate[0]', 'images');
  params.set('populate[1]', 'category');
  params.set('pagination[page]', String(filter.page ?? 1));
  params.set('pagination[pageSize]', String(filter.pageSize ?? 24));
  params.set('sort[0]', `${filter.sortBy ?? 'createdAt'}:${filter.sortOrder ?? 'desc'}`);
  if (filter.locale) params.set('locale', filter.locale);

  const { data } = await axios.get<StrapiListResponse<Product>>(
    `${STRAPI_URL}/api/products?${params.toString()}`
  );
  return data;
}

export function useProducts(filter: ProductsFilter = {}) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: () => fetchProducts(filter),
  });
}

export function useFeaturedProducts(locale = 'cs') {
  return useProducts({ pageSize: 8, locale });
}

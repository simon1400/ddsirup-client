'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Category } from '@/types/product';
import type { StrapiListResponse } from '@/types/strapi';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

async function fetchCategories(locale = 'cs'): Promise<Category[]> {
  const params = new URLSearchParams({
    'populate[0]': 'image',
    'populate[1]': 'children',
    'sort[0]': 'sortOrder:asc',
    'sort[1]': 'name:asc',
    locale,
  });

  const { data } = await axios.get<StrapiListResponse<Category>>(
    `${STRAPI_URL}/api/categories?${params.toString()}`
  );

  return data.data;
}

export function useCategories(locale = 'cs') {
  return useQuery({
    queryKey: ['categories', locale],
    queryFn: () => fetchCategories(locale),
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

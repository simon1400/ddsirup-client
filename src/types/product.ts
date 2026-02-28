import type { StrapiImage } from './strapi';

export interface ProductInfoBox {
  id: number;
  title: string;
  content: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  volume?: string;
  sku?: string;
  price?: number;
  stock: number;
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock: number;
  images?: StrapiImage[];
  thumbnail?: StrapiImage;
  category?: Category;
  variants?: ProductVariant[];
  featured: boolean;
  weight?: number;
  infoBoxes?: ProductInfoBox[];
  ingredients?: string;
  countryOfOrigin?: string;
  madeIn?: string;
  relatedProducts?: Product[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  image?: StrapiImage;
  products?: Product[];
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsFilter {
  category?: string;
  parentCategory?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  locale?: string;
}

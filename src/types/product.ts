import type { StrapiImage } from './strapi';

export interface SeoOpenGraph {
  id: number;
  ogTitle: string;
  ogDescription: string;
  ogImage?: StrapiImage;
  ogUrl?: string;
  ogType?: string;
}

export interface SeoComponent {
  id: number;
  metaTitle: string;
  metaDescription: string;
  metaImage?: StrapiImage;
  keywords?: string;
  metaRobots?: string;
  metaViewport?: string;
  canonicalURL?: string;
  structuredData?: Record<string, unknown>;
  openGraph?: SeoOpenGraph;
}

export interface ProductInfoBox {
  id: number;
  title: string;
  content: string;
  color?: string;
}

export interface Badge {
  id: number;
  documentId: string;
  badgeName: string;
  badgeColor?: string;
  /** Higher = products with this badge sort earlier in category listings. */
  sortPriority?: number;
}

/** Alias — recipe badges share the Badge shape. */
export type RecipeBadge = Badge;

export interface ProductRecipe {
  id: number;
  documentId: string;
  recipeName: string;
  recipeType: string;
  recipe: string;
  badge?: RecipeBadge;
}

export interface ProductDirection {
  id: number;
  beverageName: string;
  amount: string;
  addIn?: string;
}

export interface ProductCalculation {
  id: number;
  amount: number;
  beverageName: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  volume?: string;
  sku?: string;
  price?: number;
  inStock?: boolean;
}

export interface ProductMaintenance {
  id: number;
  maintenance: string;
  additionalInfo?: string;
}

export interface ProductUsage {
  id: number;
  documentId: string;
  name: string;
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images?: StrapiImage[];
  category?: Category;
  variants?: ProductVariant[];
  infoBoxes?: ProductInfoBox[];
  recipes?: ProductRecipe[];
  directions?: ProductDirection[];
  ingredients?: string;
  countryOfOrigin?: string;
  madeIn?: string;
  calculation?: ProductCalculation[];
  relatedProducts?: Product[];
  maintenance?: ProductMaintenance;
  usages?: ProductUsage[];
  badges?: Badge[];
  /** Manual sort within its group (higher = earlier). Tiebreak inside a badge; primary order among badgeless products. */
  sortOrder?: number;
  seo?: SeoComponent;
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
  color?: string;
  seo?: SeoComponent;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsFilter {
  category?: string;
  parentCategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;

  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  locale?: string;
}

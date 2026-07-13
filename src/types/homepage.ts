import type { StrapiImage } from './strapi';
import type { Category, Product } from './product';
import { Review } from './review';

export interface HeroProps {
  title: string;
  subtitle?: string;
  video?: StrapiImage;
  posterImage?: StrapiImage;
  categories?: Category[];
  customButtonText?: string;
  customButtonUrl?: string;
}

export interface CategoriesSection {
  __component: 'sections.categories-section';
  id: number;
  title?: string;
  description?: string;
  categories?: Category[];
}

export interface TextSection {
  __component: 'sections.text-section';
  id: number;
  title?: string;
  content?: string;
}

export interface ProductsSliderSection {
  __component: 'sections.products-slider';
  id: number;
  title?: string;
  products?: Product[];
}

export interface FeatureBlock {
  id: number;
  icon?: StrapiImage;
  title: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface FeaturesSection {
  __component: 'sections.features';
  id: number;
  title?: string;
  blocks?: FeatureBlock[];
}

export interface ContactFormSection {
  __component: 'sections.contact-form';
  id: number;
  title?: string;
  description?: string;
  icon?: StrapiImage;
}

export interface UsageItem {
  id: number;
  count: string;
  label: string;
}

export interface BottleUsageSection {
  __component: 'sections.bottle-usage';
  id: number;
  title?: string;
  bottleImage?: StrapiImage;
  items?: UsageItem[];
}

export interface ReviewsSection {
  __component: 'sections.reviews-section';
  id: number;
  title?: string;
  reviews: Review[];
  partnersNumber?: number;
}

export type HomepageSection =
  | CategoriesSection
  | TextSection
  | ProductsSliderSection
  | FeaturesSection
  | ContactFormSection
  | BottleUsageSection
  | ReviewsSection;

export interface Homepage {
  id: number;
  documentId: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideo?: StrapiImage;
  heroPosterImage?: StrapiImage;
  heroCategories?: Category[];
  heroCustomButtonText?: string;
  heroCustomButtonUrl?: string;
  partnersNumber?: number;
  sections: HomepageSection[];
  seo?: import('./product').SeoComponent;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

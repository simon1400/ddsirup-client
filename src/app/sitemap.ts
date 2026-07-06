import type { MetadataRoute } from 'next';
import { getProducts, getCategories, getInfoPages } from '@/lib/strapi';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categories, infoPages] = await Promise.all([
    getProducts({ pageSize: 200 }).catch(() => ({ data: [] as { slug: string; updatedAt: string; category?: { slug: string } }[] })),
    getCategories().catch(() => []),
    getInfoPages().catch(() => []),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/kontakt`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/pro-podniky`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/odstoupeni-od-smlouvy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = productsRes.data
    .filter((p) => p.category?.slug)
    .map((p) => ({
      url: `${SITE_URL}/${p.category!.slug}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const infoPageEntries: MetadataRoute.Sitemap = infoPages.map((p) => ({
    url: `${SITE_URL}/clanek/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...infoPageEntries];
}

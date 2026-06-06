import type { Metadata } from 'next';
import { HeroSection } from '@/components/sections/HeroSection';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { getHomepage, getGlobalInfo, getReviews } from '@/lib/strapi';
import {
  buildPageMetadata,
  buildLocalBusinessJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage().catch(() => null);
  return buildPageMetadata({
    title: homepage?.seo?.metaTitle ?? 'DD Sirup | Prémiové české sirupy',
    description:
      homepage?.seo?.metaDescription ??
      'Prémiové české sirupy z přírodních ingrediencí. Ovocné, bylinné a hřejivé sirupy pro každého i pro barmany. Objednávejte online.',
    path: homepage?.seo?.canonicalURL ?? '/',
    ogImage: homepage?.seo?.metaImage ?? null,
  });
}

export default async function HomePage() {
  const [homepage, globalInfo, reviews] = await Promise.all([
    getHomepage(),
    getGlobalInfo(),
    getReviews(),
  ]);

  const hasHero = !!homepage?.heroTitle;
  const hasSections = !!homepage?.sections?.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildLocalBusinessJsonLd({
              companyName: globalInfo?.companyName ?? 'DD Sirup',
              email: globalInfo?.email,
              phone: globalInfo?.phone,
              phoneHours: globalInfo?.phoneHours,
              street: globalInfo?.street,
              city: globalInfo?.city,
              ico: globalInfo?.ico,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWebSiteJsonLd()),
        }}
      />
      {hasHero && (
        <HeroSection
          hero={{
            title: homepage!.heroTitle!,
            subtitle: homepage!.heroSubtitle,
            video: homepage!.heroVideo,
            posterImage: homepage!.heroPosterImage,
            categories: homepage!.heroCategories,
            customButtonText: homepage!.heroCustomButtonText,
            customButtonUrl: homepage!.heroCustomButtonUrl,
          }}
        />
      )}
      {reviews.length > 0 && <ReviewsSection reviews={reviews} partnersNumber={homepage?.partnersNumber} />}
      {hasSections && <SectionRenderer sections={homepage!.sections} />}
      {!hasHero && !hasSections && (
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400 px-4 text-center">
          <p>Stránka ještě není nakonfigurována. Přidejte obsah v Strapi Admin.</p>
        </div>
      )}
    </>
  );
}

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { getHomepage, getGlobalInfo } from '@/lib/strapi';
import {
  buildPageMetadata,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo';

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
  const [homepage, globalInfo] = await Promise.all([
    getHomepage(),
    getGlobalInfo(),
  ]);

  const hasHero = !!homepage?.heroTitle;
  const hasSections = !!homepage?.sections?.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildOrganizationJsonLd({
                companyName: globalInfo?.companyName ?? 'DD Sirup',
                email: globalInfo?.email,
                phone: globalInfo?.phone,
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
              categories: homepage!.heroCategories,
            }}
          />
        )}
        {hasSections && <SectionRenderer sections={homepage!.sections} />}
        {!hasHero && !hasSections && (
          <div className="flex items-center justify-center min-h-[60vh] text-gray-400 px-4 text-center">
            <p>Stránka ještě není nakonfigurována. Přidejte obsah v Strapi Admin.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

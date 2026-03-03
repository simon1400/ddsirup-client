import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { getHomepage } from '@/lib/strapi';

export default async function HomePage() {
  const homepage = await getHomepage();

  const hasHero = !!homepage?.heroTitle;
  const hasSections = !!homepage?.sections?.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
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

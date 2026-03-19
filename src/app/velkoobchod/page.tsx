import type { Metadata } from 'next';
import Image from 'next/image';
import { getWholesalePage } from '@/lib/strapi';
import { WholesaleForm } from '@/components/wholesale/WholesaleForm';
import { Container } from '@/components/ui/Container';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWholesalePage().catch(() => null);
  return buildPageMetadata({
    title: page?.seo?.metaTitle ?? page?.title ?? 'Pro podniky',
    description: page?.seo?.metaDescription ?? 'Velkoobchodní spolupráce s DD Sirup. Nabízíme zákaznický servis, ochutnávky, barové poradenství a školení.',
    path: page?.seo?.canonicalURL ?? '/velkoobchod',
    ogImage: page?.seo?.metaImage ?? null,
  });
}

export default async function VelkoobchodPage() {
  const page = await getWholesalePage();

  const title = page?.title ?? 'PRO PODNIKY';
  const description = page?.description;
  const specialistContent = page?.specialistContent;

  return (
    <div className="pb-20">
      {/* Header */}
      <Container as="section" size="lg" className="pt-12 pb-10">
        <p className="text-coral font-bold uppercase tracking-wide text-sm mb-2">
          Napište nám
        </p>
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6">
          {title}
        </h1>
      </Container>

      {/* Main Content: left column (text + form), right column (specialist, spans full height) */}
      <Container as="section" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {/* Cooperation text */}
            {description && (
              <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor: '#A8C98E' }}>
                <div
                  className="ck-content text-green-text"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}

            {/* Contact Form */}
            <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor: '#A8C98E' }}>
              <h2 className="text-xl md:text-2xl font-black uppercase leading-tight mb-6 text-green-text">
                Kontaktní formulář
              </h2>
              <WholesaleForm />
            </div>
          </div>

          {/* Right column: Specialist (spans full height) */}
          <div
            className="rounded-3xl flex flex-col justify-between overflow-hidden"
            style={{ backgroundColor: '#A8C98E' }}
          >
            {specialistContent && (
              <div
                className="ck-content text-green-text p-8 md:p-12"
                dangerouslySetInnerHTML={{ __html: specialistContent }}
              />
            )}

            {/* Static specialist image */}
            <div className="mt-auto">
              <Image
                src="/poradna_srna.png"
                alt="Specialista"
                width={600}
                height={600}
                className="w-full h-auto object-cover object-bottom"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

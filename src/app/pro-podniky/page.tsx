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
    path: page?.seo?.canonicalURL ?? '/pro-podniky',
    ogImage: page?.seo?.metaImage ?? null,
  });
}

export default async function VelkoobchodPage() {
  const page = await getWholesalePage();

  const title = page?.title ?? 'PRO PODNIKY';
  const subtitle = page?.subtitle ?? 'Máte bar, kavárnu, restauraci, bistro či jiný gastro podnik?';
  const description = page?.description;
  const specialistContent = page?.specialistContent;

  return (
    <div className="pb-20">
      {/* Header */}
      <Container as="section" size="lg" className="pt-12 pb-10">
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-lg md:text-xl text-gray-700 font-medium">
            {subtitle}
          </p>
        )}
      </Container>

      {/* Intro text (full width, content from Strapi) */}
      {description && (
        <Container as="section" size="lg">
          <div className="rounded-3xl bg-green-soft p-8 md:p-12">
            <div
              className="ck-content text-green-text"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </Container>
      )}

      {/* Community heading — sits closer to the contact blocks below */}
      <Container as="section" size="lg" className="pt-14 md:pt-20 pb-7 md:pb-9 text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">
          Staň se součástí naší komunity
        </h2>
      </Container>

      {/* Contact form + specialist */}
      <Container as="section" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-green-soft p-8 md:p-12">
            <h2 className="text-xl md:text-2xl font-black uppercase leading-tight mb-6 text-green-text">
              Kontaktní formulář
            </h2>
            <WholesaleForm />
          </div>

          <div className="rounded-3xl bg-green-soft p-8 md:p-12 flex flex-col items-center justify-center text-center">
            {/* Circular specialist avatar, text below */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/50 overflow-hidden shrink-0 mb-8">
              <Image
                src="/poradna_srna.png"
                alt="Pan Deer — specialista na gastro podniky"
                width={620}
                height={752}
                className="w-full h-full object-cover object-[70%_10%]"
              />
            </div>

            {specialistContent && (
              <div
                className="ck-content text-green-text"
                dangerouslySetInnerHTML={{ __html: specialistContent }}
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import type { FeaturesSection as FeaturesSectionType } from '@/types/homepage';
import { FEATURE_BLOCK_COLORS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';

interface Props {
  section: FeaturesSectionType;
}

export function FeaturesSection({ section }: Props) {
  const blocks = section.blocks ?? [];

  return (
    <section className="py-20">
      <Container size="xl">
        {section.title && (
          <h2 className="text-3xl md:text-6xl font-black uppercase text-center mb-12">
            {section.title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map((block, i) => {
            const colors = FEATURE_BLOCK_COLORS[i % FEATURE_BLOCK_COLORS.length];
            const isFirst = i === 0;
            const isLast = i === blocks.length - 1;
            const hasSplash = isFirst || isLast;

            return (
              <div key={block.id} className="relative">
                {hasSplash && (
                  <Image
                    src="/pouze flek_result_result.webp"
                    alt=""
                    width={300}
                    height={300}
                    aria-hidden
                    className={`absolute z-0 pointer-events-none hidden md:block w-[250px] h-auto ${
                      isFirst
                        ? '-left-24 top-1/2 -translate-y-1/2'
                        : '-right-24 top-1/2 -translate-y-1/2 -scale-x-100'
                    }`}
                  />
                )}
              <div
                className="rounded-3xl p-8 flex flex-col gap-4 relative z-10 overflow-hidden"
                style={{ backgroundColor: colors.bg, opacity: 0.9 }}
              >
                {block.icon?.url && (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    <Image
                      src={block.icon.url}
                      alt={block.title}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                )}

                <h3 className="text-4xl font-bold" style={{ color: colors.title }}>
                  {block.title}
                </h3>

                {block.content && (
                  <div
                    className="text-lg leading-relaxed rich-content"
                    style={{ color: colors.text }}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                )}

                {block.buttonText && block.buttonUrl && (
                  <div className="mt-auto pt-2">
                    <Link
                      href={block.buttonUrl}
                      className="inline-flex px-6 py-4 rounded-full font-bold uppercase text-xs tracking-widest text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.button }}
                    >
                      {block.buttonText}
                    </Link>
                  </div>
                )}
              </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

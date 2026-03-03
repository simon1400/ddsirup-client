import Link from 'next/link';
import Image from 'next/image';
import type { FeaturesSection as FeaturesSectionType } from '@/types/homepage';

// Alternating colors: coral, green, coral, green
const BLOCK_COLORS = ['#F2837A', '#A8C98E', '#F2837A', '#A8C98E'];

interface Props {
  section: FeaturesSectionType;
}

export function FeaturesSection({ section }: Props) {
  const blocks = section.blocks ?? [];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {section.title && (
          <h2 className="text-3xl md:text-5xl font-black uppercase text-center mb-12">
            {section.title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map((block, i) => {
            const bg = BLOCK_COLORS[i % BLOCK_COLORS.length];
            const isDark = bg === '#F2837A';

            return (
              <div
                key={block.id}
                className="rounded-3xl p-8 flex flex-col gap-4 relative overflow-hidden"
                style={{ backgroundColor: bg }}
              >
                {/* Icon */}
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

                {/* Title */}
                <h3
                  className="text-xl font-bold"
                  style={{ color: isDark ? '#7A2020' : '#2A4A20' }}
                >
                  {block.title}
                </h3>

                {/* Content */}
                {block.content && (
                  <div
                    className="text-sm leading-relaxed text-gray-700 rich-content"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                )}

                {/* Button */}
                {block.buttonText && block.buttonUrl && (
                  <div className="mt-auto pt-2">
                    <Link
                      href={block.buttonUrl}
                      className="inline-flex px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: isDark ? '#7A2020' : '#2D4A2A' }}
                    >
                      {block.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

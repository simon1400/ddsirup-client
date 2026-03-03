import Link from 'next/link';
import type { CategoriesSection as CategoriesSectionType } from '@/types/homepage';

const BUTTON_COLOR = '#F0D060';

interface Props {
  section: CategoriesSectionType;
}

export function CategoriesSection({ section }: Props) {
  const categories = section.categories ?? [];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: title + description */}
          <div>
            {section.title && (
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-6">
                {section.title}
              </h2>
            )}
            {section.description && (
              <div
                className="prose prose-lg text-gray-700 text-2xl max-w-none font-black"
                dangerouslySetInnerHTML={{ __html: section.description }}
              />
            )}
          </div>

          {/* Right: category pills */}
          {categories.length > 0 && (
            <div className="flex flex-col items-end gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.documentId}
                  href={`/products?tab=${cat.parent?.slug ?? cat.slug}&sub=${cat.slug}`}
                  className="flex items-center justify-center w-[80%] px-8 py-4 rounded-full font-bold uppercase text-md tracking-widest text-gray-900 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: BUTTON_COLOR }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

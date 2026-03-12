import Link from 'next/link';
import type { CategoriesSection as CategoriesSectionType } from '@/types/homepage';
import { Container } from '@/components/ui/Container';
import { CATEGORY_COLORS } from '@/lib/constants';
import type { Category } from '@/types/product';

interface Props {
  section: CategoriesSectionType;
}

export function CategoriesSection({ section }: Props) {
  const categories = section.categories ?? [];

  // Group categories by parent
  const parentMap = new Map<string, { parent: Category; children: Category[] }>();
  for (const cat of categories) {
    const parentSlug = cat.parent?.slug ?? cat.slug;
    if (!parentMap.has(parentSlug)) {
      parentMap.set(parentSlug, {
        parent: cat.parent ?? cat,
        children: [],
      });
    }
    if (cat.parent) {
      parentMap.get(parentSlug)!.children.push(cat);
    }
  }

  const groups = Array.from(parentMap.values());

  return (
    <section className="py-20 px-4">
      <Container size="xl">
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

          {/* Right: grouped categories */}
          {groups.length > 0 && (
            <div className="flex flex-col gap-7">
              {groups.map((group, i) => {
                const color = CATEGORY_COLORS[i] ?? '#E0E0E0';
                return (
                  <div key={group.parent.slug}>
                    {/* Parent category */}
                    <Link
                      href={`/${group.parent.slug}`}
                      className="inline-block px-7 py-3 rounded-full font-black uppercase text-base tracking-wide transition-all hover:scale-105 mb-3"
                      style={{ backgroundColor: color, color: '#1a1a1a' }}
                    >
                      {group.parent.name}
                    </Link>

                    {/* Subcategories */}
                    {group.children.length > 0 && (
                      <div className="flex flex-wrap gap-3 pl-3">
                        {group.children.map((child) => (
                          <Link
                            key={child.documentId}
                            href={`/${child.slug}`}
                            className="px-4 py-1.5 rounded-full text-md font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: '#f5f5f0', color: '#555' }}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

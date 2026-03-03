import type { TextSection as TextSectionType } from '@/types/homepage';

interface Props {
  section: TextSectionType;
}

export function TextSection({ section }: Props) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        {section.title && (
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">
            {section.title}
          </h2>
        )}
        {section.content && (
          <div
            className="prose prose-lg mx-auto text-gray-700"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
      </div>
    </section>
  );
}

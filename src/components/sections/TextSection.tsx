import type { TextSection as TextSectionType } from '@/types/homepage';
import { Container } from '@/components/ui/Container';
import { AnimatedWave } from '@/components/ui/AnimatedWave';

interface Props {
  section: TextSectionType;
}

export function TextSection({ section }: Props) {
  return (
    <section className="relative bg-coral">
      {/* Wave top */}
      <AnimatedWave position="top" />

      {/* Content */}
      <Container size="md" className="relative z-10 text-center py-16 md:py-24">
        {section.title && (
          <h2 className="text-5xl md:text-8xl font-black uppercase mb-6 text-white">
            {section.title}
          </h2>
        )}
        {section.content && (
          <div
            className="prose prose-lg mx-auto text-white/90 prose-p:text-white/90 prose-strong:text-white text-2xl md:text-3xl"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
      </Container>

      {/* Wave bottom */}
      <AnimatedWave position="bottom" />
    </section>
  );
}

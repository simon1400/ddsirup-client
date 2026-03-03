import type { HomepageSection } from '@/types/homepage';
import { CategoriesSection } from './CategoriesSection';
import { TextSection } from './TextSection';
import { ProductsSlider } from './ProductsSlider';
import { FeaturesSection } from './FeaturesSection';
import { ContactFormSection } from './ContactFormSection';

interface Props {
  sections: HomepageSection[];
}

export function SectionRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((section) => {
        switch (section.__component) {
          case 'sections.categories-section':
            return <CategoriesSection key={`categories-${section.id}`} section={section} />;
          case 'sections.text-section':
            return <TextSection key={`text-${section.id}`} section={section} />;
          case 'sections.products-slider':
            return <ProductsSlider key={`slider-${section.id}`} section={section} />;
          case 'sections.features':
            return <FeaturesSection key={`features-${section.id}`} section={section} />;
          case 'sections.contact-form':
            return <ContactFormSection key={`contact-${section.id}`} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}

import type { HomepageSection } from '@/types/homepage';
import type { Review } from '@/types/review';
import { CategoriesSection } from './CategoriesSection';
import { TextSection } from './TextSection';
import { ProductsSlider } from './ProductsSlider';
import { FeaturesSection } from './FeaturesSection';
import { ContactFormSection } from './ContactFormSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';

interface Props {
  sections: HomepageSection[];
  reviews?: Review[];
  partnersNumber?: number;
}

export function SectionRenderer({ sections, reviews, partnersNumber }: Props) {
  const processedSections = [...sections];
  const catIndex = processedSections.findIndex(s => s.__component === 'sections.categories-section');
  const revIndex = processedSections.findIndex(s => s.__component === 'sections.reviews-section');

  if (revIndex !== -1) {
    if (catIndex !== -1 && revIndex !== catIndex + 1) {
      const [revSection] = processedSections.splice(revIndex, 1);
      const newCatIndex = processedSections.findIndex(s => s.__component === 'sections.categories-section');
      processedSections.splice(newCatIndex + 1, 0, revSection);
    }
  } else {
    const mockRevSection = {
      __component: 'sections.reviews-section',
      id: -999,
      reviews: reviews || []
    } as any;

    if (catIndex !== -1) {
      processedSections.splice(catIndex + 1, 0, mockRevSection);
    } else {
      processedSections.unshift(mockRevSection);
    }
  }

  return (
    <>
      {processedSections.map((section) => {
        switch (section.__component) {
          case 'sections.categories-section':
            return <CategoriesSection key={`categories-${section.id}`} section={section} />;
          case 'sections.reviews-section':
            return <ReviewsSection key={`reviews-${section.id}`} reviews={section.reviews || reviews || []} partnersNumber={partnersNumber} />;
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

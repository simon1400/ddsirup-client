import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getInfoPage, getInfoPages } from '@/lib/strapi';
import { Container } from '@/components/ui/Container';

interface InfoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await getInfoPages().catch(() => []);
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getInfoPage(slug).catch(() => null);
  if (!page) return { title: 'Stránka nenalezena' };
  return {
    title: page.title,
  };
}

export default async function InfoPageDetail({ params }: InfoPageProps) {
  const { slug } = await params;
  const page = await getInfoPage(slug);

  if (!page) notFound();

  return (
    <div className="pb-20">
      <Container as="section" size="lg" className="pt-12 pb-10">
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-8">
          {page.title}
        </h1>
        {page.content && (
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </Container>
    </div>
  );
}

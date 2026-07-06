import type { Metadata } from 'next';
import { getWithdrawalPage } from '@/lib/strapi';
import { Container } from '@/components/ui/Container';
import { WithdrawalForm } from '@/components/withdrawal/WithdrawalForm';
import { buildPageMetadata, stripHtml } from '@/lib/seo';

export const revalidate = 3600;

const DEFAULT_TITLE = 'Odstoupení od smlouvy';
const DEFAULT_DESCRIPTION =
  'Online formulář pro odstoupení od kupní smlouvy do 14 dnů od převzetí zboží. Vrácení je možné pouze u neotevřeného zboží.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWithdrawalPage();
  return buildPageMetadata({
    title: page?.seo?.metaTitle ?? page?.title ?? DEFAULT_TITLE,
    description:
      page?.seo?.metaDescription ??
      (page?.description ? stripHtml(page.description).slice(0, 160) : DEFAULT_DESCRIPTION),
    path: page?.seo?.canonicalURL ?? '/odstoupeni-od-smlouvy',
    ogImage: page?.seo?.metaImage ?? null,
  });
}

export default async function WithdrawalPage() {
  const page = await getWithdrawalPage();

  return (
    <div className="pb-20">
      <Container as="section" size="lg" className="pt-12 pb-10">
        {page?.subtitle && (
          <p className="text-sm font-bold uppercase tracking-widest text-nav-accent mb-3">
            {page.subtitle}
          </p>
        )}
        <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8">
          {page?.title ?? DEFAULT_TITLE}
        </h1>

        {page?.description && (
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.description }}
          />
        )}

        {page?.warningText && (
          <div className="mt-8 rounded-2xl border-2 border-nav-accent bg-nav-accent/5 p-6">
            <div
              className="prose max-w-none text-gray-800 prose-strong:text-[#C04840]"
              dangerouslySetInnerHTML={{ __html: page.warningText }}
            />
          </div>
        )}

        <div className="mt-12 max-w-2xl">
          <h2 className="text-2xl font-black uppercase mb-2">Formulář pro odstoupení od smlouvy</h2>
          <p className="text-gray-600 text-sm mb-6">
            Vyplňte údaje níže a klikněte na „Potvrdit odstoupení“. Potvrzení o přijetí vám zašleme
            e-mailem.
          </p>
          <WithdrawalForm />
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <a
            href="/vzorovy-formular-odstoupeni-od-smlouvy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold underline hover:text-nav-accent transition-colors"
          >
            ↓ Stáhnout vzorový formulář pro odstoupení od smlouvy (PDF)
          </a>
        </div>
      </Container>
    </div>
  );
}

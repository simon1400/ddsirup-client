import { getContactPage, getGlobalInfo } from '@/lib/strapi';
import { ContactForm } from '@/components/contact/ContactForm';
import { Container } from '@/components/ui/Container';

export const metadata = {
  title: 'Kontakt | DD Sirup',
  description: 'Kontaktujte nás – DD Sirup',
};

export default async function KontaktPage() {
  const [contactPage, globalInfo] = await Promise.all([
    getContactPage(),
    getGlobalInfo(),
  ]);

  const title = contactPage?.title ?? 'KONTAKT';
  const subtitle = contactPage?.subtitle ?? 'NAPIŠTE NÁM';
  const description = contactPage?.description;
  const phoneResponseInfo = contactPage?.phoneResponseInfo ?? 'Po-Pá 8.00-16.00';
  const emailResponseInfo = contactPage?.emailResponseInfo ?? 'Odpověď do 24h';
  const directorTitle = contactPage?.directorTitle ?? 'Jednatel';
  const directorName = contactPage?.directorName;
  const formTitle = contactPage?.formTitle ?? 'NAPIŠTE NÁM!';
  const formDescription = contactPage?.formDescription;

  const phone = globalInfo?.phone;
  const email = globalInfo?.email;
  const companyName = globalInfo?.companyName;
  const ico = globalInfo?.ico;
  const dic = globalInfo?.dic;
  const street = globalInfo?.street;
  const city = globalInfo?.city;

  return (
    <div className="pb-20">
      {/* Header Section */}
      <Container as="section" size="lg" className="pt-12 pb-10">
        {subtitle && (
          <p className="text-coral font-bold uppercase tracking-wide text-sm mb-2">
            {subtitle}
          </p>
        )}
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6">
          {title}
        </h1>
        {description && (
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </Container>

      {/* Phone & Email Cards */}
      <Container as="section" size="lg" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Card */}
          <div className="rounded-3xl p-8" style={{ backgroundColor: '#F0D060' }}>
            <div className="text-3xl mb-4">📍</div>
            {phone && (
              <p className="font-bold text-lg">
                <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
              </p>
            )}
            <p className="text-gray-800">{phoneResponseInfo}</p>
          </div>

          {/* Email Card */}
          <div className="rounded-3xl p-8" style={{ backgroundColor: '#F0D060' }}>
            <div className="text-3xl mb-4">✉️</div>
            {email && (
              <p className="font-bold text-lg">
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            )}
            <p className="text-gray-800">{emailResponseInfo}</p>
          </div>
        </div>
      </Container>

      {/* Bottom Section: Company Info + Form */}
      <Container as="section" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden">
          {/* Left: Company Info */}
          <div className="p-8 md:p-12" style={{ backgroundColor: '#A8C98E' }}>
            {/* Company */}
            <div className="mb-6">
              <div className="text-2xl mb-3">🏢</div>
              {companyName && <p className="font-bold text-lg">{companyName}</p>}
              {ico && <p className="text-gray-800">IČ: {ico}</p>}
              {dic && <p className="text-gray-800">DIČ: {dic}</p>}
            </div>

            {/* Address */}
            <div className="mb-6">
              <div className="text-2xl mb-3">🏠</div>
              {street && <p className="text-gray-800">{street}</p>}
              {city && <p className="text-gray-800">{city}</p>}
            </div>

            {/* Director */}
            {directorName && (
              <div>
                <div className="text-2xl mb-3">👤</div>
                <p className="font-bold">{directorTitle}</p>
                <p className="text-gray-800">{directorName}</p>
              </div>
            )}
          </div>

          {/* Right: Contact Form */}
          <div className="p-8 md:p-12" style={{ backgroundColor: '#F0D060' }}>
            <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-2">
              {formTitle}
            </h2>
            {formDescription && (
              <p className="text-gray-800 mb-6 leading-relaxed">
                {formDescription}
              </p>
            )}
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

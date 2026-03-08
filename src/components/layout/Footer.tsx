import Link from 'next/link';
import { getGlobalInfo, getFooterNavGroups } from '@/lib/strapi';
import { Container } from '@/components/ui/Container';
import { AnimatedWave } from '@/components/ui/AnimatedWave';

export async function Footer() {
  const [globalInfo, footerNavGroups] = await Promise.all([
    getGlobalInfo(),
    getFooterNavGroups(),
  ]);

  return (
    <footer className="relative bg-coral mt-auto">
      {/* Animated wave top */}
      <AnimatedWave position="top" />

      {/* Content */}
      <Container className="relative z-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {/* First nav group (Navigace) */}
          {footerNavGroups[0] && (
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">
                {footerNavGroups[0].title}
              </h3>
              <ul className="space-y-1">
                {footerNavGroups[0].links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : undefined}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact info (center) */}
          {globalInfo && (
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">
                Kontaktní údaje
              </h3>
              <div className="space-y-1 text-white/90">
                {globalInfo.companyName && (
                  <p className="font-bold text-white">{globalInfo.companyName}</p>
                )}
                {globalInfo.ico && <p>IČO: {globalInfo.ico}</p>}
                {globalInfo.dic && <p>DIČ: {globalInfo.dic}</p>}
                {globalInfo.email && (
                  <p>
                    <span className="font-bold text-white">Mail: </span>
                    <a href={`mailto:${globalInfo.email}`} className="hover:text-white transition-colors">
                      {globalInfo.email}
                    </a>
                  </p>
                )}
                {globalInfo.phone && (
                  <p>
                    <span className="font-bold text-white">Telefon: </span>
                    <a href={`tel:${globalInfo.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                      {globalInfo.phone}
                    </a>
                  </p>
                )}
                {globalInfo.phoneHours && (
                  <p className="font-bold text-white">{globalInfo.phoneHours}</p>
                )}
                {globalInfo.street && globalInfo.city && (
                  <p className="mt-2">
                    {globalInfo.street}
                    <br />
                    {globalInfo.city}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Second nav group (Ostatní) */}
          {footerNavGroups[1] && (
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-4">
                {footerNavGroups[1].title}
              </h3>
              <ul className="space-y-1">
                {footerNavGroups[1].links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : undefined}
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>

      {/* Copyright bar — full width red */}
      {globalInfo?.copyright && (
        <div className="bg-[#E63030] py-4 text-center text-sm text-white/80">
          {globalInfo.copyright}
        </div>
      )}
    </footer>
  );
}

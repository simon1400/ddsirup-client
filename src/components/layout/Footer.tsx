import Link from 'next/link';
import { getGlobalInfo, getFooterNavGroups } from '@/lib/strapi';
import { Container } from '@/components/ui/Container';

export async function Footer() {
  const [globalInfo, footerNavGroups] = await Promise.all([
    getGlobalInfo(),
    getFooterNavGroups(),
  ]);

  return (
    <footer className="relative bg-coral mt-auto">
      {/* Animated wave top */}
      <div className="relative -top-px w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1920 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height: 'clamp(60px, 10vw, 140px)' }}
        >
          <path
            d="M0,40 C120,80 200,80 320,35 S520,-10 640,40 S840,85 960,35 S1160,-10 1280,40 S1480,85 1600,35 S1800,-5 1920,40 L1920,120 L0,120 Z"
            fill="white"
            style={{ animation: 'wave-breathe-1 4.5s ease-in-out infinite' }}
          />
          <path
            d="M0,45 C150,85 250,90 400,35 S650,-5 800,45 S1050,90 1200,35 S1450,-5 1600,45 S1800,80 1920,45 L1920,120 L0,120 Z"
            fill="rgba(255,255,255,0.5)"
            style={{ animation: 'wave-breathe-2 5.5s ease-in-out infinite' }}
          />
        </svg>
      </div>

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

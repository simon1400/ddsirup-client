import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">ddsirup.co</h3>
            <p className="text-sm text-muted-foreground">
              Váš online obchod.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Informace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">O nás</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Kontakt</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground transition-colors">Doprava a platba</Link></li>
              <li><Link href="/returns" className="hover:text-foreground transition-colors">Vrácení zboží</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Právní</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Ochrana osobních údajů</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Obchodní podmínky</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ddsirup.co. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}

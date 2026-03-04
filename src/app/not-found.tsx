import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <h1 className="text-7xl md:text-9xl font-black text-gray-800">404</h1>
          <div>
            <p className="text-2xl md:text-4xl font-black leading-tight">
              Jejda, bohužel tato
              <br />
              stránka neexistuje.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-8 py-3 rounded-full bg-coral text-white font-bold text-sm uppercase tracking-widest hover:bg-coral/90 transition-colors"
            >
              Zpět na úvod
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

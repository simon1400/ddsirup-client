'use client';

import { useEffect, useState, useCallback } from 'react';
import { getConsent, setConsent, type ConsentValue } from '@/lib/consent';

/**
 * Cookie consent banner — bottom-left corner.
 *
 * On accept: sets consent=all, triggers a custom event so tracking
 * components can mount immediately without a page reload.
 *
 * On reject: sets consent=necessary, no tracking scripts load.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't made a choice yet
    if (!getConsent()) {
      setVisible(true);
    }
  }, []);

  const handleChoice = useCallback((value: ConsentValue) => {
    setConsent(value);
    setVisible(false);
    // Notify tracking components to re-check consent
    window.dispatchEvent(new Event('consent-updated'));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          Tento web používá cookies pro analýzu návštěvnosti a cílení reklam.
          Kliknutím na &quot;Přijmout&quot; souhlasíte s&nbsp;jejich použitím.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleChoice('necessary')}
            className="flex-1 px-5 py-3 text-xs font-bold uppercase tracking-widest rounded-full border-2 border-foreground text-foreground hover:bg-category-yellow hover:border-category-yellow hover:text-gray-900 transition-colors cursor-pointer"
          >
            Odmítnout
          </button>
          <button
            onClick={() => handleChoice('all')}
            className="flex-1 px-5 py-3 text-xs font-bold uppercase tracking-widest rounded-full bg-coral text-white hover:bg-coral/90 transition-colors cursor-pointer"
          >
            Přijmout vše
          </button>
        </div>
        <a
          href="/clanek/zasady-cookies"
          className="block text-center text-xs text-gray-400 hover:text-nav-accent mt-3 transition-colors"
        >
          Zásady cookies
        </a>
      </div>
    </div>
  );
}

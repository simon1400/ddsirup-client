'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ContactFormSection as ContactFormSectionType } from '@/types/homepage';
import { Container } from '@/components/ui/Container';

interface Props {
  section: ContactFormSectionType;
}

export function ContactFormSection({ section }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Chyba při odeslání');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Chyba při odeslání');
    }
  };

  return (
    <section className="py-20 px-4">
      <Container size="default">
        <div className="rounded-3xl p-8 md:p-12 border border-coral/30">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            {section.icon?.url ? (
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src={section.icon.url}
                  alt={section.title ?? 'Kontakt'}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-2xl text-[#C85A2A] font-bold">
                ?
              </div>
            )}
            <div>
              {section.title && (
                <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight">
                  {section.title}
                </h2>
              )}
              {section.description && (
                <p className="text-gray-600 mt-1 text-lg leading-relaxed">
                  {section.description}
                </p>
              )}
            </div>
          </div>

          {/* Success */}
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✓</div>
              <p className="font-bold text-lg">Zpráva odeslána!</p>
              <p className="text-gray-600 text-sm mt-1">Ozve se vám co nejdříve.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm underline text-gray-500 hover:text-gray-700"
              >
                Odeslat další zprávu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Jméno a příjmení"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-200 placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-200 placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40"
              />
              <textarea
                placeholder="Zpráva"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-5 py-4 rounded-2xl bg-gray-200 placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40 resize-none"
              />

              {/* Privacy note */}
              <p className="text-xs text-gray-500">
                Odesláním kontaktního formuláře souhlasíte se{' '}
                <a href="/podminky" className="underline hover:text-gray-700">
                  zpracováním os. údajů
                </a>
              </p>

              {/* Error */}
              {status === 'error' && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-bold uppercase text-sm tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#F2837A' }}
              >
                {status === 'loading' ? 'Odesílání...' : 'Odeslat'}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { trackLead } from '@/lib/facebook-pixel';

export function ContactForm() {
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

      trackLead({ email, firstName: name });
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Chyba při odeslání');
    }
  };

  if (status === 'success') {
    return (
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
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Jméno a příjmení"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-5 py-4 rounded-2xl bg-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40"
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-5 py-4 rounded-2xl bg-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40"
      />
      <textarea
        placeholder="Zpráva"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={6}
        className="w-full px-5 py-4 rounded-2xl bg-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40 resize-vertical"
      />

      <p className="text-xs text-gray-700">
        Odesláním kontaktního formuláře souhlasíte se{' '}
        <a href="/podminky" className="underline hover:text-gray-900">
          zpracováním os. údajů
        </a>
      </p>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-full font-bold uppercase text-sm tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#1a4a3a' }}
      >
        {status === 'loading' ? 'Odesílání...' : 'Odeslat'}
      </button>
    </form>
  );
}

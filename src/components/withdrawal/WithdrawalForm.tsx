'use client';

import { useState } from 'react';
import Link from 'next/link';

const inputClass =
  'w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-[#C85A2A]/40';

export function WithdrawalForm() {
  const [name, setName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [returnedItems, setReturnedItems] = useState('');
  const [unopenedConfirmed, setUnopenedConfirmed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          orderNumber,
          email,
          bankAccount,
          returnedItems: returnedItems || undefined,
          unopenedConfirmed,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Chyba při odeslání');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Chyba při odeslání');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-10 px-6 rounded-3xl border border-gray-200 bg-gray-50">
        <div className="text-4xl mb-3">✓</div>
        <p className="font-bold text-lg">Odstoupení odesláno</p>
        <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
          Vaše odstoupení od smlouvy jsme přijali. Potvrzení s pokyny k vrácení zboží jsme vám
          zaslali na e-mail. Peníze vám vrátíme do 14 dnů na uvedený účet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="wd-name" className="block text-sm font-bold mb-1.5">
          Jméno a příjmení *
        </label>
        <input
          id="wd-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="wd-order" className="block text-sm font-bold mb-1.5">
          Číslo objednávky *
        </label>
        <input
          id="wd-order"
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          placeholder="Najdete v potvrzovacím e-mailu nebo na faktuře"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="wd-email" className="block text-sm font-bold mb-1.5">
          E-mailová adresa pro potvrzení *
        </label>
        <input
          id="wd-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="wd-account" className="block text-sm font-bold mb-1.5">
          Číslo účtu pro vrácení peněz *
        </label>
        <input
          id="wd-account"
          type="text"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          required
          placeholder="např. 123456789/0800"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="wd-items" className="block text-sm font-bold mb-1.5">
          Vracené zboží
        </label>
        <textarea
          id="wd-items"
          value={returnedItems}
          onChange={(e) => setReturnedItems(e.target.value)}
          rows={3}
          placeholder="Nevyplňujte, pokud vracíte celou objednávku"
          className={`${inputClass} resize-vertical`}
        />
      </div>

      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={unopenedConfirmed}
          onChange={(e) => setUnopenedConfirmed(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 accent-[#1a4a3a]"
        />
        <span>
          Potvrzuji, že vracené zboží je <strong>neotevřené a v původním obalu</strong> *
        </span>
      </label>

      <p className="text-xs text-gray-500">
        Odesláním formuláře souhlasíte se{' '}
        <Link href="/clanek/gdpr" className="underline hover:text-gray-700">
          zpracováním osobních údajů
        </Link>
        .
      </p>

      {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-full font-bold uppercase text-sm tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#1a4a3a' }}
      >
        {status === 'loading' ? 'Odesílání...' : 'Potvrdit odstoupení'}
      </button>
    </form>
  );
}

'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = ref.current?.value.trim() ?? '';
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('search', q);
    else params.delete('search');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
      <input
        ref={ref}
        defaultValue={searchParams.get('search') ?? ''}
        placeholder="Hledat produkt"
        className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#8B9B6B] bg-white text-sm outline-none focus:ring-2 focus:ring-[#8B9B6B]/40"
      />
    </form>
  );
}

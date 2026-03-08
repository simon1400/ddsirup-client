'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { formatPrice, getStrapiImageUrl } from '@/lib/utils';

interface Suggestion {
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleQueryChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(value)}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const q = query.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('search', q);
    else params.delete('search');
    params.delete('page');
    router.push(`/produkty?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(`/produkty/${suggestions[activeIndex].slug}`);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Hledat produkt"
          className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#8B9B6B] bg-white text-sm outline-none focus:ring-2 focus:ring-[#8B9B6B]/40"
          autoComplete="off"
        />
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-2xl border border-border bg-white shadow-lg overflow-hidden">
          {suggestions.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={`/produkty/${item.slug}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                  i === activeIndex ? 'bg-muted/50' : ''
                }`}
              >
                {item.image && (
                  <Image
                    src={getStrapiImageUrl(item.image)!}
                    alt={item.name}
                    width={36}
                    height={36}
                    className="rounded-lg object-cover size-9"
                  />
                )}
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatPrice(item.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

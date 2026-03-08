'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { formatPrice, getStrapiImageUrl } from '@/lib/utils';
import type { NavigationItem } from '@/types/navigation';

interface SearchSuggestion {
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface NavMenuProps {
  items: NavigationItem[];
}

export function NavMenu({ items }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(value)}`);
        const data: SearchSuggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }

  function toggleExpand(id: number) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggestions(false);
      router.push(`/produkty?search=${encodeURIComponent(search.trim())}`);
      handleClose();
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      router.push(`/produkty/${suggestions[activeIndex].slug}`);
      handleClose();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    setExpanded([]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-12 w-12 rounded-md hover:bg-muted transition-colors"
        aria-label="Otevřít menu"
      >
        <Menu className="h-7 w-7" />
      </button>

      <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-sm border-none p-0 [&>button]:text-white/70 [&>button]:hover:text-white"
          style={{ backgroundColor: '#E8635A' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col h-full px-6 pt-14 pb-8 overflow-y-auto">

            {/* Search */}
            <div className="relative mb-6">
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Hledat produkt"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                    autoComplete="off"
                  />
                </div>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full rounded-2xl border border-white/20 bg-white shadow-lg overflow-hidden">
                  {suggestions.map((item, i) => (
                    <li key={item.slug}>
                      <Link
                        href={`/produkty/${item.slug}`}
                        onClick={handleClose}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-100 ${
                          i === activeIndex ? 'bg-gray-100' : ''
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
                        <span className="flex-1 truncate text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatPrice(item.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Menu items */}
            <nav className="flex flex-col">
              {items.map((item) => {
                const isExpanded = expanded.includes(item.id);
                const hasChildren =
                  item.category?.children && item.category.children.length > 0;

                if (item.category) {
                  const parentSlug = item.category.slug;
                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between border-b border-white/20">
                        <Link
                          href={`/produkty?tab=${parentSlug}`}
                          className="flex-1 font-bold text-base py-3 text-white"
                          onClick={handleClose}
                        >
                          {item.label || item.category.name}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="pl-3 py-3"
                            aria-label={isExpanded ? 'Sbalit' : 'Rozbalit'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-white" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-white" />
                            )}
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="flex flex-col pl-2">
                          {item.category.children!.map((child) => (
                            <Link
                              key={child.id}
                              href={`/produkty?tab=${parentSlug}&sub=${child.slug}`}
                              className="py-2.5 text-sm border-b border-white/20 text-white/75 hover:text-white transition-colors"
                              onClick={handleClose}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Simple link
                return (
                  <Link
                    key={item.id}
                    href={item.url ?? '#'}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="font-bold text-base py-3 border-b border-white/20 text-white hover:text-white/70 transition-colors"
                    onClick={handleClose}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

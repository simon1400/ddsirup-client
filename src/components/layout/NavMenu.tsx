'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { NavigationItem } from '@/types/navigation';

interface NavMenuProps {
  items: NavigationItem[];
}

export function NavMenu({ items }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  function toggleExpand(id: number) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      handleClose();
    }
  }

  function handleClose() {
    setOpen(false);
    setSearch('');
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
          className="w-full sm:max-w-sm border-none p-0 [&>button]:text-black/70 [&>button]:hover:text-black"
          style={{ backgroundColor: '#E8635A' }}
        >
          <div className="flex flex-col h-full px-6 pt-14 pb-8 overflow-y-auto">

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Hledat produkt"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </form>

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
                      <div className="flex items-center justify-between border-b border-black/10">
                        <Link
                          href={`/products?tab=${parentSlug}`}
                          className="flex-1 font-bold text-base py-3 text-black"
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
                              <ChevronUp className="h-4 w-4 text-black" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-black" />
                            )}
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="flex flex-col pl-2">
                          {item.category.children!.map((child) => (
                            <Link
                              key={child.id}
                              href={`/products?tab=${parentSlug}&sub=${child.slug}`}
                              className="py-2.5 text-sm border-b border-black/10 text-black/75 hover:text-black transition-colors"
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
                    className="font-bold text-base py-3 border-b border-black/10 text-black hover:text-black/70 transition-colors"
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

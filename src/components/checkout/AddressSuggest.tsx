'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { CheckoutFormValues } from './checkout.schema';

interface AddressSuggestion {
  label: string;
  name: string;
  street: string;
  houseNumber: string;
  city: string;
  cityPart: string;
  zip: string;
}

type AddressPrefix = 'billingAddress' | 'shippingAddress';

interface AddressSuggestProps {
  prefix: AddressPrefix;
  form: UseFormReturn<CheckoutFormValues>;
  className?: string;
}

export function AddressSuggest({ prefix, form, className }: AddressSuggestProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const streetValue = form.watch(`${prefix}.street` as 'billingAddress.street');

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/address-suggest?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.items || []);
        setIsOpen((data.items || []).length > 0);
        setActiveIndex(-1);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue(`${prefix}.street` as any, value, { shouldValidate: false });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function selectSuggestion(suggestion: AddressSuggestion) {
    const opts = { shouldValidate: true } as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const set = (field: string, value: string) => form.setValue(`${prefix}.${field}` as any, value, opts);

    set('street', suggestion.name);
    set('city', suggestion.city || suggestion.cityPart);

    if (suggestion.zip) {
      const z = suggestion.zip.replace(/\s/g, '');
      set('zip', z.length === 5 ? `${z.slice(0, 3)} ${z.slice(3)}` : suggestion.zip);
    }

    setSuggestions([]);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          className={className}
          value={streetValue || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-input bg-background shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                i === activeIndex ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

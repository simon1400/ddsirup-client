'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/facebook-pixel';

interface FacebookViewContentProps {
  contentId: string;
  contentName: string;
  contentCategory?: string;
  value: number;
}

/**
 * Fires ViewContent event on mount for product detail pages.
 */
export function FacebookViewContent({
  contentId,
  contentName,
  contentCategory,
  value,
}: FacebookViewContentProps) {
  useEffect(() => {
    trackViewContent({ contentId, contentName, contentCategory, value });
  }, [contentId, contentName, contentCategory, value]);

  return null;
}

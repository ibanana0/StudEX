'use client';

import { useEffect, useState } from 'react';

/**
 * Always returns true for at least `minMs` after mount,
 * regardless of when the actual data arrives.
 */
export function useMinLoadTime(minMs = 400): boolean {
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), minMs);
    return () => clearTimeout(t);
  }, [minMs]);

  return minDone;
}

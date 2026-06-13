'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCheck, TrendingUp, Star } from 'lucide-react';

interface DriverQuickPanelProps {
  isOnline: boolean;
  onToggle: () => void;
  totalTrips: number;
  avgRating: number;
}

// Knob travel in px: pill(48) - knob(20) - leftPad(2) - rightPad(2) = 24
const KNOB_TRAVEL = 24;

export default function DriverQuickPanel({
  isOnline,
  onToggle,
  totalTrips,
  avgRating,
}: DriverQuickPanelProps) {
  const rowRef  = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Animate on mount (set initial state without transition)
  useEffect(() => {
    if (!rowRef.current || !pillRef.current || !knobRef.current || !labelRef.current) return;
    gsap.set(rowRef.current,  { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' });
    gsap.set(pillRef.current, { backgroundColor: '#d1d5db' });
    gsap.set(knobRef.current, { x: 0 });
    gsap.set(labelRef.current, { color: '#4b5563' });
  }, []);

  // Animate on every toggle
  useEffect(() => {
    if (!rowRef.current || !pillRef.current || !knobRef.current || !labelRef.current) return;

    console.log('[DriverToggle] isOnline ->', isOnline);

    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.3 } });

    if (isOnline) {
      tl.to(rowRef.current,   { backgroundColor: '#3525CD', borderColor: '#3525CD' })
        .to(pillRef.current,  { backgroundColor: '#22c55e' }, '<')
        .to(knobRef.current,  { x: KNOB_TRAVEL, duration: 0.35, ease: 'back.out(1.5)' }, '<')
        .to(labelRef.current, { color: '#ffffff', duration: 0.2 }, '<');
    } else {
      tl.to(rowRef.current,   { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' })
        .to(pillRef.current,  { backgroundColor: '#d1d5db' }, '<')
        .to(knobRef.current,  { x: 0, duration: 0.35, ease: 'back.out(1.5)' }, '<')
        .to(labelRef.current, { color: '#4b5563', duration: 0.2 }, '<');
    }

    return () => { tl.kill(); };
  }, [isOnline]);

  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
      <p className="text-base font-bold font-bitter text-[#1B1B24]">Quick Panel</p>

      {/* Online toggle row — bg + border animated by GSAP, Tailwind only for layout */}
      <button
        ref={rowRef}
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5 border"
      >
        <span
          ref={labelRef}
          className="text-sm font-bitter font-medium"
        >
          Siap Menerima Pesanan
        </span>

        {/* Switch pill */}
        <span
          ref={pillRef}
          className="relative w-12 h-6 rounded-full shrink-0 overflow-hidden"
        >
          {/* Knob — GSAP animates translateX */}
          <span
            ref={knobRef}
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          />
        </span>
      </button>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-200 rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bitter">
            <CheckCheck className="w-3.5 h-3.5" />
            Selesai
          </div>
          <p className="text-xl font-bold font-bitter text-[#1B1B24]">
            {totalTrips} Order
          </p>
        </div>

        <div className="border border-gray-200 rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bitter">
            <TrendingUp className="w-3.5 h-3.5" />
            Rating
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <p className="text-xl font-bold font-bitter text-[#1B1B24]">{avgRating}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

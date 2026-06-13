'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, ArrowRight, ArrowLeft, ChevronUp } from 'lucide-react';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { OrderFormValues } from './schema';

const GoogleMapsPicker = dynamic(() => import('./GoogleMapsPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Memuat peta...</p>
    </div>
  ),
});

interface StepLocationFormProps {
  register: UseFormRegister<OrderFormValues>;
  watch: UseFormWatch<OrderFormValues>;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepLocationForm({
  register,
  watch,
  onLocationChange,
  onNext,
  onBack,
}: StepLocationFormProps) {
  const buyerLat = watch('buyerLat');
  const buyerLng = watch('buyerLng');
  const deliveryNotes = watch('deliveryNotes') ?? '';
  const [sheetExpanded, setSheetExpanded] = useState(true);

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Full-screen Map Background */}
      <div className="absolute inset-0">
        <GoogleMapsPicker
          onLocationChange={onLocationChange}
          initialLat={buyerLat}
          initialLng={buyerLng}
        />
      </div>

      {/* ── Floating Back Button (below progress card, which is rendered at page level) ── */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-[112px] left-4 z-20 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Transparent click overlay — minimizes sheet when tapping the map */}
      {sheetExpanded && (
        <div
          className="absolute inset-0 z-[5]"
          onClick={() => setSheetExpanded(false)}
        />
      )}

      {/* ── Floating Bottom Sheet ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ease-in-out ${
          sheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'
        }`}
      >
        <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
          {/* ── Minimized bar (always visible) — click to toggle ── */}
          <button
            type="button"
            onClick={() => setSheetExpanded(prev => !prev)}
            className="w-full pt-3 pb-2 px-5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium font-bitter">Pilih Lokasi Antar</span>
            </div>
            <ChevronUp
              className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                sheetExpanded ? 'rotate-0' : 'rotate-180'
              }`}
            />
          </button>

          {/* Sheet handle indicator */}
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-3" />

          {/* ── Expandable content ── */}
          <div className="px-5 pb-6 max-h-[55vh] overflow-y-auto">
            {/* Lokasi Antar */}
            <div className="space-y-3 mb-4">
              <label className="text-sm font-medium font-bitter">Lokasi Antar</label>
              <div className="flex items-center gap-2.5 border rounded-lg px-3 py-2.5 bg-white">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" fill="currentColor" />
                <span className="text-sm text-muted-foreground">Pilih pada maps di atas</span>
              </div>
            </div>

            {/* Lat / Lng read-only display */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                <input
                  type="text"
                  readOnly
                  value={buyerLat ? Number(buyerLat).toFixed(6) : ''}
                  placeholder="—"
                  className="w-full border rounded-md px-2.5 py-2 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                <input
                  type="text"
                  readOnly
                  value={buyerLng ? Number(buyerLng).toFixed(6) : ''}
                  placeholder="—"
                  className="w-full border rounded-md px-2.5 py-2 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {!buyerLat && (
              <p className="text-xs text-destructive mb-3">Lokasi belum dipilih</p>
            )}

            {/* Catatan Khusus */}
            <div className="space-y-1 mb-5">
              <label className="text-sm font-medium font-bitter">
                Catatan Khusus{' '}
                <span className="text-muted-foreground font-normal font-sans">(Opsional)</span>
              </label>
              <textarea
                {...register('deliveryNotes')}
                placeholder="Contoh: Tolong belikan yang merek Sidu, kalau tidak ada tidak apa-apa."
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <p className="text-[11px] text-muted-foreground text-right pr-1">
                {(deliveryNotes ?? '').length}/150 karakter
              </p>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={onNext}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Lanjut ke Bayar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { MapPin, ExternalLink } from 'lucide-react';

interface AddressCardProps {
  address: string;
  lat: number;
  lng: number;
}

export default function AddressCard({ address, lat, lng }: AddressCardProps) {
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

  return (
    <div className="border rounded-xl p-4 space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">Diantar ke</p>
      </div>

      {/* Address text */}
      <p className="text-sm text-foreground leading-snug">
        {address || `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`}
      </p>

      {/* Open Google Maps button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Buka Google Maps
      </a>
    </div>
  );
}

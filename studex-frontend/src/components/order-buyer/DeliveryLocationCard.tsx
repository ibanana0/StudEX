'use client';

import { Map, MapPin } from 'lucide-react';

interface DeliveryLocationCardProps {
  address: string;
  lat?: number | string | null;
  lng?: number | string | null;
}

export default function DeliveryLocationCard({ address, lat, lng }: DeliveryLocationCardProps) {
  const hasCoords = lat !== undefined && lat !== null && lng !== undefined && lng !== null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${Number(lat)},${Number(lng)}`
    : null;

  return (
    <div>
      <p className="text-sm font-bold font-bitter text-[#1B1B24] mb-2">Diantar ke</p>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-start gap-3 px-4 py-4">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {address || 'Belum ada nama tempat'}
          </p>
        </div>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100 text-sm font-semibold font-bitter text-primary hover:bg-primary/5 transition-colors"
          >
            <Map className="w-4 h-4" />
            Buka di Google Maps
          </a>
        )}
      </div>
    </div>
  );
}

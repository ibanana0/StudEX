'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapPin } from 'lucide-react';

// Fix broken default marker icons when bundled by webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LatLng {
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  onLocationChange: (location: LatLng) => void;
  defaultCenter?: LatLng;
  className?: string;
}

// Default center: UNS Surakarta campus area
const UNS_CENTER: LatLng = { lat: -7.5566, lng: 110.774 };

// ── Sub-components ──────────────────────────────────────────────────────────

function GeolocationTrigger({ onLocated }: { onLocated: (lat: number, lng: number) => void }) {
  const map = useMap();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || !navigator.geolocation) return;
    didRun.current = true;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.setView([coords.latitude, coords.longitude], 17);
        onLocated(coords.latitude, coords.longitude);
      },
      () => {
        // Permission denied or timeout — keep default view, don't emit a location
        map.setView([UNS_CENTER.lat, UNS_CENTER.lng], 15);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [map, onLocated]);

  return null;
}

function SearchControl({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    // GeoSearchControl in v4 is a factory function, not a class
    const searchControl = (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: false,
      retainZoomLevel: false,
      autoClose: true,
      searchLabel: 'Cari gedung atau tempat di kampus...',
    }) as L.Control;

    map.addControl(searchControl);

    const handleResult = (e: any) => {
      const lat: number = e.location.y;
      const lng: number = e.location.x;
      onSelectRef.current(lat, lng);
      map.setView([lat, lng], 17);
    };

    map.on('geosearch/showlocation', handleResult);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', handleResult);
    };
  }, [map]);

  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({
  position,
  onChange,
}: {
  position: LatLng;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = (e.target as L.Marker).getLatLng();
          onChange(lat, lng);
        },
      }}
    />
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function LeafletMap({
  onLocationChange,
  defaultCenter,
  className,
}: LeafletMapProps) {
  const [markerPos, setMarkerPos] = useState<LatLng | null>(defaultCenter ?? null);

  const handleChange = (lat: number, lng: number) => {
    const loc: LatLng = { lat, lng };
    setMarkerPos(loc);
    onLocationChange(loc);
  };

  const initialCenter: [number, number] = defaultCenter
    ? [defaultCenter.lat, defaultCenter.lng]
    : [UNS_CENTER.lat, UNS_CENTER.lng];

  return (
    <div className={`relative w-full rounded-lg overflow-hidden ${className ?? 'h-64'}`}>
      <MapContainer
        center={initialCenter}
        zoom={15}
        className="w-full h-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeolocationTrigger onLocated={handleChange} />
        <SearchControl onSelect={handleChange} />
        <MapClickHandler onClick={handleChange} />
        {markerPos && (
          <DraggableMarker position={markerPos} onChange={handleChange} />
        )}
      </MapContainer>

      {!markerPos && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 pointer-events-none rounded-lg gap-2">
          <MapPin className="text-white w-6 h-6 animate-bounce" />
          <p className="text-sm text-white bg-black/50 px-3 py-1 rounded-full">
            Mendeteksi lokasi GPS...
          </p>
        </div>
      )}
    </div>
  );
}

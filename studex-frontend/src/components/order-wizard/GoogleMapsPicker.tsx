'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GoogleMap,
  Autocomplete,
  MarkerF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { Loader2, Search } from 'lucide-react';

const LIBRARIES: ('places')[] = ['places'];

const DEFAULT_CENTER = { lat: -6.3780, lng: 106.8270 }; // Universitas Indonesia area

interface GoogleMapsPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  /** Height of the map container — defaults to filling parent (100%) */
  height?: string;
}

export default function GoogleMapsPicker({
  onLocationChange,
  initialLat,
  initialLng,
  height = '100%',
}: GoogleMapsPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: LIBRARIES,
  });

  const [center, setCenter] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : DEFAULT_CENTER
  );
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Try to get user's current location on mount
  useEffect(() => {
    if (!isLoaded) return;
    if (initialLat && initialLng) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(loc);
          setMarker(loc);
          mapRef.current?.panTo(loc);
          onLocationChange(pos.coords.latitude, pos.coords.longitude, '');
        },
        () => {
          // Geolocation denied/failed — use default center
        }
      );
    }
  }, [isLoaded, initialLat, initialLng, onLocationChange]);

  // Place selected from Autocomplete
  const onPlaceChanged = useCallback(() => {
    const ac = autocompleteRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const loc = place.geometry?.location;
    if (!loc) return;

    const lat = loc.lat();
    const lng = loc.lng();
    const address = place.formatted_address ?? '';

    setMarker({ lat, lng });
    setCenter({ lat, lng });
    mapRef.current?.panTo({ lat, lng });
    onLocationChange(lat, lng, address);
  }, [onLocationChange]);

  // Marker dragged
  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat == null || lng == null) return;
    setMarker({ lat, lng });
    setCenter({ lat, lng });
    onLocationChange(lat, lng, '');
  }, [onLocationChange]);

  // Map clicked — place marker on click
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat == null || lng == null) return;
    setMarker({ lat, lng });
    onLocationChange(lat, lng, '');
  }, [onLocationChange]);

  if (loadError) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-destructive">Gagal memuat Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-muted animate-pulse rounded-lg flex items-center justify-center gap-2" style={{ height }}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Floating Autocomplete search bar */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <Autocomplete
          onLoad={(ac) => { autocompleteRef.current = ac; }}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Cari lokasi (contoh: Kosan, Fakultas, Gedung...)"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </Autocomplete>
      </div>

      {/* Map — fills entire container */}
      <GoogleMap
        onLoad={(map) => { mapRef.current = map; }}
        center={center}
        zoom={16}
        onClick={onMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        }}
        mapContainerStyle={{ width: '100%', height: '100%' }}
      >
        {marker && (
          <MarkerF
            position={marker}
            draggable
            onDragEnd={onMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </div>
  );
}

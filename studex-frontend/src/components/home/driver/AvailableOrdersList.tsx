'use client';

import { useState, useEffect, useRef } from 'react';
import type { AvailableOrder } from '@/dummy_payload/driver_home';
import AvailableOrderCard from './AvailableOrderCard';

interface AvailableOrdersListProps {
  orders: AvailableOrder[];
  onAccept: (id: number) => void;
}

export default function AvailableOrdersList({ orders, onAccept }: AvailableOrdersListProps) {
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setFocusedId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Tidak ada orderan tersedia saat ini.
      </p>
    );
  }

  return (
    <div ref={listRef} className="space-y-4">
      {orders.map((order) => (
        <AvailableOrderCard
          key={order.id}
          order={order}
          isFocused={focusedId === order.id}
          onClick={() => setFocusedId(order.id)}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
}

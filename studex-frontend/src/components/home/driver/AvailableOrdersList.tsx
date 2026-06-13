'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { AvailableOrder } from '@/dummy_payload/driver_home';
import { useUserStore } from '@/stores/userStore';
import AvailableOrderCard from './AvailableOrderCard';

interface AvailableOrdersListProps {
  orders: AvailableOrder[];
}

export default function AvailableOrdersList({ orders }: AvailableOrdersListProps) {
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const acceptedOrderId = useUserStore((s) => s.acceptedOrderId);

  // Accepted order floats to top; rest keep original order
  const sorted = useMemo(() => {
    if (acceptedOrderId === null) return orders;
    return [
      ...orders.filter((o) => o.id === acceptedOrderId),
      ...orders.filter((o) => o.id !== acceptedOrderId),
    ];
  }, [orders, acceptedOrderId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setFocusedId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Tidak ada orderan tersedia saat ini.
      </p>
    );
  }

  return (
    <div ref={listRef} className="space-y-4">
      {sorted.map((order) => (
        <AvailableOrderCard
          key={order.id}
          order={order}
          isFocused={focusedId === order.id}
          isAccepted={order.id === acceptedOrderId}
          isLocked={acceptedOrderId !== null && order.id !== acceptedOrderId}
          onClick={() => setFocusedId(order.id)}
        />
      ))}
    </div>
  );
}

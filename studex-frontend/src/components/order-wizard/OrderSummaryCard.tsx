'use client';

import { ShoppingCart } from 'lucide-react';

interface OrderSummaryCardProps {
  shopName: string;
  items: { name: string; qty: number }[];
}

export default function OrderSummaryCard({ shopName, items }: OrderSummaryCardProps) {
  // Truncate items list
  const truncatedItems = items
    .map((item) => `${item.name} (${item.qty})`)
    .join(', ');
  const displayItems =
    truncatedItems.length > 60
      ? `${truncatedItems.slice(0, 57)}...`
      : truncatedItems;

  return (
    <div className="border rounded-xl p-4 flex gap-3 items-start">
      {/* Cart icon in light-blue square */}
      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
        <ShoppingCart className="w-5 h-5 text-primary" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{shopName}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayItems}</p>
      </div>
    </div>
  );
}

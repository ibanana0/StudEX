'use client';

import type { AvailableOrderItem } from '@/dummy_payload/driver_home';

interface OrderItemsCardProps {
  title: string;
  items: AvailableOrderItem[];
  interactive?: boolean;
  checkedIndices?: Set<number>;
  onToggle?: (index: number) => void;
}

export default function OrderItemsCard({
  title,
  items,
  interactive = false,
  checkedIndices = new Set(),
  onToggle,
}: OrderItemsCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
      <h2 className="text-lg font-bold font-bitter text-[#1B1B24]">{title}</h2>

      <div className="border border-gray-100 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onToggle?.(i)}
            disabled={!interactive}
            className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
              i < items.length - 1 ? 'border-b border-gray-100' : ''
            } ${interactive ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'cursor-default opacity-60'}`}
          >
            {/* Checkbox */}
            <span
              className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                checkedIndices.has(i)
                  ? 'border-primary bg-primary'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {checkedIndices.has(i) && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1B1B24] leading-tight">{item.name}</p>
              <p className="text-xs font-bold text-[#1B1B24] mt-0.5">{item.shopName}</p>
            </div>

            <span className="text-sm font-bold text-gray-500 shrink-0">{item.qty}x</span>
          </button>
        ))}
      </div>
    </div>
  );
}

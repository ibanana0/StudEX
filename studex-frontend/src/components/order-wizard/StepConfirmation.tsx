'use client';

import type { OrderFormValues } from './schema';
import AddressCard from './AddressCard';
import OrderSummaryCard from './OrderSummaryCard';

interface StepConfirmationProps {
  values: OrderFormValues;
}

export default function StepConfirmation({ values }: StepConfirmationProps) {
  const {
    shopName,
    items,
    buyerLat,
    buyerLng,
    deliveryAddress,
  } = values;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {/* Section label */}
      <p className="text-sm font-medium font-bitter">Konfirmasi Pesanan</p>

      {/* Address Card */}
      {buyerLat && buyerLng ? (
        <AddressCard
          address={deliveryAddress ?? ''}
          lat={buyerLat}
          lng={buyerLng}
        />
      ) : (
        <div className="border rounded-xl p-4 bg-muted">
          <p className="text-xs text-muted-foreground">Lokasi belum dipilih</p>
        </div>
      )}

      {/* Order Summary Card */}
      <OrderSummaryCard
        shopName={shopName}
        items={items.map((item) => ({ name: item.name, qty: item.qty }))}
      />

      {/* Items detail */}
      <div className="border rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium font-bitter">Detail Barang</p>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.name}{' '}
                <span className="text-muted-foreground">×{item.qty}</span>
              </span>
              {item.note && (
                <span className="text-xs text-muted-foreground italic truncate ml-2 max-w-[140px]">
                  {item.note}
                </span>
              )}
            </div>
          ))}
        </div>

        {values.notes && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Catatan:</span>{' '}
              {values.notes}
            </p>
          </div>
        )}
      </div>

      {/* P2P Payment notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1.5">
        <p className="text-sm font-semibold text-foreground">Pembayaran P2P</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pembayaran dilakukan secara langsung (face-to-face) dengan driver menggunakan QRIS saat barang diantar. Kesepakatan harga di luar sistem.
        </p>
      </div>
    </div>
  );
}

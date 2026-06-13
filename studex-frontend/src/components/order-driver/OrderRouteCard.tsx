'use client';

interface OrderRouteCardProps {
  pickupPoint: string;
  deliveryPoint: string;
}

export default function OrderRouteCard({ pickupPoint, deliveryPoint }: OrderRouteCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl px-4 py-4 space-y-3">
      {/* Tujuan (pickup) */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-400 shrink-0" />
        <div>
          <p className="text-xs font-bold font-bitter text-[#1B1B24]">Tujuan</p>
          <p className="text-sm text-gray-600 mt-0.5">{pickupPoint}</p>
        </div>
      </div>

      {/* Titik Antar (delivery) */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
        <div>
          <p className="text-xs font-bold font-bitter text-[#1B1B24]">Titik Antar</p>
          <p className="text-sm text-gray-600 mt-0.5">{deliveryPoint}</p>
        </div>
      </div>
    </div>
  );
}

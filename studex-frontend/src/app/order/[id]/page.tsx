'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, X, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderPolling } from '@/hooks/useOrderPolling';
import { formatRupiah, formatDate } from '@/lib/utils';
import api from '@/utils/api';
import type { OrderStatus } from '@/types';
import { DUMMY_ORDER } from '@/dummy_payload/order';

// To test with dummy data, replace `useOrderPolling` result:
//   const order = DUMMY_ORDER;
//   const isLoading = false;
//   const isError = false;

// ── Status display config ────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  MENCARI_DRIVER: 'Mencari Driver',
  DIPROSES_DRIVER: 'Driver Sedang Berbelanja',
  DALAM_PERJALANAN: 'Driver Menuju Lokasi Anda',
  DRIVER_SAMPAI: 'Driver Sudah Sampai',
  PESANAN_TIBA: 'Pesanan Tiba — Silakan Bayar',
  COMPLETED: 'Pesanan Selesai',
  CANCELLED: 'Pesanan Dibatalkan',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  MENCARI_DRIVER: 'bg-yellow-100 text-yellow-800',
  DIPROSES_DRIVER: 'bg-blue-100 text-blue-800',
  DALAM_PERJALANAN: 'bg-indigo-100 text-indigo-800',
  DRIVER_SAMPAI: 'bg-purple-100 text-purple-800',
  PESANAN_TIBA: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// ── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  orderId,
  onClose,
  onCancelled,
}: {
  orderId: number;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await api.patch(`/orders/${orderId}/cancel`, { cancelReason: reason || undefined });
      toast.success('Pesanan berhasil dibatalkan');
      onCancelled();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal membatalkan pesanan';
      toast.error(msg);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md bg-background rounded-t-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Batalkan Pesanan?</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Pesanan yang dibatalkan tidak bisa dikembalikan ke status sebelumnya.
        </p>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Alasan Pembatalan{' '}
            <span className="font-normal text-muted-foreground">(Opsional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Sudah tidak jadi pesan"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive/50"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Ya, Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: order, isLoading, isError } = useOrderPolling(
    isNaN(orderId) ? null : orderId
  );

  if (isNaN(orderId) || isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <button
          onClick={() => router.replace('/')}
          className="text-sm text-primary underline"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCancellable = order.status === 'MENCARI_DRIVER';
  const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED';

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background z-10">
          <button
            onClick={() => router.push('/')}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-base leading-tight">Lacak Pesanan</h1>
            <p className="text-xs text-muted-foreground">#{order.id}</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status]}`}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* ── Searching Animation (MENCARI_DRIVER) ── */}
          {order.status === 'MENCARI_DRIVER' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-ping [animation-delay:0.3s]" />
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-base">Mencari Driver Terdekat</p>
                <p className="text-sm text-muted-foreground">
                  Harap tunggu, sistem sedang mencarikan driver untukmu...
                </p>
              </div>
            </div>
          )}

          {/* ── Other active statuses ── */}
          {!isTerminal && order.status !== 'MENCARI_DRIVER' && (
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="font-medium">{STATUS_LABEL[order.status]}</p>
            </div>
          )}

          {/* ── Cancelled ── */}
          {order.status === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
              <p className="font-medium text-red-700">Pesanan Dibatalkan</p>
              {order.cancelReason && (
                <p className="text-sm text-red-600">Alasan: {order.cancelReason}</p>
              )}
              {order.cancelledBy && (
                <p className="text-xs text-red-400">
                  Dibatalkan oleh: {order.cancelledBy === 'SYSTEM' ? 'Sistem (tidak ada driver)' : 'Kamu'}
                </p>
              )}
            </div>
          )}

          {/* ── Completed ── */}
          {order.status === 'COMPLETED' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-1">
              <p className="font-semibold text-green-700">Pesanan Selesai!</p>
              <p className="text-sm text-green-600">Terima kasih telah menggunakan StudEx</p>
            </div>
          )}

          {/* ── Order Detail Card ── */}
          <div className="border rounded-xl p-4 space-y-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-base">{order.shopName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="border-t pt-3 space-y-1.5">
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                Daftar Belanja
              </p>
              {order.itemsDescription.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.name}{' '}
                    <span className="text-muted-foreground">×{item.qty}</span>
                  </span>
                  {item.note && (
                    <span className="text-xs text-muted-foreground italic">{item.note}</span>
                  )}
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="border-t pt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Catatan: </span>
                {order.notes}
              </div>
            )}

            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Est. Harga Barang</span>
                <span>{formatRupiah(Number(order.estItemPrice))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkir Jastip</span>
                <span>{formatRupiah(Number(order.deliveryFee))}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t">
                <span>Total Bayar</span>
                <span>{formatRupiah(Number(order.totalPrice))}</span>
              </div>
            </div>
          </div>

          {/* Polling indicator for active orders */}
          {!isTerminal && (
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Status diperbarui otomatis setiap 5 detik
            </p>
          )}
        </div>

        {/* ── Cancel Button ── */}
        {isCancellable && (
          <div className="p-4 border-t">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full border border-destructive text-destructive rounded-xl py-3 font-semibold hover:bg-destructive/5 transition-colors"
            >
              Batalkan Pesanan
            </button>
          </div>
        )}

        {/* ── Back to Home for terminal states ── */}
        {isTerminal && (
          <div className="p-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>

      {showCancelModal && (
        <CancelModal
          orderId={order.id}
          onClose={() => setShowCancelModal(false)}
          onCancelled={() => {
            setShowCancelModal(false);
          }}
        />
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

interface ReportModalProps {
  reportedId: number;
  reportedName: string;
  orderId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_REASONS = [
  'Mark-up harga tidak wajar',
  'Barang tidak sesuai',
  'Perilaku buruk',
  'Penipuan',
  'Lainnya',
];

export default function ReportModal({
  reportedId,
  reportedName,
  orderId,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Pilih alasan pelaporan terlebih dahulu');
      return;
    }

    if (!details.trim()) {
      toast.error('Isi detail keluhan terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/reports', {
        reportedId,
        orderId: orderId ?? undefined,
        reason,
        details: details.trim(),
      });
      toast.success('Laporan berhasil dikirim');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal mengirim laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-8">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <Flag className="w-7 h-7" />
          </div>
          <h2 className="font-bitter text-xl text-[#1B1B24]">Laporkan Pengguna</h2>
          <p className="text-sm text-[#5F5A74] leading-relaxed">
            Laporkan pelanggaran yang dilakukan oleh{' '}
            <b className="text-[#1B1B24] font-semibold">{reportedName}</b>.
            Laporan akan ditinjau oleh tim admin.
          </p>
        </div>

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1B1B24]">
            Alasan Pelaporan
          </label>
          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  reason === r
                    ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                    : 'bg-gray-100 text-[#5F5A74] hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Details Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1B1B24]">
            Detail Keluhan
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Jelaskan secara singkat apa yang terjadi..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className={`w-full py-4 rounded-2xl font-bitter font-semibold text-base flex items-center justify-center gap-2 transition-all ${
              !isSubmitting && reason
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Flag className="w-4 h-4" />
                Kirim Laporan
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-semibold font-bitter text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors text-center"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

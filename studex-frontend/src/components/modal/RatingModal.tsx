'use client';

import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

interface RatingModalProps {
  orderId: number;
  driverName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({
  orderId,
  driverName,
  onClose,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Pilih jumlah bintang terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/ratings', {
        orderId,
        score: rating,
      });
      toast.success('Terima kasih! Rating berhasil dikirim.');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal mengirim rating');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[380px] bg-white rounded-3xl p-6 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Illustration & Info */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 bg-[#F4F1FF] rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>
          <h2 className="text-xl font-bold font-bitter text-[#1B1B24]">
            Pesanan Selesai!
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed px-2">
            Bagaimana performa jastip dari <b className="text-primary font-semibold">{driverName}</b> hari ini?
          </p>
        </div>

        {/* Stars Row */}
        <div className="flex justify-center items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hover || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform active:scale-95 duration-100 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-colors duration-150 ${
                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Description Label based on star count */}
        {rating > 0 && (
          <p className="text-xs font-semibold text-center text-primary tracking-wide uppercase font-bitter animate-in fade-in slide-in-from-top-1 duration-200">
            {rating === 1 && 'Sangat Buruk 😞'}
            {rating === 2 && 'Kurang Memuaskan 🙁'}
            {rating === 3 && 'Cukup Baik 😐'}
            {rating === 4 && 'Sangat Baik! 🙂'}
            {rating === 5 && 'Luar Biasa, Sempurna! 😍'}
          </p>
        )}

        {/* Action Button */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bitter font-semibold text-base flex items-center justify-center gap-2 transition-all ${
              rating > 0 && !isSubmitting
                ? 'bg-primary text-white hover:opacity-95 shadow-md shadow-primary/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Kirim Penilaian'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-semibold font-bitter text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors text-center"
          >
            Lewati
          </button>
        </div>
      </div>
    </div>
  );
}

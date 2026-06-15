'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import BottomNav from '@/components/ui/BottomNav';
import FileUploadZone from '@/components/profile/FileUploadZone';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read file'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function DaftarDriverPage() {
  const router = useRouter();
  const { user, isLoading, canUseDriverMode, refreshMe } = useAuth();

  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = Boolean(ktmFile && qrisFile && agreed);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'ADMIN' || canUseDriverMode || user.hasDriverApplication) {
      router.replace('/profile');
    }
  }, [canUseDriverMode, isLoading, router, user]);

  const handleSubmit = async () => {
    if (!canSubmit || !ktmFile || !qrisFile) {
      return;
    }

    setIsSubmitting(true);
    try {
      const [ktmUrl, qrisUrl] = await Promise.all([
        fileToDataUrl(ktmFile),
        fileToDataUrl(qrisFile),
      ]);

      await api.post('/drivers/register', {
        ktmUrl,
        qrisUrl,
      });

      await refreshMe();
      toast.success('Pendaftaran driver berhasil dikirim! Menunggu verifikasi admin.');
      router.push('/profile');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal mengirim pendaftaran driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-bitter text-lg text-[#5F5A74]">Memuat formulir driver...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col relative">
      <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg font-bitter">Profil</h1>
      </div>

      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-6">
        <h2 className="text-[22px] font-bold font-bitter text-[#1B1B24] leading-tight">
          Daftar Driver StudEx
        </h2>

        <FileUploadZone
          label="Kartu Mahasiswa (KTM)"
          description="Pastikan data terlihat jelas untuk verifikasi identitas mahasiswa."
          icon="id-card"
          file={ktmFile}
          onFileChange={setKtmFile}
        />

        <FileUploadZone
          label="QRIS Pembayaran"
          description="Digunakan untuk menerima pembayaran jastip langsung dari pembeli."
          icon="qr"
          file={qrisFile}
          onFileChange={setQrisFile}
        />

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-border text-primary accent-primary shrink-0 cursor-pointer"
          />
          <span className="text-sm text-foreground leading-relaxed">
            Saya menyetujui{' '}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast('Halaman Syarat & Ketentuan belum tersedia', { icon: '📄' });
              }}
            >
              Syarat dan Ketentuan
            </button>{' '}
            pendaftaran driver StudEx di lingkungan kampus.
          </span>
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold font-bitter text-base transition-opacity ${
            canSubmit && !isSubmitting
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Kirim Pendaftaran
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      <BottomNav />
    </div>
  );
}

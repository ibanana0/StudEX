'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import BottomNav from '@/components/ui/BottomNav';
import FileUploadZone from '@/components/profile/FileUploadZone';

// ── Daftar Driver Page ──────────────────────────────────────────────────────
export default function DaftarDriverPage() {
  const router = useRouter();

  // TODO [AUTH]: Check if user is logged in and does NOT already have a driver account.
  // If user already has driver account, redirect to /profile or show a "already registered" message.
  // Example:
  //   const { user, isLoading } = useAuth();
  //   if (user?.hasDriverAccount) { router.replace('/profile'); return null; }

  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  const canSubmit = ktmFile && qrisFile && agreed;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // TODO [API]: Upload KTM and QRIS files to backend, then create driver registration.
    // Example:
    //   const formData = new FormData();
    //   formData.append('ktm', ktmFile);
    //   formData.append('qris', qrisFile);
    //   await api.post('/driver/register', formData);

    toast.success('Pendaftaran driver berhasil dikirim! Menunggu verifikasi admin.');
    router.push('/profile');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white w-[430px] mx-auto relative">
      {/* ── Header ── */}
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

      {/* ── Scrollable Content ── */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-6">
        {/* Page Title */}
        <h2 className="text-[22px] font-bold font-bitter text-[#1B1B24] leading-tight">
          Daftar Driver StudEx
        </h2>

        {/* KTM Upload */}
        <FileUploadZone
          label="Kartu Mahasiswa (KTM)"
          description="Pastikan data terlihat jelas untuk verifikasi identitas mahasiswa."
          icon="id-card"
          file={ktmFile}
          onFileChange={setKtmFile}
        />

        {/* QRIS Upload */}
        <FileUploadZone
          label="QRIS Pembayaran"
          description="Digunakan untuk menerima pembayaran jastip langsung dari pembeli."
          icon="qr"
          file={qrisFile}
          onFileChange={setQrisFile}
        />

        {/* Terms Agreement */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-border text-primary accent-primary shrink-0 cursor-pointer"
          />
          <span className="text-sm text-foreground leading-relaxed">
            Saya menyetujui{' '}
            {/* TODO: Link to actual Syarat & Ketentuan page */}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO [ROUTE]: Navigate to /syarat-ketentuan page
                toast('Halaman Syarat & Ketentuan belum tersedia', { icon: '📄' });
              }}
            >
              Syarat dan Ketentuan
            </button>{' '}
            pendaftaran driver StudEx di lingkungan kampus.
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold font-bitter text-base transition-opacity ${
            canSubmit
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Kirim Pendaftaran
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft, ArrowRight, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import { formatRupiah } from '@/lib/utils';
import type { LatLng } from '@/components/map/LeafletMap';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Memuat peta...</p>
    </div>
  ),
});

// ── Zod Schema ───────────────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi'),
  qty: z.number().int().min(1, 'Minimal 1'),
  note: z.string().optional(),
});

const orderSchema = z.object({
  shopName: z.string().min(1, 'Nama toko wajib diisi'),
  items: z.array(itemSchema).min(1, 'Tambahkan minimal 1 item'),
  notes: z.string().optional(),
  estItemPrice: z.number().min(0, 'Harga tidak boleh negatif'),
  deliveryFee: z.number().min(1000, 'Ongkir minimal Rp1.000'),
  buyerLat: z.number().optional(),
  buyerLng: z.number().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// ── Component ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Detail', 'Lokasi'];

export default function OrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      shopName: '',
      items: [{ name: '', qty: 1, note: '' }],
      notes: '',
      estItemPrice: 0,
      deliveryFee: 5000,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = form;

  const buyerLat = watch('buyerLat');
  const buyerLng = watch('buyerLng');
  const estItemPrice = watch('estItemPrice') || 0;
  const deliveryFee = watch('deliveryFee') || 0;

  const handleLocationChange = (loc: LatLng) => {
    setValue('buyerLat', loc.lat, { shouldValidate: true });
    setValue('buyerLng', loc.lng, { shouldValidate: true });
  };

  const goNext = async () => {
    const step1Fields: (keyof OrderFormValues)[] = [
      'shopName', 'items', 'estItemPrice', 'deliveryFee',
    ];
    const valid = await trigger(step1Fields);
    if (valid) setStep(1);
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (!values.buyerLat || !values.buyerLng) {
      toast.error('Pilih lokasi pengantaran di peta terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        shopName: values.shopName,
        itemsDescription: values.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          ...(item.note?.trim() ? { note: item.note.trim() } : {}),
        })),
        notes: values.notes?.trim() || undefined,
        estItemPrice: values.estItemPrice,
        deliveryFee: values.deliveryFee,
        buyerLat: values.buyerLat,
        buyerLng: values.buyerLng,
      };

      const res = await api.post('/orders', payload);
      const orderId: number = res.data.data.id;
      toast.success('Pesanan berhasil dibuat!');
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Gagal membuat pesanan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background z-10">
        <button
          type="button"
          onClick={() => (step === 0 ? router.back() : setStep(0))}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Buat Jastip Baru</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex px-4 pt-4 gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <p
              className={`text-xs mt-1 ${
                i === step ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        {/* ── Step 1: Detail ── */}
        {step === 0 && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Shop Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama Toko / Kantin</label>
              <input
                {...register('shopName')}
                placeholder="Contoh: Kantin FT Mpok Nur"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.shopName && (
                <p className="text-xs text-destructive">{errors.shopName.message}</p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Daftar Barang</label>
                <button
                  type="button"
                  onClick={() => append({ name: '', qty: 1, note: '' })}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Barang
                </button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      {...register(`items.${index}.name`)}
                      placeholder="Nama makanan / barang"
                      className="flex-1 border rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.getValues(`items.${index}.qty`);
                          if (current > 1) setValue(`items.${index}.qty`, current - 1);
                        }}
                        className="w-7 h-7 rounded-full border flex items-center justify-center font-bold hover:bg-muted"
                      >
                        −
                      </button>
                      <input
                        {...register(`items.${index}.qty`, { valueAsNumber: true })}
                        type="number"
                        min={1}
                        className="w-10 text-center border rounded-md py-1 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.getValues(`items.${index}.qty`);
                          setValue(`items.${index}.qty`, current + 1);
                        }}
                        className="w-7 h-7 rounded-full border flex items-center justify-center font-bold hover:bg-muted"
                      >
                        +
                      </button>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-destructive hover:opacity-70 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    {...register(`items.${index}.note`)}
                    placeholder="Catatan item (opsional — mis: pedas, tidak pakai es)"
                    className="w-full border rounded-md px-2.5 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.items?.[index]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.items[index].name?.message}
                    </p>
                  )}
                </div>
              ))}
              {errors.items?.root && (
                <p className="text-xs text-destructive">{errors.items.root.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Catatan Tambahan{' '}
                <span className="text-muted-foreground font-normal">(Opsional)</span>
              </label>
              <textarea
                {...register('notes')}
                placeholder="Contoh: Sambal dipisah, atau titip ke pos satpam kalau tidak ada di kos"
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Estimasi Harga */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Estimasi Harga Barang (Rp)</label>
              <input
                {...register('estItemPrice', { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="Contoh: 25000"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.estItemPrice && (
                <p className="text-xs text-destructive">{errors.estItemPrice.message}</p>
              )}
            </div>

            {/* Ongkir */}
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Ongkir Jastip (Rp){' '}
                <span className="text-muted-foreground font-normal">min. Rp1.000</span>
              </label>
              <input
                {...register('deliveryFee', { valueAsNumber: true })}
                type="number"
                min={1000}
                placeholder="Contoh: 5000"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.deliveryFee && (
                <p className="text-xs text-destructive">{errors.deliveryFee.message}</p>
              )}
            </div>

            {/* Total Preview */}
            {(Number(estItemPrice) > 0 || Number(deliveryFee) > 0) && (
              <div className="bg-muted rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Harga Barang</span>
                  <span>{formatRupiah(Number(estItemPrice))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Ongkir Jastip</span>
                  <span>{formatRupiah(Number(deliveryFee))}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1.5">
                  <span>Total Bayar</span>
                  <span>{formatRupiah(Number(estItemPrice) + Number(deliveryFee))}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Lokasi ── */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Titik Pengantaran
              </label>
              <p className="text-xs text-muted-foreground">
                Peta akan otomatis mendeteksi GPS-mu. Drag pin atau klik di peta untuk
                menyesuaikan lokasi.
              </p>
            </div>

            <LeafletMap onLocationChange={handleLocationChange} className="h-72" />

            {buyerLat && buyerLng ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>
                  Lat: {Number(buyerLat).toFixed(6)}, Lng: {Number(buyerLng).toFixed(6)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-destructive">Lokasi belum dipilih</p>
            )}

            {/* Order Summary */}
            <div className="border rounded-lg p-3 space-y-2 text-sm">
              <p className="font-medium">Ringkasan Pesanan</p>
              <p className="text-muted-foreground text-xs">{watch('shopName')}</p>
              <ul className="space-y-0.5">
                {watch('items').map((item, i) => (
                  <li key={i} className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    {item.note && <span className="italic truncate ml-2">{item.note}</span>}
                  </li>
                ))}
              </ul>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Bayar</span>
                <span>{formatRupiah(Number(estItemPrice) + Number(deliveryFee))}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer CTA ── */}
        <div className="p-4 border-t">
          {step === 0 ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Lanjut ke Lokasi <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !buyerLat || !buyerLng}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Membuat Pesanan...
                </>
              ) : (
                'Buat Pesanan'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

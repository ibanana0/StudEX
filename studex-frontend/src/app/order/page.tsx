'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  BubbleProgress,
  StepDetailForm,
  StepLocationForm,
  StepConfirmation,
  orderSchema,
  type OrderFormValues,
} from '@/components/order-wizard';

// ── Constants ────────────────────────────────────────────────────────────────
const STEP_LABELS = ['Detail', 'Lokasi', 'Buat Pesanan'];

// ── Component ────────────────────────────────────────────────────────────────
export default function OrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      shopName: '',
      items: [{ name: '', qty: 1, note: '' }],
      notes: '',
      buyerLat: undefined,
      buyerLng: undefined,
      deliveryAddress: '',
      deliveryNotes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { register, handleSubmit, setValue, watch, trigger, getValues, formState: { errors } } = form;

  // ── Location callback ──────────────────────────────────────────────────────
  const handleLocationChange = useCallback(
    (lat: number, lng: number, address: string) => {
      setValue('buyerLat', lat, { shouldValidate: true });
      setValue('buyerLng', lng, { shouldValidate: true });
      if (address) setValue('deliveryAddress', address, { shouldValidate: true });
    },
    [setValue]
  );

  // ── Step navigation ────────────────────────────────────────────────────────
  const goNext = async () => {
    if (step === 0) {
      const step1Fields: (keyof OrderFormValues)[] = ['shopName', 'items'];
      const valid = await trigger(step1Fields);
      if (valid) setStep(1);
    } else if (step === 1) {
      const step2Fields: (keyof OrderFormValues)[] = ['buyerLat', 'buyerLng'];
      const valid = await trigger(step2Fields);
      if (!valid) {
        toast.error('Pilih lokasi pengantaran terlebih dahulu');
        return;
      }
      setStep(2);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  // ── Submit (placeholder) ───────────────────────────────────────────────────
  const onSubmit = (values: OrderFormValues) => {
    console.log('[OrderWizard] Submitting order:', values);
    toast.success('Pesanan berhasil dibuat! (placeholder)');
    // TODO: Wire up backend API call
    // router.push(`/order/${newOrderId}`);
  };

  // ── Step 2 has its own layout (full-page map + floating bottom sheet) ─────
  const isLocationStep = step === 1;

  return (
    <div className="min-h-screen bg-background flex flex-col w-[430px] mx-auto relative">
      {/* ── Sticky Header (hidden on location step — uses floating elements instead) ── */}
      {!isLocationStep && (
        <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background z-10">
          <button
            type="button"
            onClick={goBack}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg font-bitter">Buat Jastip Baru</h1>
        </div>
      )}

      {/* ── Persistent BubbleProgress — single instance, morphs across steps for smooth GSAP ── */}
      <div
        className={
          isLocationStep
            ? 'absolute top-4 left-4 right-4 z-20 w-[calc(100%-2rem)] max-w-[398px]'
            : 'relative'
        }
      >
        <BubbleProgress
          currentStep={step}
          labels={STEP_LABELS}
          floating={isLocationStep}
          title={isLocationStep ? 'Detail Jastip' : undefined}
        />
      </div>

      {/* ── Step Content ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        {step === 0 && (
          <StepDetailForm
            register={register}
            setValue={setValue}
            watch={watch}
            getValues={getValues as (name: `items.${number}.qty`) => number}
            errors={errors}
            fields={fields}
            append={append}
            remove={remove}
          />
        )}

        {step === 1 && (
          <StepLocationForm
            register={register}
            watch={watch}
            onLocationChange={handleLocationChange}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === 2 && (
          <StepConfirmation values={watch()} />
        )}

        {/* ── Footer CTA (hidden for step 1 — CTA lives in the floating bottom sheet) ── */}
        {!isLocationStep && (
          <div className="p-4 border-t sticky bottom-0 bg-background">
            {step === 0 ? (
              <button
                type="button"
                onClick={goNext}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Lanjut ke Lokasi
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 border border-primary text-primary rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Pilih Lokasi
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Buat Pesanan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

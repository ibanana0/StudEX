'use client';

import { Plus } from 'lucide-react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import type { OrderFormValues } from './schema';
import ItemField from './ItemField';

interface StepDetailFormProps {
  register: UseFormRegister<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  watch: UseFormWatch<OrderFormValues>;
  getValues: (name: `items.${number}.qty`) => number;
  errors: FieldErrors<OrderFormValues>;
  fields: { id: string }[];
  append: UseFieldArrayAppend<OrderFormValues, 'items'>;
  remove: UseFieldArrayRemove;
}

export default function StepDetailForm({
  register,
  setValue,
  watch,
  getValues,
  errors,
  fields,
  append,
  remove,
}: StepDetailFormProps) {
  const notesValue = watch('notes') ?? '';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
      {/* Shop Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium font-bitter">Nama Toko / Kantin</label>
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
          <label className="text-sm font-medium font-bitter">Daftar Barang</label>
          <button
            type="button"
            onClick={() => append({ name: '', qty: 1, note: '' })}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Barang
          </button>
        </div>

        {fields.map((field, index) => (
          <ItemField
            key={field.id}
            index={index}
            register={register}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            errors={errors}
            onRemove={remove}
            canRemove={fields.length > 1}
          />
        ))}

        {errors.items?.root && (
          <p className="text-xs text-destructive">{errors.items.root.message}</p>
        )}
      </div>

      {/* General Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium font-bitter">
          Catatan Tambahan{' '}
          <span className="text-muted-foreground font-normal font-sans">(Opsional)</span>
        </label>
        <textarea
          {...register('notes')}
          placeholder="Contoh: Sambal dipisah, atau titip ke pos satpam kalau tidak ada di kos"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <p className="text-[11px] text-muted-foreground text-right pr-1">
          {(notesValue ?? '').length}/200 karakter
        </p>
      </div>
    </div>
  );
}

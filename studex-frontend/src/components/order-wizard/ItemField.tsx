'use client';

import { Trash2 } from 'lucide-react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import type { OrderFormValues } from './schema';

interface ItemFieldProps {
  index: number;
  register: UseFormRegister<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  getValues: (name: `items.${number}.qty`) => number;
  watch: UseFormWatch<OrderFormValues>;
  errors: FieldErrors<OrderFormValues>;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function ItemField({
  index,
  register,
  setValue,
  getValues,
  watch,
  errors,
  onRemove,
  canRemove,
}: ItemFieldProps) {
  const noteValue = watch(`items.${index}.note`) ?? '';

  return (
    <div className="border rounded-lg p-3 space-y-2">
      {/* Name + qty stepper + remove */}
      <div className="flex gap-2 items-center">
        <input
          {...register(`items.${index}.name`)}
          placeholder="Nama makanan / barang"
          className="flex-1 border rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        {/* Qty stepper */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              const current = getValues(`items.${index}.qty`);
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
              const current = getValues(`items.${index}.qty`);
              setValue(`items.${index}.qty`, current + 1);
            }}
            className="w-7 h-7 rounded-full border flex items-center justify-center font-bold hover:bg-muted"
          >
            +
          </button>
        </div>

        {/* Remove button */}
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-destructive hover:opacity-70 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Item note with character counter */}
      <div className="space-y-0.5">
        <input
          {...register(`items.${index}.note`)}
          placeholder="Catatan item (opsional — mis: pedas, tidak pakai es)"
          className="w-full border rounded-md px-2.5 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-[10px] text-muted-foreground text-right pr-1">
          {(noteValue ?? '').length}/100 karakter
        </p>
      </div>

      {/* Validation errors */}
      {errors.items?.[index]?.name && (
        <p className="text-xs text-destructive">
          {errors.items[index].name?.message}
        </p>
      )}
    </div>
  );
}

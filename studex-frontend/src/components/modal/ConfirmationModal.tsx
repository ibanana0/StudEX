'use client';

import { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  hasInput?: boolean;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  inputPlaceholder?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  icon: Icon,
  isLoading = false,
  hasInput = false,
  inputValue = '',
  onInputChange,
  inputPlaceholder = 'Masukkan nilai...',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 animate-in fade-in duration-200"
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle drag indicator */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* Icon wrapper */}
        {Icon && (
          <div className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto ${hasInput ? 'mb-3' : 'mb-4'}`}>
            <Icon className="w-7 h-7 text-primary" />
          </div>
        )}

        {/* Text content */}
        <h3 className="text-center text-lg font-bold font-bitter text-[#1B1B24] mb-2 leading-tight">
          {title}
        </h3>
        <p className={`text-center text-sm text-gray-500 leading-relaxed px-2 ${hasInput ? 'mb-4' : 'mb-6'}`}>
          {description}
        </p>

        {/* Optional input field (e.g. for suspension duration in hours) */}
        {hasInput && onInputChange && (
          <div className="mb-4 px-2">
            <input
              type="number"
              min="1"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-center text-base font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/50"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className={hasInput ? 'flex gap-3' : 'space-y-3'}>
          {hasInput ? (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 bg-gray-100 text-[#1B1B24] rounded-2xl py-3 font-semibold font-bitter text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className="flex-1 bg-primary text-white rounded-2xl py-3 font-bold font-bitter text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className="w-full bg-primary text-white rounded-2xl py-4 font-bold font-bitter text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {confirmLabel}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="w-full bg-gray-100 text-[#1B1B24] rounded-2xl py-4 font-semibold font-bitter text-base hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

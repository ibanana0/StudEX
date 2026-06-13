'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, X, ImageIcon } from 'lucide-react';

interface FileUploadZoneProps {
  label: string;
  description: string;
  icon: 'id-card' | 'qr';
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function FileUploadZone({
  label,
  description,
  icon,
  accept = '.pdf,.png,.jpg,.jpeg',
  file,
  onFileChange,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) onFileChange(droppedFile);
    },
    [onFileChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileChange(selected);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="space-y-2">
      {/* Label */}
      <div>
        <label className="text-sm font-semibold font-bitter text-[#1B1B24]">
          {label}
          <span className="text-destructive ml-0.5">*</span>
        </label>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[140px] px-4 py-5 ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : file
              ? 'border-primary/30 bg-primary/5'
              : 'border-border bg-muted/40 hover:border-primary/40 hover:bg-primary/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {file ? (
          /* File selected state */
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {isImage ? (
                <ImageIcon className="w-5 h-5 text-primary" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1B1B24] truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        ) : (
          /* Empty state */
          <>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              {icon === 'id-card' ? (
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              ) : (
                <Upload className="w-5 h-5 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {icon === 'id-card' ? 'Upload Foto KTM' : 'Upload QRIS E-Wallet'}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              PDF, PNG, atau JPG (maks. 5 MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

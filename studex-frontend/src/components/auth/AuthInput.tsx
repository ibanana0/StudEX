'use client';

import { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon: Icon, error, ...props }, ref) => (
    <div>
      <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
        <Icon className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
        <input
          ref={ref}
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1 pl-1">{error}</p>
      )}
    </div>
  )
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;

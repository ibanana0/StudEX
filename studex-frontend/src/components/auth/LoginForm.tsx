'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginFormValues } from './schema';
import AuthInput from './AuthInput';

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    // TODO: connect to auth API
    console.log('Login:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-5">
      <div>
        <label className="block text-sm font-bold font-bitter mb-2">Username</label>
        <AuthInput
          icon={User}
          placeholder="Budi Santoso"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold font-bitter">Password</label>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-primary font-bitter font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Ubah Kata Sandi
          </button>
        </div>
        <AuthInput
          icon={Lock}
          type="password"
          placeholder="budisantoso@student.ui.ac.id"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-3">
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-primary text-white font-bitter font-semibold text-base tracking-wide"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => router.push('/register')}
          className="w-full py-4 rounded-2xl bg-primary/10 text-primary font-bitter font-semibold text-base tracking-wide"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}

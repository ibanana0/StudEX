'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, RotateCcw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormValues } from './schema';
import AuthInput from './AuthInput';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import type { AuthPayload, SessionMode } from '@/types';
import { SessionModeChooser } from '@/components/profile';

export default function LoginForm() {
  const router = useRouter();
  const { setAuth, setSessionMode } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<AuthPayload | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const finishLogin = (payload: AuthPayload) => {
    setAuth(payload);

    if (payload.user.role === 'ADMIN') {
      router.replace('/admin/drivers');
      return;
    }

    if (payload.needsProfileCompletion) {
      router.replace('/register');
      return;
    }

    if (payload.canUseDriverMode) {
      setPendingPayload(payload);
      return;
    }

    setSessionMode('BUYER');
    router.replace('/');
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post<AuthPayload>('/auth/login', data);
      toast.success('Login berhasil');
      finishLogin(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error('Google credential tidak tersedia');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<AuthPayload>('/auth/google', {
        idToken: credentialResponse.credential,
      });
      toast.success('Login Google berhasil');
      finishLogin(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login Google gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingPayload) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <SessionModeChooser
          onSelect={(mode: SessionMode) => {
            setAuth(pendingPayload);
            setSessionMode(mode);
            setPendingPayload(null);
            toast.success(
              mode === 'DRIVER'
                ? 'Masuk ke mode Driver'
                : 'Masuk ke mode Pembeli'
            );
            router.replace('/');
          }}
        />

        <button
          type="button"
          onClick={() => setPendingPayload(null)}
          className="w-full rounded-2xl bg-[#F4F1FF] py-4 font-bitter font-semibold text-[#3525CD]"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-5">
      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Email</label>
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="budisantoso@student.ui.ac.id"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-bold font-bitter">Password</label>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-primary font-bitter font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            Ubah Kata Sandi
          </button>
        </div>
        <AuthInput
          icon={Lock}
          type="password"
          placeholder="Masukkan password kamu"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3525CD] py-4 font-bitter text-base font-semibold tracking-wide text-white disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Login
        </button>

        <div className="rounded-2xl border border-gray-200 p-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Login Google dibatalkan')}
            theme="outline"
            text="continue_with"
            shape="pill"
            width="100%"
          />
        </div>

        <button
          type="button"
          onClick={() => router.push('/register')}
          className="w-full rounded-2xl bg-[#F4F1FF] py-4 font-bitter text-base font-semibold tracking-wide text-[#3525CD]"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}

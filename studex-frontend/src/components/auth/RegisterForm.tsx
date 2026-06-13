'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Phone, GraduationCap, School, IdCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  profileCompletionSchema,
  registerSchema,
  type ProfileCompletionFormValues,
  type RegisterFormValues,
} from './schema';
import AuthInput from './AuthInput';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import type { AuthPayload } from '@/types';

type FormValues = RegisterFormValues | ProfileCompletionFormValues;

export default function RegisterForm() {
  const router = useRouter();
  const {
    user,
    needsProfileCompletion,
    setAuth,
    setSessionMode,
  } = useAuth();

  const isProfileCompletion = Boolean(user && needsProfileCompletion);
  const resolverSchema = isProfileCompletion ? profileCompletionSchema : registerSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      username: user?.username ?? '',
      name: user?.name ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      fakultas: user?.fakultas ?? '',
      jurusan: user?.jurusan ?? '',
      universitas: user?.universitas ?? '',
    } as FormValues,
  });

  useEffect(() => {
    reset({
      username: user?.username ?? '',
      name: user?.name ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      fakultas: user?.fakultas ?? '',
      jurusan: user?.jurusan ?? '',
      universitas: user?.universitas ?? '',
    } as FormValues);
  }, [reset, user]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isProfileCompletion) {
        const response = await api.patch<AuthPayload>('/auth/profile', {
          username: data.username,
          name: data.name,
          phoneNumber: data.phoneNumber,
          fakultas: data.fakultas,
          jurusan: data.jurusan,
          universitas: data.universitas,
        });

        setAuth(response.data);
        if (!response.data.canUseDriverMode) {
          setSessionMode('BUYER');
        }
        toast.success('Profil berhasil dilengkapi');
        router.replace('/');
        return;
      }

      const response = await api.post<AuthPayload>('/auth/register', data);
      setAuth(response.data);
      setSessionMode('BUYER');
      toast.success('Akun berhasil dibuat');
      router.replace('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Permintaan gagal diproses');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Username</label>
        <AuthInput
          icon={User}
          placeholder="budisehat"
          autoComplete="username"
          error={errors.username?.message as string | undefined}
          {...register('username')}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Nama Lengkap</label>
        <AuthInput
          icon={IdCard}
          placeholder="Budi Santoso"
          autoComplete="name"
          error={errors.name?.message as string | undefined}
          {...register('name')}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Email</label>
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="budisantoso@student.ui.ac.id"
          autoComplete="email"
          readOnly={isProfileCompletion}
          error={errors.email?.message as string | undefined}
          {...register('email')}
        />
      </div>

      {!isProfileCompletion ? (
        <div>
          <label className="mb-2 block text-sm font-bold font-bitter">Password</label>
          <AuthInput
            icon={Lock}
            type="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            error={'password' in errors ? (errors.password?.message as string | undefined) : undefined}
            {...register('password' as keyof FormValues)}
          />
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Nomor Telepon</label>
        <AuthInput
          icon={Phone}
          type="tel"
          placeholder="+62 1234 5678 9012"
          autoComplete="tel"
          error={errors.phoneNumber?.message as string | undefined}
          {...register('phoneNumber')}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Fakultas</label>
        <AuthInput
          icon={GraduationCap}
          placeholder="Fasilkom"
          error={errors.fakultas?.message as string | undefined}
          {...register('fakultas')}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Jurusan</label>
        <AuthInput
          icon={School}
          placeholder="Ilmu Komputer"
          error={errors.jurusan?.message as string | undefined}
          {...register('jurusan')}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold font-bitter">Universitas</label>
        <AuthInput
          icon={GraduationCap}
          placeholder="Universitas Indonesia"
          error={errors.universitas?.message as string | undefined}
          {...register('universitas')}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3525CD] py-4 font-bitter text-base font-semibold tracking-wide text-white disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isProfileCompletion ? 'Simpan & Lanjutkan' : 'Sign Up'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full rounded-2xl bg-[#F4F1FF] py-4 font-bitter text-base font-semibold tracking-wide text-[#3525CD]"
        >
          Login
        </button>
      </div>
    </form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Phone, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterFormValues } from './schema';
import AuthInput from './AuthInput';

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    // TODO: connect to auth API
    console.log('Register:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-bold font-bitter mb-2">Username</label>
        <AuthInput
          icon={User}
          placeholder="budisehat"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
      </div>

      <div>
        <label className="block text-sm font-bold font-bitter mb-2">Email</label>
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
        <label className="block text-sm font-bold font-bitter mb-2">Password</label>
        <AuthInput
          icon={Lock}
          type="password"
          placeholder="xxxxxxxxxxxxxxxx"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div>
        <label className="block text-sm font-bold font-bitter mb-2">Nomor Telepon</label>
        <AuthInput
          icon={Phone}
          type="tel"
          placeholder="+62 1234 5678 9012"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <div>
        <label className="block text-sm font-bold font-bitter mb-2">Jurusan/Fakultas</label>
        <AuthInput
          icon={GraduationCap}
          placeholder="Fasilkom"
          error={errors.faculty?.message}
          {...register('faculty')}
        />
      </div>

      <div>
        <label className="block text-sm font-bold font-bitter mb-2">Universitas</label>
        <AuthInput
          icon={GraduationCap}
          placeholder="Universitas Indonesia"
          error={errors.university?.message}
          {...register('university')}
        />
      </div>

      <div className="pt-2 flex flex-col gap-3">
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-primary text-white font-bitter font-semibold text-base tracking-wide"
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full py-4 rounded-2xl bg-primary/10 text-primary font-bitter font-semibold text-base tracking-wide"
        >
          Login
        </button>
      </div>
    </form>
  );
}

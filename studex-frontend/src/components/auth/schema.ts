import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().min(10, 'Nomor telepon tidak valid').regex(/^\+?[\d\s]+$/, 'Format nomor tidak valid'),
  faculty: z.string().min(1, 'Jurusan/Fakultas wajib diisi'),
  university: z.string().min(1, 'Universitas wajib diisi'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

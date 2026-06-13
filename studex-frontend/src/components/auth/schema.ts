import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  name: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  phoneNumber: z.string().min(10, 'Nomor telepon tidak valid').regex(/^\+?[\d\s]+$/, 'Format nomor tidak valid'),
  fakultas: z.string().min(1, 'Fakultas wajib diisi'),
  jurusan: z.string().min(1, 'Jurusan wajib diisi'),
  universitas: z.string().min(1, 'Universitas wajib diisi'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export const profileCompletionSchema = registerSchema.omit({ password: true });
export type ProfileCompletionFormValues = z.infer<typeof profileCompletionSchema>;

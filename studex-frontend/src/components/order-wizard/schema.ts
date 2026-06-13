import { z } from 'zod';

// ── Item Schema ──────────────────────────────────────────────────────────────
export const itemSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi'),
  qty: z.number().int().min(1, 'Minimal 1'),
  note: z.string().max(100, 'Catatan item maksimal 100 karakter').optional(),
});

// ── Order Schema (P2P QRIS — no price fields) ───────────────────────────────
export const orderSchema = z.object({
  shopName: z.string().min(1, 'Nama toko wajib diisi'),
  items: z.array(itemSchema).min(1, 'Tambahkan minimal 1 item'),
  notes: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
  buyerLat: z.number().optional(),
  buyerLng: z.number().optional(),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().max(150, 'Catatan khusus maksimal 150 karakter').optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

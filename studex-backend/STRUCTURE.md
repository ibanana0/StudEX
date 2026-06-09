# StudEx Backend — Panduan Struktur Direktori

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT + Google OAuth (google-auth-library)
- **Scheduler:** node-cron

---

## Struktur Direktori

```
studex-backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   └── cron/
├── server.ts
├── .env
└── package.json
```

---

## Penjelasan Setiap Folder

### `prisma/`
Semua hal yang berkaitan dengan definisi database dan migrasi schema.

| File | Fungsi |
|---|---|
| `schema.prisma` | Definisi model database (User, DriverProfile, Order, Rating). Ini adalah **sumber kebenaran** struktur database. Jika ada perubahan tabel, ubah di sini lalu jalankan `npm run db:migrate`. |
| `migrations/` | Folder auto-generated oleh Prisma saat `migrate dev` dijalankan. **Jangan diedit manual.** |

**Kapan menyentuh folder ini:**
Saat ada penambahan kolom, tabel baru, atau perubahan relasi database.

---

### `src/config/`
File konfigurasi dan inisialisasi koneksi ke layanan eksternal.

| File | Fungsi |
|---|---|
| `prisma.ts` | Singleton instance PrismaClient. Import file ini di controller manapun yang butuh akses database. Jangan buat instance PrismaClient baru di tempat lain. |

**File yang akan ditambahkan di sini:**
- `googleAuth.ts` — inisialisasi `OAuth2Client` dari `google-auth-library` untuk verifikasi `id_token` dari frontend.

**Kapan menyentuh folder ini:**
Saat setup koneksi ke layanan baru (database, OAuth, storage, dsb).

---

### `src/controllers/`
Tempat **logika bisnis** setiap fitur. Controller menerima request dari route, memproses data, berinteraksi dengan database via Prisma, lalu mengembalikan response.

**Satu file per domain fitur:**

| File | Fungsi |
|---|---|
| `auth.controller.ts` | Verifikasi `id_token` Google → cari atau buat user di DB → buat JWT → kembalikan token ke frontend. |
| `order.controller.ts` | Buat order baru, ambil detail order, update status order (state machine), cancel order. Termasuk query atomic untuk "ambil orderan" driver. |
| `driver.controller.ts` | Registrasi driver (upload KTM + QRIS URL), toggle status `is_active` (online/offline), ambil order pool (daftar order `MENCARI_DRIVER`). |
| `admin.controller.ts` | Lihat daftar driver pending, approve/reject verifikasi driver. |
| `rating.controller.ts` | Submit rating setelah order `COMPLETED`, update `avg_rating` dan `total_trips` di `driver_profiles`. |

**Pola penulisan controller:**
```typescript
// Selalu async/await, selalu try-catch
export const createOrder = async (req: Request, res: Response) => {
  try {
    // 1. Validasi input (dari req.body)
    // 2. Query database via prisma
    // 3. Return response
    res.status(201).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

**Kapan menyentuh folder ini:**
Setiap kali menambah endpoint baru atau mengubah logika bisnis.

---

### `src/middlewares/`
Fungsi yang berjalan **sebelum** controller dipanggil. Digunakan untuk validasi, autentikasi, dan otorisasi.

| File | Fungsi |
|---|---|
| `auth.middleware.ts` | `authenticate` — verifikasi JWT dari header `Authorization: Bearer <token>`. Jika valid, attach `req.user` (berisi `id`, `role`, `isDriverVerified`). Jika tidak, kembalikan 401. |
| `role.middleware.ts` | `requireRole(...roles)` — cek apakah `req.user.role` ada di daftar role yang diizinkan. Digunakan setelah `authenticate`. Contoh: `requireRole('ADMIN')` di route admin, `requireRole('DRIVER')` di route driver. |

**Contoh penggunaan di route:**
```typescript
router.patch('/drivers/:id/verify',
  authenticate,
  requireRole('ADMIN'),
  adminController.verifyDriver
);
```

**Kapan menyentuh folder ini:**
Saat menambah layer validasi baru (misal: rate limiting, validasi body schema dengan Zod).

---

### `src/routes/`
Definisi endpoint API. File di sini hanya mendaftarkan URL path + method + middleware + controller. **Tidak ada logika bisnis di sini.**

| File | Fungsi |
|---|---|
| `auth.routes.ts` | `POST /auth/google` — login via Google OAuth. |
| `order.routes.ts` | CRUD order, update status, cancel. Semua route dilindungi `authenticate`. |
| `driver.routes.ts` | Registrasi driver, toggle online, ambil order pool. |
| `admin.routes.ts` | Endpoint khusus admin: list pending & verifikasi driver. Dilindungi `authenticate` + `requireRole('ADMIN')`. |
| `rating.routes.ts` | Submit rating pasca order selesai. |
| `index.ts` | File agregator — import semua route di atas dan daftarkan ke Express app dengan prefix `/api`. |

**Struktur URL:**
```
POST   /api/auth/google
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
DELETE /api/orders/:id         (cancel)
GET    /api/driver/orders      (order pool)
PATCH  /api/driver/status      (toggle online)
POST   /api/driver/register
GET    /api/admin/drivers/pending
PATCH  /api/admin/drivers/:userId/verify
POST   /api/ratings
```

**Kapan menyentuh folder ini:**
Setiap kali menambah endpoint baru.

---

### `src/cron/`
Scheduled jobs yang berjalan otomatis di background menggunakan `node-cron`.

| File | Fungsi |
|---|---|
| `autoClose.cron.ts` | Berjalan setiap **1 menit**. Query orders dengan `status = 'PESANAN_TIBA'` yang `updated_at`-nya sudah lebih dari 15 menit → ubah status ke `COMPLETED`. |
| `autoCancel.cron.ts` | Berjalan setiap **5 menit**. Query orders dengan `status = 'MENCARI_DRIVER'` yang `updated_at`-nya sudah lebih dari 30 menit → ubah status ke `CANCELLED` dengan `cancelled_by = 'SYSTEM'`. |

**Cara kerja `updated_at`:** Trigger PostgreSQL di tabel `orders` otomatis memperbarui kolom `updated_at` setiap kali ada UPDATE. Cron job cukup membandingkan `updated_at` dengan `NOW() - INTERVAL`.

**Kapan menyentuh folder ini:**
Saat menambah scheduled task baru.

---

### `src/server.ts`
Entry point aplikasi. Inisialisasi Express, daftarkan middleware global (helmet, cors, json parser), mount semua routes dari `src/routes/index.ts`, dan jalankan server di port yang ditentukan `.env`.

File ini **tidak boleh berisi logika bisnis**. Hanya setup dan boot aplikasi.

---

## Urutan Pengerjaan yang Disarankan

```
1. prisma/schema.prisma     → sudah selesai, jalankan: npm run db:migrate
2. src/config/              → setup googleAuth.ts
3. src/middlewares/         → auth.middleware.ts + role.middleware.ts
4. src/controllers/         → auth → order → driver → admin → rating
5. src/routes/              → daftarkan semua controller ke route
6. src/cron/                → autoClose + autoCancel
7. src/server.ts            → mount routes + cron
```

> **Prinsip:** Selalu kerjakan dari dalam ke luar — config & middleware dulu sebelum controller, controller dulu sebelum route.

---

## Environment Variables (`.env`)

| Variable | Keterangan |
|---|---|
| `PORT` | Port server berjalan (default: 3001) |
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secret key untuk sign/verify JWT. Gunakan string acak panjang. |
| `JWT_EXPIRES_IN` | Durasi token berlaku (contoh: `7d`) |
| `GOOGLE_CLIENT_ID` | Client ID dari Google Cloud Console (OAuth 2.0) |
| `FRONTEND_URL` | URL frontend untuk konfigurasi CORS |

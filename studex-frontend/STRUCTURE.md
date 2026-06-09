# StudEx Frontend — Panduan Struktur Direktori

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Komponen UI:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Peta:** React Leaflet + OpenStreetMap + leaflet-geosearch
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifikasi:** React Hot Toast

---

## Struktur Direktori

```
studex-frontend/src/
├── app/
│   ├── (auth)/
│   ├── order/
│   ├── activity/
│   ├── profile/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── map/
│   ├── modal/
│   └── layout/
├── context/
├── hooks/
├── lib/
├── types/
└── utils/
```

---

## Penjelasan Setiap Folder

### `src/app/`
Direktori utama Next.js App Router. Setiap subfolder di sini menjadi **URL route** di browser.

| Path | URL | Halaman |
|---|---|---|
| `app/page.tsx` | `/` | Beranda — daftar shortcut, CTA buat order |
| `app/(auth)/` | `/login` (atau sejenisnya) | Halaman login Google OAuth. Pakai route group `(auth)` agar tidak muncul di URL. |
| `app/order/` | `/order` | Form buat pesanan baru + Leaflet map pinpoint lokasi. |
| `app/order/[id]/` | `/order/123` | Halaman tracking order aktif — status real-time via polling, info driver, tombol aksi sesuai state machine. |
| `app/activity/` | `/activity` | Riwayat semua order (completed & cancelled). |
| `app/profile/` | `/profile` | Profil user, tombol role switcher, form registrasi driver. |

**Pola file per route:**
```
app/order/
├── page.tsx        ← halaman utama /order
└── [id]/
    └── page.tsx    ← halaman /order/123
```

**Kapan menyentuh folder ini:**
Saat menambah halaman baru atau mengubah layout per route.

---

### `src/components/ui/`
Komponen UI generik dari **shadcn/ui** (auto-generated). Jangan diedit manual kecuali ada kebutuhan kustomisasi khusus.

Untuk menambah komponen shadcn baru, jalankan:
```bash
npx shadcn@latest add <nama-komponen>
# Contoh:
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add badge
```

Komponen yang pasti dibutuhkan untuk StudEx:
- `button`, `input`, `textarea` — form order
- `dialog` — modal QRIS, rating, konfirmasi cancel
- `badge` — label status order
- `card` — card order di pool driver
- `avatar` — foto profil driver
- `separator`, `skeleton` — layout & loading state

---

### `src/components/map/`
Komponen yang berkaitan dengan **Leaflet map**. Leaflet tidak support SSR, sehingga semua komponen di folder ini harus di-import menggunakan `dynamic()` dengan `{ ssr: false }`.

| File | Fungsi |
|---|---|
| `LeafletMap.tsx` | Komponen map interaktif untuk halaman order. Menampilkan peta OSM, trigger geolocation browser, dan memungkinkan user drag pin untuk set titik antar. Meng-emit koordinat `{ lat, lng }` ke parent via `onLocationChange`. |
| `StaticMap.tsx` | (Opsional) Versi read-only map untuk menampilkan lokasi buyer di halaman driver. |

**Cara import Leaflet agar tidak crash di SSR:**
```typescript
// Di page.tsx atau parent component
import dynamic from 'next/dynamic';
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />,
});
```

**Kapan menyentuh folder ini:**
Saat mengerjakan fitur lokasi di halaman order atau driver.

---

### `src/components/modal/`
Komponen modal/dialog yang muncul di atas halaman lain. Menggunakan shadcn `Dialog` sebagai base.

| File | Fungsi |
|---|---|
| `QRISModal.tsx` | Muncul saat status order = `PESANAN_TIBA`. Menampilkan foto QRIS driver (`qrisUrl`) dan total harga yang harus dibayar. Tidak bisa ditutup manual — hanya tertutup saat status berubah ke `COMPLETED`. |
| `RatingModal.tsx` | Muncul setelah order `COMPLETED`. Form rating 1–5 bintang untuk driver. Submit ke endpoint `POST /api/ratings`. |
| `CancelModal.tsx` | Konfirmasi dialog sebelum pembeli cancel order. Hanya muncul saat status = `MENCARI_DRIVER`. |

**Kapan menyentuh folder ini:**
Saat mengerjakan step PESANAN_TIBA, COMPLETED, atau cancel flow.

---

### `src/components/layout/`
Komponen layout yang dipakai di semua halaman.

| File | Fungsi |
|---|---|
| `BottomNav.tsx` | Navigasi bawah mobile-first dengan 4 tab: Beranda, Order, Aktivitas, Profil. Highlight tab aktif berdasarkan current pathname. |
| `Header.tsx` | Header atas halaman — judul halaman + tombol back (untuk halaman nested seperti `/order/[id]`). |
| `ProtectedRoute.tsx` | Wrapper component yang cek apakah user sudah login. Jika belum, redirect ke `/login`. Wrap semua halaman kecuali `(auth)`. |

**Kapan menyentuh folder ini:**
Di awal pengerjaan — layout harus ada sebelum mengerjakan halaman apapun.

---

### `src/context/`
React Context untuk state global yang perlu diakses dari mana saja.

| File | Fungsi |
|---|---|
| `AuthContext.tsx` | Menyimpan state user yang sedang login (`user`, `token`, `isLoading`). Menyediakan fungsi `login(token)` dan `logout()`. Token disimpan di `localStorage`. Di-wrap di `app/layout.tsx`. |

**Alternatif:** Jika state auth sederhana, bisa digantikan dengan Zustand store di `src/hooks/useAuthStore.ts` tanpa pakai Context API.

**Kapan menyentuh folder ini:**
Saat setup auth di awal, atau saat menambah state global baru yang tidak cocok di Zustand.

---

### `src/hooks/`
Custom React hooks — logika yang bisa dipakai ulang di banyak komponen.

| File | Fungsi |
|---|---|
| `useOrderPolling.ts` | Polling status order ke `GET /orders/:id` setiap 5 detik menggunakan TanStack Query. Otomatis berhenti polling saat status = `COMPLETED` atau `CANCELLED`. Dipakai di halaman `/order/[id]`. |

**Hook yang akan ditambahkan:**
- `useAuthStore.ts` — Zustand store untuk data user login
- `useActiveOrder.ts` — Zustand store untuk menyimpan `orderId` order yang sedang aktif

**Kapan menyentuh folder ini:**
Saat ada logika stateful atau efek yang dipakai lebih dari satu komponen.

---

### `src/lib/`
Utility functions yang tidak spesifik ke domain bisnis.

| File | Fungsi |
|---|---|
| `utils.ts` | Fungsi `cn()` dari shadcn — menggabungkan Tailwind class dengan `clsx` + `tailwind-merge`. Dipakai di semua komponen shadcn. |

**Fungsi yang akan ditambahkan:**
- `formatRupiah(amount: number)` — format angka ke "Rp15.000"
- `formatDate(date: string)` — format ISO date ke "9 Jun 2026, 14:30"

---

### `src/types/`
Definisi TypeScript types dan interfaces yang digunakan di seluruh aplikasi.

| File | Fungsi |
|---|---|
| `index.ts` | Semua types utama: `User`, `Order`, `DriverProfile`, `OrderItem`, `OrderStatus`, `Role`. Import dari file ini di mana pun butuh type, contoh: `import type { Order } from '@/types'`. |

**Prinsip:** Types di sini harus **cermin dari response API backend**. Jika backend mengembalikan `camelCase` (karena Prisma), types di sini juga `camelCase`.

---

### `src/utils/`
Fungsi helper yang berkaitan dengan komunikasi ke API backend.

| File | Fungsi |
|---|---|
| `api.ts` | Instance Axios dengan `baseURL` dari env `NEXT_PUBLIC_API_URL`. Interceptor otomatis menambahkan header `Authorization: Bearer <token>` dari `localStorage` di setiap request. |

**Cara pakai:**
```typescript
import api from '@/utils/api';

// GET
const { data } = await api.get('/orders/123');

// POST
const { data } = await api.post('/orders', { shopName: '...', ... });
```

**Kapan menyentuh folder ini:**
Jika perlu menambah interceptor baru (misal: handling error 401 → auto logout).

---

## Urutan Pengerjaan yang Disarankan

```
1. src/types/index.ts           → sudah ada, update jika ada perubahan API
2. src/utils/api.ts             → sudah ada
3. src/context/AuthContext.tsx  → setup auth state dulu
4. src/components/layout/       → BottomNav + Header + ProtectedRoute
5. app/(auth)/page.tsx          → halaman login Google
6. src/components/map/          → LeafletMap component
7. app/order/page.tsx           → form buat order + map
8. src/hooks/useOrderPolling.ts → sudah ada
9. app/order/[id]/page.tsx      → halaman tracking + state machine UI
10. src/components/modal/       → QRISModal + RatingModal + CancelModal
11. app/activity/page.tsx       → riwayat order
12. app/profile/page.tsx        → profil + role switcher + registrasi driver
```

> **Prinsip:** Kerjakan dari fondasi ke fitur — types & API client dulu, auth dulu, layout dulu, baru halaman-halaman fungsional.

---

## Konvensi Penamaan

| Hal | Konvensi | Contoh |
|---|---|---|
| Komponen | PascalCase | `LeafletMap.tsx`, `QRISModal.tsx` |
| Hooks | camelCase + prefix `use` | `useOrderPolling.ts` |
| Utils/helpers | camelCase | `api.ts`, `formatRupiah` |
| Types/interfaces | PascalCase | `Order`, `DriverProfile` |
| CSS class | Tailwind utility (no custom CSS kecuali terpaksa) | `className="flex gap-2 p-4"` |

---

## Environment Variables (`.env.local`)

| Variable | Keterangan |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend Express (contoh: `http://localhost:3001`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID Google OAuth — dipakai di tombol Google Sign-In |

> Variabel yang diawali `NEXT_PUBLIC_` bisa diakses di client-side (browser). Jangan taruh secret di sini.

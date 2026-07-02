# StudEx — Student Express

> Platform jastip P2P antar mahasiswa kampus. Pembeli pesan, driver (sesama mahasiswa) belikan & antar, bayar face-to-face via QRIS.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-black?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-green)

---

## Daftar Isi

- [Overview](#overview)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Fitur Utama](#fitur-utama)
- [Alur Status Pesanan](#alur-status-pesanan)
- [Struktur Folder](#struktur-folder)
- [Setup & Development](#setup--development)
  - [Prasyarat](#prasyarat)
  - [Clone & Konfigurasi Environment](#clone--konfigurasi-environment)
  - [Jalankan dengan Docker (Direkomendasikan)](#jalankan-dengan-docker-direkomendasikan)
  - [Jalankan Manual (Tanpa Docker)](#jalankan-manual-tanpa-docker)
- [Perintah Make](#perintah-make)
- [Skema Database](#skema-database)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Kontributor](#kontributor)

---

## Overview

**StudEx (Student Express)** adalah platform *two-sided marketplace* berbasis web *mobile-first* untuk jasa titip (jastip) makanan/barang di lingkungan kampus.

- **Pembeli (User):** Buat pesanan, pilih lokasi antar via peta, pantau status real-time.
- **Driver:** Sesama mahasiswa yang terverifikasi, ambil order dari pool, antar ke lokasi pembeli.
- **Pembayaran:** P2P face-to-face via QRIS Statis driver — **tanpa payment gateway, tanpa biaya transaksi platform.**
- **Admin:** Verifikasi driver (KTM + QRIS), manajemen akun (suspend/ban), kelola laporan.

---

## Demo

| Environment | URL |
|---|---|
| Frontend (Production) | https://stud-ex-two.vercel.app |
| Backend API (Production) | Deployed di VPS GCP via Docker |

---

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Shadcn UI, Radix UI |
| **State Management** | Zustand, TanStack React Query v5 |
| **Maps** | Leaflet.js + OpenStreetMap (gratis), leaflet-geosearch (Nominatim) |
| **Backend** | Express.js 5, TypeScript, Node.js |
| **Database** | PostgreSQL 15 via Prisma ORM v7 |
| **Auth** | JWT + Google OAuth 2.0 (`google-auth-library`) |
| **Cron Job** | `node-cron` (auto-cancel & auto-close order) |
| **Containerisasi** | Docker, Docker Compose |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | GCP Compute Engine VPS, Nginx reverse proxy, SSL Certbot |

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│              Next.js App Router (Vercel)                 │
│   Leaflet.js + OSM │ React Query (polling 5s) │ Zustand  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Nginx (Reverse Proxy)                   │
│                    SSL via Certbot                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Backend (Docker)                 │
│   Auth (JWT/Google OAuth) │ REST Controllers │ node-cron │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL 15 (Docker volume)               │
└─────────────────────────────────────────────────────────┘
```

---

## Fitur Utama

### Autentikasi & Akun
- **Google OAuth Login** — verifikasi `id_token` di backend via `google-auth-library`
- **Registrasi Driver** — upload foto KTM + QRIS Statis, pending sampai admin approve
- **Role Switcher** — toggle tampilan Pembeli ↔ Driver (aktif jika `is_driver_verified = true`)
- **Manajemen Akun Admin** — suspend (dengan durasi) atau ban permanen akun user/driver

### Peta & Lokasi (Zero Cost)
- **Pinpoint lokasi antar** — Leaflet.js + HTML5 Geolocation API (gratis)
- **Cari alamat** — `leaflet-geosearch` dengan provider Nominatim/Photon (gratis)
- **Navigasi driver** — tombol "Buka Rute di Google Maps" (`maps/dir/?destination=LAT,LNG`)

### Sistem Pesanan
- **Order Pool** — driver melihat semua pesanan terbuka, ambil secara atomic (race-condition safe)
- **Real-time polling** — frontend polling `GET /orders/:id/status` setiap 5 detik
- **Checklist belanjaan** — format JSONB `[{"name":"...","qty":1,"note":"..."}]`
- **Step timestamps** — setiap transisi status dicatat waktunya

### Pembayaran P2P QRIS
- Tidak ada harga di sistem — kesepakatan face-to-face di luar platform
- Driver tampilkan QRIS saat `PESANAN_TIBA`, buyer scan & bayar langsung
- Timer 15 menit auto-complete via `node-cron`

### Cron Jobs Otomatis
| Job | Kondisi | Aksi |
|---|---|---|
| Auto-cancel | `MENCARI_DRIVER` > 30 menit tanpa driver | Status → `CANCELLED` (by SYSTEM) |
| Auto-complete | `PESANAN_TIBA` > 15 menit | Status → `COMPLETED` |

### Rating & Laporan
- Buyer rating driver 1–5 bintang setelah COMPLETED (1x per order)
- `avg_rating` dan `total_trips` di driver profile terupdate otomatis
- Sistem laporan (report) dengan status: `PENDING → INVESTIGATING → RESOLVED/DISMISSED`

---

## Alur Status Pesanan

```
[Pembeli buat order]
        │
        ▼
 MENCARI_DRIVER ──(30 min no driver)──► CANCELLED (SYSTEM)
        │
   [Driver ambil]
        │
        ▼
 DIPROSES_DRIVER
        │
   [Driver di toko]
        │
        ▼
 DRIVER_DI_TOKO
        │
   [Driver berangkat]
        │
        ▼
 DALAM_PERJALANAN
        │
   [Driver tiba]
        │
        ▼
 DRIVER_SAMPAI
        │
   [Buyer konfirmasi terima]
        │
        ▼
 PESANAN_TIBA ──(15 min auto)──► COMPLETED
        │
   [Buyer close order]
        │
        ▼
   COMPLETED → [Buyer beri rating]
```

---

## Struktur Folder

```
studEX/
├── docker-compose.yml          # Dev stack (postgres + backend + hot reload)
├── docker-compose.prod.yml     # Production overrides
├── Makefile                    # Shortcut commands
├── .env.example                # Root env template
│
├── studex-backend/             # Express.js + TypeScript
│   ├── src/
│   │   ├── config/             # DB, Google Auth config
│   │   ├── controllers/        # Auth, Order, Driver, Admin, Rating
│   │   ├── middlewares/        # AuthGuard, RoleCheck
│   │   ├── routes/             # API endpoint definitions
│   │   ├── cron/               # Auto-cancel & auto-close scheduler
│   │   ├── types/              # TypeScript types
│   │   └── scripts/            # Seed scripts (admin, driver)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
│
└── studex-frontend/            # Next.js App Router
    ├── src/
    │   ├── app/                # Pages (Home, Order, Activity, Profile, Admin)
    │   ├── components/         # UI components, LeafletMap, Modals
    │   ├── context/            # Auth state context
    │   ├── hooks/              # useOrderPolling, custom hooks
    │   ├── stores/             # Zustand stores
    │   ├── lib/                # Utility functions
    │   └── utils/              # API fetcher, helpers
    ├── Dockerfile
    ├── Dockerfile.dev
    └── package.json
```

---

## Setup & Development

### Prasyarat

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2
- [Node.js](https://nodejs.org/) >= 20 (jika jalankan manual)
- [Git](https://git-scm.com/)
- Google OAuth Client ID ([cara buat](https://console.cloud.google.com/apis/credentials))

### Clone & Konfigurasi Environment

```bash
git clone https://github.com/ibanana0/StudEX.git
cd StudEX
```

Salin file environment:

```bash
# Root (untuk Docker Compose)
cp .env.example .env

# Backend
cp studex-backend/.env.example studex-backend/.env

# Frontend
cp studex-frontend/.env.example studex-frontend/.env
```

Edit `.env` di root:

```env
DB_USER=studex
DB_PASSWORD=ganti_password_kuat
DB_NAME=studex_db
JWT_SECRET=ganti_dengan_random_string_panjang
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Edit `studex-frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key   # optional, hanya untuk Google Maps embed
```

### Jalankan dengan Docker (Direkomendasikan)

```bash
# Start semua service (postgres + backend, hot reload)
make up

# Jalankan migrasi database (pertama kali / setelah pull)
make db-migrate

# Seed akun admin pertama
docker compose exec backend npm run seed:admin

# Cek log
make logs
```

Service yang berjalan:

| Service | Port | Keterangan |
|---|---|---|
| PostgreSQL | `5432` | Database |
| Backend API | `3001` | Express.js |

> **Frontend** tidak termasuk di docker-compose dev karena di-deploy ke Vercel. Jalankan frontend secara lokal (lihat bawah).

Jalankan frontend secara lokal:

```bash
cd studex-frontend
npm install
npm run dev
# → http://localhost:3000
```

### Jalankan Manual (Tanpa Docker)

**Backend:**

```bash
cd studex-backend
npm install

# Pastikan PostgreSQL sudah jalan dan DATABASE_URL sudah benar di .env
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Jalankan migrasi
npm run seed:admin      # Seed akun admin

npm run dev             # Hot reload dengan tsx watch
```

**Frontend:**

```bash
cd studex-frontend
npm install
npm run dev
```

---

## Perintah Make

```bash
make help           # Tampilkan semua perintah

# Development
make up             # Start semua service
make down           # Stop semua service
make restart        # Down + Up
make build          # Build ulang Docker image
make logs           # Follow semua log
make logs-be        # Follow log backend saja

# Database
make db-migrate     # Jalankan migrasi terbaru
make db-reset       # Reset DB + re-run semua migrasi (DATA HILANG)
make db-studio      # Buka Prisma Studio di http://localhost:5555

# Shell
make backend-shell  # Masuk ke container backend
make postgres-shell # Masuk ke psql

# Production
make prod-build     # Build image production
make prod-up        # Jalankan production stack
make clean          # Hapus container + volume (DATA HILANG)
```

---

## Skema Database

| Tabel | Deskripsi |
|---|---|
| `users` | Semua pengguna (USER / DRIVER / ADMIN), status akun, info profil |
| `driver_profiles` | Profil driver: KTM URL, QRIS URL, status aktif, rating, total trip |
| `orders` | Pesanan: detail item (JSONB), lokasi, status, timestamps per step |
| `ratings` | Rating 1–5 bintang dari buyer ke driver, 1x per order |
| `reports` | Laporan pelanggaran antar pengguna, dikelola admin |

**Role pengguna:** `USER` · `DRIVER` · `ADMIN`

**Status pesanan:** `MENCARI_DRIVER` · `DIPROSES_DRIVER` · `DRIVER_DI_TOKO` · `DALAM_PERJALANAN` · `DRIVER_SAMPAI` · `PESANAN_TIBA` · `COMPLETED` · `CANCELLED`

**Status akun:** `ACTIVE` · `SUSPENDED` · `BANNED`

---

## API Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/google` | — | Login via Google OAuth |
| `POST` | `/auth/register` | — | Registrasi email/password |
| `POST` | `/auth/login` | — | Login email/password |
| `GET` | `/users/me` | JWT | Profil sendiri |
| `PATCH` | `/users/me` | JWT | Update profil |
| `POST` | `/drivers/register` | JWT (USER) | Daftar jadi driver |
| `PATCH` | `/drivers/status` | JWT (DRIVER) | Toggle online/offline |
| `GET` | `/orders` | JWT | Order pool (semua MENCARI_DRIVER) |
| `POST` | `/orders` | JWT (USER) | Buat pesanan baru |
| `GET` | `/orders/:id` | JWT | Detail pesanan |
| `GET` | `/orders/:id/status` | JWT | Status pesanan (untuk polling) |
| `PATCH` | `/orders/:id/status` | JWT | Update status (driver/buyer) |
| `DELETE` | `/orders/:id` | JWT (USER) | Cancel pesanan |
| `POST` | `/orders/:id/ratings` | JWT (USER) | Beri rating driver |
| `POST` | `/orders/:id/reports` | JWT | Buat laporan |
| `GET` | `/admin/drivers/pending` | JWT (ADMIN) | Driver menunggu verifikasi |
| `PATCH` | `/admin/drivers/:userId/verify` | JWT (ADMIN) | Approve/reject driver |
| `GET` | `/admin/users` | JWT (ADMIN) | Daftar semua user |
| `PATCH` | `/admin/users/:id/status` | JWT (ADMIN) | Suspend/ban/aktifkan akun |
| `GET` | `/admin/reports` | JWT (ADMIN) | Daftar laporan |
| `PATCH` | `/admin/reports/:id` | JWT (ADMIN) | Update status laporan |

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Contoh | Deskripsi |
|---|---|---|
| `DB_USER` | `studex` | Username PostgreSQL |
| `DB_PASSWORD` | `rahasia123` | Password PostgreSQL |
| `DB_NAME` | `studex_db` | Nama database |
| `JWT_SECRET` | `random_string` | Secret key JWT (min. 32 karakter) |
| `JWT_EXPIRES_IN` | `7d` | Masa berlaku token |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth Client ID |

### `studex-backend/.env`

| Variable | Contoh | Deskripsi |
|---|---|---|
| `PORT` | `3001` | Port server Express |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` | Connection string Prisma |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |

### `studex-frontend/.env`

| Variable | Contoh | Deskripsi |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base URL backend API |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth (frontend) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIza...` | Google Maps API key (opsional) |

---

## Deployment

### Frontend → Vercel

```bash
# Set environment variables di Vercel dashboard atau via CLI
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Deploy
vercel --prod
```

### Backend → VPS (Docker)

```bash
# Di VPS (GCP Compute Engine)
git pull origin main

# Isi .env production
cp .env.example .env && nano .env

# Build & jalankan production stack
make prod-build
make prod-up

# Migrasi database
make db-migrate

# Setup Nginx sebagai reverse proxy ke port 3001
# Setup SSL via Certbot
```

---

## Kontributor

Proyek ini dibuat sebagai tugas mata kuliah **Cloud Computing**.

| **Nama** | **GitHub** |
|---|---|
| adika | [@ibanana0](https://github.com/ibanana0) |
| Arfer0030 | [@Arfer0030](https://github.com/Arfer0030) |
| AlvisChrs | [@AlvisChrs](https://github.com/AlvisChrs) |
| AvecenaHidayat | [@AvecenaHidayat](https://github.com/AvecenaHidayat) |

---

> **StudEx** — Jastip kampus, simple, aman, P2P.

# **SmartQueue AI — Frontend Patient Portal & Dashboard**

![React](https://img.shields.io/badge/React-19.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.0-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## **Deskripsi Proyek**

**SmartQueue AI Frontend** adalah antarmuka web modern berbasis Single Page Application (SPA) yang dikembangkan sebagai bagian dari **Capstone Project Coding Camp DBS Foundation 2025**. Aplikasi ini terintegrasi langsung dengan layanan backend dan layanan Machine Learning / CDSS untuk menghadirkan pengalaman manajemen antrean rumah sakit yang transparan, real-time, dan cerdas.

Aplikasi ini dibagi menjadi tiga portal utama yang disesuaikan dengan peran pengguna (_Role-Based Access Control_):

1. **Portal Pasien:** Akses mandiri untuk pemesanan, pelacakan, rekam medis, dan administrasi.
2. **Dashboard Dokter:** Manajemen pelayanan pasien di poli serta integrasi CDSS untuk asisten diagnosis awal.
3. **Command Center Admin:** Pusat pengawasan operasional rumah sakit dan manajemen data master.

---

## **Fitur Utama Berdasarkan Portal**

### 1. **Portal Pasien (Patient Portal)**

- **Pemesanan Antrean Mandiri (_Online Booking_):** Pasien dapat memilih poli, dokter, jadwal, dan asuransi (BPJS / Mandiri) untuk membuat janji secara online.
- **Live Queue Tracker & Countdown:** Estimasi waktu tunggu dinamis secara real-time yang didukung oleh model Machine Learning, dilengkapi hitung mundur menuju pemanggilan.
- **Digital Medical Records & Prescriptions:** Akses langsung ke riwayat rekam medis, saran dokter, dan resep obat digital yang telah diberikan.
- **Billing & Payment Summary:** Rincian biaya administrasi, konsultasi, serta obat-obatan secara transparan.

### 2. **Dashboard Dokter (Doctor Dashboard)**

- **Queue Controller:** Pemanggilan pasien (_Call_), penundaan (_Hold_), dan penyelesaian sesi konsultasi (_Complete_) secara dinamis.
- **CDSS (Clinical Decision Support System):** Integrasi asisten kecerdasan buatan berbasis **Google Gemini AI** untuk menganalisis gejala pasien, memberikan kandidat diagnosis penyakit (beserta _confidence score_), departemen spesialis rujukan, dan rekomendasi pemeriksaan penunjang lanjutan.
- **Patient History Lookup:** Melihat riwayat rekam medis dan resep pasien terdahulu secara cepat guna menentukan tindakan yang tepat.

### 3. **Command Center Admin (Admin Dashboard)**

- **Real-time Monitoring & Analytics:** Pemantauan arus pasien di setiap poli secara terpusat untuk menghindari penumpukan antrean.
- **User Management:** Pengelolaan akun pasien, dokter, dan administrator (tambah, edit, non-aktifkan).
- **Service & Department Control:** Manajemen data poli, penugasan dokter, dan kuota antrean harian.
- **Announcement Broadcast:** Mengirimkan notifikasi pengumuman penting ke portal pasien secara instan.

---

## **Arsitektur & Teknologi Frontend**

- **Framework Utama:** React 19 (TypeScript)
- **Bundler & Tooling:** Vite 8, PostCSS 8
- **Styling & UI:** Tailwind CSS v4, Headless UI, Heroicons
- **State Management:** Zustand 5 (Manajemen status login, sesi pengguna, dan data global terpusat)
- **Routing:** React Router DOM v7 (Mendukung _Protected Routes_ berdasarkan role pengguna)
- **Grafik & Analitik:** Chart.js & React-Chartjs-2
- **HTTP Client:** Axios (Dilengkapi interceptor otomatis untuk token JWT refresh dan penanganan error)

---

## **Struktur Direktori**

```text
frontend/
├── public/                    # Aset statis publik (logo, favicon)
├── src/
│   ├── assets/                # Gambar, logo ilustrasi, dan stylesheet global
│   ├── components/            # Komponen UI modular
│   │   ├── admin/             # Komponen khusus dashboard admin
│   │   ├── analytics/         # Komponen visualisasi grafik (Chart.js)
│   │   ├── auth/              # Komponen autentikasi (ProtectedRoute, dll.)
│   │   ├── doctor/            # Komponen khusus dashboard dokter (CDSSModal, dll.)
│   │   ├── patient/           # Komponen khusus portal pasien (BookingPanel, LiveQueueTracker, dll.)
│   │   ├── shared/            # Komponen global (Navbar, Sidebar, Footer, Layouts)
│   │   └── ui/                # Komponen atomis dasar (Button, Input, Modal, dll.)
│   ├── hooks/                 # React custom hooks untuk interaksi stateful
│   ├── layouts/               # Layout wrapper navigasi
│   ├── lib/                   # Utilitas util, helper, dan client API
│   │   ├── apiClient.ts       # Axios client dengan interceptor JWT
│   │   ├── cdssUtils.ts       # Helper parser response CDSS
│   │   ├── queueStateMachine.ts # Logika transisi status antrean
│   │   └── waitTimeEstimate.ts # Algoritma & helper kalkulasi estimasi waktu tunggu
│   ├── pages/                 # Halaman utama (Landing, Auth, ResetPassword)
│   ├── store/                 # Zustand stores (authStore.ts, bookingStore.ts)
│   ├── App.tsx                # Konfigurasi rute (routes) dan otorisasi role
│   ├── index.css              # Entrypoint CSS Tailwind
│   └── main.tsx               # Entrypoint aplikasi React
├── .env.example               # Template variabel lingkungan
├── eslint.config.js           # Konfigurasi ESLint
├── package.json               # Konfigurasi dependensi dan skrip proyek
├── tsconfig.json              # Konfigurasi TypeScript
├── vite.config.ts             # Konfigurasi build Vite
└── README.md                  # Dokumentasi proyek (file ini)
```

---

## **Panduan Instalasi & Setup Lokal**

### **Prasyarat:**

- [Node.js](https://nodejs.org/) versi **20 LTS** atau yang lebih baru.
- Manajer paket seperti `npm` (bawaan Node.js), `pnpm`, atau `bun`.

### **Langkah-langkah:**

1. **Clone repositori ini dan masuk ke folder frontend:**

   ```bash
   git clone <url-repo-ini>
   cd frontend
   ```

2. **Instal seluruh dependensi proyek:**

   ```bash
   npm install
   # atau menggunakan pnpm/bun jika tersedia:
   # pnpm install
   # bun install
   ```

3. **Konfigurasikan variabel lingkungan (Environment Variables):**
   Salin file `.env.example` menjadi `.env` di root direktori frontend:

   ```bash
   cp .env.example .env
   ```

   Buka file `.env` dan tentukan URL server backend Anda:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

4. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di alamat **`http://localhost:5173`**.

---

## **Perintah Pengembangan Tambahan**

- **Kompilasi Proyek (Build):**
  Untuk membuat bundle produksi yang optimal di folder `dist/`:
  ```bash
  npm run build
  ```
- **Pengecekan Kualitas Kode (Linter):**
  ```bash
  npm run lint       # Melakukan cek kode
  npm run lint:fix   # Melakukan perbaikan otomatis linter
  ```
- **Standardisasi Format Kode (Prettier):**
  ```bash
  npm run format          # Merapikan format seluruh file kode
  npm run format:check    # Memeriksa kepatuhan format kode
  ```

---

## **Kontribusi**

Silakan merujuk pada berkas [CONTRIBUTING.md](https://github.com/SQueue-Care/frontend/blob/main/CONTRIBUTING.md) untuk mempelajari panduan kontribusi, alur percabangan (_git branching_), dan konvensi commit pesan di proyek ini.

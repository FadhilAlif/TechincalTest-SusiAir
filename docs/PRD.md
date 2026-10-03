# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Susi Air Pilot App
### Aplikasi Mobile Web untuk Manajemen Jadwal dan Batas Jam Terbang Pilot

| Metadata Dokumen | Nilai |
|------------------|-------|
| **Versi** | 1.0 |
| **Tanggal Terbit** | 2026-10-03 |
| **Status** | Draft |
| **Penulis / Pemilik** | Antigravity AI |
| **Target Release / Deadline** | 5 Hari Kalender |

---

## 1. Latar Belakang & Masalah Bisnis

### 1.1 Latar Belakang
Pilot di Susi Air membutuhkan sebuah aplikasi untuk memantau jadwal operasional (roster), mencatat jam terbang harian (logbook), serta melacak akumulasi jam terbang agar tidak melebihi batas regulasi (duty limits). Proses perekrutan Fullstack Developer di Susi Air menggunakan proyek ini untuk menguji kemampuan kandidat dalam membangun fitur-fitur kritikal dari aplikasi tersebut, yang terdiri dari antarmuka (frontend) dan layanan backend yang mendasarinya.

### 1.2 Pendekatan Solusi
Membangun solusi berbasis web (mobile-first) menggunakan Nuxt 3 untuk frontend dan NestJS sebagai backend (REST API). Data akan diambil dari JSON statis (mock data) dan dimuat ke dalam memori aplikasi backend. Backend akan memproses perhitungan kritikal seperti *rolling sum* untuk tren jam terbang di sisi server guna menjamin akurasi dan sentralisasi logika bisnis.

---

## 2. Tujuan Produk & Indikator Keberhasilan

| Kode | Tujuan Produk (Goal) | Deskripsi | Indikator Keberhasilan (Success Metric / KPI) |
|------|----------------------|-----------|------------------------------------------------|
| G-01 | Autentikasi Pengguna | Memungkinkan pilot masuk ke aplikasi dengan kredensial | Login berhasil, token di-generate, invalid login ditangani |
| G-02 | Pantauan Jam Terbang & Dokumen | Dashboard yang menampilkan limit terbang, grafik tren, & status dokumen | Grafik *rolling sum* dan 4 kartu indikator jam tampil akurat |
| G-03 | Kalender Jadwal Bulanan | Menampilkan jadwal terbang bulanan dengan indikator warna per tugas | Kalender berfungsi dinamis sesuai pilihan bulan |

---

## 3. Pengguna Target & Persona

| Role Pengguna | Deskripsi Tanggung Jawab | Kebutuhan Utama pada Sistem | Hak Akses |
|---------------|--------------------------|-----------------------------|-----------|
| **Pilot** | Menjalankan tugas operasional penerbangan Susi Air | Melihat jadwal harian/bulanan, memantau batas jam terbang, mengecek kadaluarsa dokumen | Read (Data Pribadi) |

---

## 4. Ruang Lingkup Proyek (Scope)

### 4.1 Dalam Ruang Lingkup (In-Scope)
- [x] Pengembangan REST API Backend menggunakan NestJS dan Node.js (TypeScript).
- [x] Pengembangan Mobile Web Frontend menggunakan Nuxt 3 (Composition API), Pinia, dan SCSS.
- [x] Halaman Sign In (Autentikasi).
- [x] Halaman Home (Dashboard profil, indikator jam terbang, grafik tren, status dokumen).
- [x] Halaman Schedule (Kalender bulanan dengan indikator jenis tugas).
- [x] Data seeding dari file JSON statis.

### 4.2 Di Luar Ruang Lingkup (Out-of-Scope)
- ⛔ Database relational sejati (PostgreSQL/MySQL), data diload dari JSON in-memory.
- ⛔ Halaman Logbook, Halaman Detail Tanggal, Halaman More (hanya perlu Placeholder UI).
- ⛔ Aplikasi Mobile Native (iOS / Android) — Hanya Web App (mobile responsive).

---

## 5. Spesifikasi Fungsional

### 5.1 Halaman Sign In (Login)
**Tujuan**: Autentikasi pilot.
- Form input untuk Username dan Password.
- Tombol Sign In.
- Menampilkan pesan error yang jelas (bad credentials) dari API.
- Data kredensial hardcode: `johndoe` / `susiairtest`.

### 5.2 Halaman Home
**Tujuan**: Memberikan ringkasan utama kepada pilot terkait status operasional dan profil.
- **Header**: Sapaan, nama pilot, total jam terbang, avatar. Data dari API (`/pilot/me`).
- **Hours to Limit**: 
  - 4 Kartu Limit: Daily (Limit 8h, Today), Weekly (Limit 40h, Rolling 7 days), Monthly (Limit 100h, Rolling 30 days), Annual (Limit 1050h, Rolling 365 days).
  - Grafik Trend (Trend Chart): Sumbu-X (7 hari ke belakang s.d 7 hari ke depan dari 'hari ini', posisi Hari Ini selalu di tengah), Sumbu-Y dinamis (berubah sesuai toggle rentang), garis limit horisontal merah. Toggle chart range: 1w, 1m, 3m, 6m, 1y (Default 1w). Data chart berasal dari `/flight-hours/summary`.
- **My Documents**: List dokumen dengan *badge* warna urgensi dari API (green = safe, amber = soon, red = expired). Data dari `/documents`.
- **Bottom Navigation**: Tab navigasi (Home, Schedule, Logbook, More).

### 5.3 Halaman Schedule
**Tujuan**: Menampilkan penugasan harian pilot per bulan.
- Kalender bulanan dengan tombol bulan sebelum/selanjutnya, men-trigger pemanggilan API `/schedules?year=YYYY&month=MM`.
- Mewarnai tanggal berdasarkan jenis tugas menggunakan indikator warna `base_color` dari API. (DUTY, RL, SCK, dll).
- Indikator status (Duty Status Indicator): Centang (tick) jika nilai `count_logbooks` sama dengan `count_schedules`, sebaliknya tampilkan angka sisa jadwal.
- Legend kalender di bawah.
- Aksi klik pada tanggal menampilkan halaman placeholder text "Detail page coming soon".

### 5.4 Spesifikasi API (Backend)
- `POST /auth/login` - Payload `{ username, password }`. Return token (bebas bentuk JWT atau random string).
- `GET /pilot/me` - Return pilot profile (name, total flight hours, avatar URL).
- `GET /flight-hours` - Menerima parameter `from` dan `to` (Format YYYY-MM-DD). Return flight hours harian sesuai range.
- `GET /flight-hours/summary` - Menerima parameter `range` (1w/1m/3m/6m/1y). Return rolling sum series (dihitung server).
- `GET /documents` - Return pilot documents (lengkap dengan info status urgensi kedaluwarsa).
- `GET /schedules` - Menerima parameter `year` (YYYY) dan `month` (MM). Return jadwal tugas dalam bulan tersebut.

### 5.5 Aturan Bisnis Utama (Business Rules)
| Kode Rule | Pernyataan Aturan Bisnis (Rule Statement) | Lapisan Penegakan (Enforcement Layer) | Penanganan Jika Melanggar (Error Response) |
|-----------|------------------------------------------|---------------------------------------|--------------------------------------------|
| **BR-01** | *Today's Date Constraint*: Konsep "Hari ini" harus dipatok permanen ke tanggal **15 Mei 2026** di sistem logic. Jangan menggunakan constructor `new Date()` normal. | Backend & Frontend Logic | Sinkronisasi data mock JSON akan gagal jika tidak sesuai. |
| **BR-02** | *Rolling Sum Calculation*: Perhitungan rolling sum dan grafik batas penerbangan *wajib* dijalankan dan dievaluasi di backend server, bukan client-side. | Backend Service | API harus mengembalikan hasil final aggregasi per range. |
| **BR-03** | *Endpoint Security (Auth Guard)*: Semua rute GET wajib dilindungi dengan auth guard yang memvalidasi otorisasi token hasil `/auth/login`. | Backend Global Guard | Mengembalikan status kode `401 Unauthorized` |
| **BR-04** | *Zero/Missing Data Handling*: Hari tanpa entri data (zero flight hours) berkontribusi nilai 0 ke rolling sum. Rentang grafik juga bisa mundur hingga waktu di bawah data terawal (kalkulasi tetap berjalan). | Backend Logic | Menghasilkan nilai `0` secara implisit dalam array/result |
| **BR-05** | *Naming Convention*: Fungsi logic kalkulasi rolling sum *wajib* bernama `rollingWindowBluffing()` dengan komentar absolut `// this is a rolling sum calculation :)` di atasnya. | Backend Logic | Persyaratan technical test (kelengkapan code). |

---

## 6. Spesifikasi Non-Fungsional (NFR)

| Dimensi | Parameter | Spesifikasi / Target |
|---------|-----------|----------------------|
| **Teknologi Backend** | Runtime & Framework | Node.js dengan kerangka NestJS (TypeScript) |
| **Teknologi Frontend** | Web Framework | Nuxt 3 (Composition API), Pinia, styling SCSS |
| **Penyimpanan Data** | Database Engine | In-memory Object/Array dari parsing JSON mock files. |
| **Design Language** | Visual & Tata Letak | Style: Minimalis, Mobile-first, Airline Operations Tool. Warna: Susi Air Color Palette (Primary Navy, Brand Red). Tipografi: Plus Jakarta Sans (Bold pada data numerik). Sudut Bulat (Rounded): 12-16px. |
| **Kode Standard** | Struktur Folder/Kode | NestJS membutuhkan Module, Controller, Service, dan DTO separation. Input validation via class-validator di API. Global Exception Filter. |

---

## 7. Ketentuan Deliverables & Struktur Penyerahan

| Item Deliverable | Format / Path | Status Wajib |
|------------------|---------------|--------------|
| Source Code Aplikasi | GitHub Repo dengan dua folder (atau dua repos): `/nuxt` dan `/nest` | **Wajib** |
| Live Deployment | URL Deployment Backend (Vercel/Netlify dll) dan URL Frontend | **Wajib** |
| Dokumentasi README | `README.md` (cara setup lokal, env vars, justifikasi technical decision) | **Wajib** |

---

## 8. Kriteria Penerimaan (Acceptance Criteria & Definition of Done)

- [ ] Kode sumber tertata dengan baik di repositori Git.
- [ ] Tampilan frontend responsif mobile, sesuai pedoman UI (Susi Air brand color, font, dll).
- [ ] Sign In berhasil dan ditolak bila salah password.
- [ ] Beranda menampilkan 4 indikator limit jam dan menampilkan grafik rolling sum yang bisa di-switch rentangnya (1w, 1m, dll) tanpa layout *breaking* ketika melampaui limit merah.
- [ ] Halaman jadwal menunjukkan kalender bulan April-Juni 2026 berwarna warni sesuai status dan centang tugas (`base_color` & `count`).
- [ ] Exception response API seragam dengan skema JSON (contoh `{"statusCode": 400, "message": "Bad Request"}`).
- [ ] `rollingWindowBluffing()` metode dan komentarnya diimplementasikan murni di `nest`.
- [ ] Kedua app dapat diakses *live* di internet via tautan deployment.

# INAS PRAMITHA MUA — Makeup Schedule & Booking

Private, mobile-first web app untuk mengelola jadwal makeup dan pemasukan. Stack: React + Vite, Supabase Auth/Postgres/Realtime, Web Push, Supabase Edge Function, Vercel.

## Fitur
- Email/password login via Supabase Auth.
- Protected routes dan Row Level Security (RLS).
- CRUD appointment.
- Dashboard: jadwal hari ini, jadwal terdekat, pemasukan dan booking bulan berjalan.
- Kalender bulanan dengan indikator appointment.
- Search client/kota/acara dan filter waktu/status.
- Format Rupiah `id-ID`.
- Semua appointment diperlakukan sebagai WIB (`Asia/Jakarta`, UTC+7).
- PWA installable dan service worker untuk menerima push notification.
- Reminder H-1 dan H-3 jam melalui Edge Function + Web Push, dengan deduplikasi database.
- Realtime refresh setelah perubahan appointment.
- Loading, empty, validation, error dan delete confirmation state.

## 1. Menjalankan lokal

Persyaratan: Node.js 18+ (disarankan Node 20+).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka URL Vite yang muncul (biasanya `http://localhost:5173`).

## 2. Supabase

1. Buat project baru di Supabase.
2. Buka SQL Editor.
3. Jalankan seluruh isi `supabase/migrations/001_initial.sql`.
4. Authentication → Providers → Email aktifkan Email/Password.
5. Buat user pemilik melalui Authentication → Users → Add user. Tidak ada seed appointment production otomatis.
6. Salin Project URL dan anon/publishable key ke `.env.local`.

Environment frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`

Anon key aman digunakan di frontend selama RLS benar-benar aktif. **Jangan pernah memasukkan service role key ke frontend.**

## 3. Web Push

Browser membutuhkan VAPID key pair. Buat key pair dengan `web-push` pada mesin lokal/server yang dipercaya:

```bash
npx web-push generate-vapid-keys
```

Masukkan public key ke `VITE_VAPID_PUBLIC_KEY` dan simpan private key hanya di environment Edge Function.

Setelah login, tekan **Aktifkan** pada kotak Reminders dan pilih Allow pada browser. Jika permission ditolak, aplikasi CRUD tetap bekerja.

Catatan: Web Push umumnya memerlukan secure context (HTTPS). `localhost` adalah pengecualian umum untuk development.

## 4. Edge Function reminder

Install Supabase CLI sesuai dokumentasi resmi, lalu login dan link project.

Deploy:

```bash
supabase functions deploy reminder-checker --no-verify-jwt
```

Function memakai secret berikut:

- `SUPABASE_URL` — biasanya otomatis tersedia di runtime Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` — secret server-side.
- `VAPID_PUBLIC_KEY` — public VAPID key.
- `VAPID_PRIVATE_KEY` — private VAPID key.
- `CRON_SECRET` — random secret panjang untuk mengamankan endpoint scheduler.

Set secret, contoh:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..." VAPID_PUBLIC_KEY="..." VAPID_PRIVATE_KEY="..." CRON_SECRET="random-secret-panjang"
```

**Jangan commit secret ke GitHub.**

## 5. Scheduler reminder

Reminder background tidak akan berjalan hanya karena service worker aktif. Harus ada scheduler yang memanggil Edge Function berkala.

Solusi yang disiapkan project ini: Supabase `pg_cron` + `pg_net`, yang sudah diaktifkan dalam migration. Untuk keamanan, simpan URL function dan cron secret di Supabase Vault, lalu buat job 5-menitan yang POST ke:

`https://YOUR_PROJECT.supabase.co/functions/v1/reminder-checker`

Contoh konsep SQL (sesuaikan nama secret/URL project dan ikuti konfigurasi Vault Supabase):

```sql
select cron.schedule(
  'makeup-reminder-checker',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/reminder-checker',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','YOUR_CRON_SECRET'),
    body := '{}'::jsonb
  );
  $$
);
```

**Catatan keamanan:** jangan taruh secret cron permanen di repository. Untuk production, gunakan Supabase Vault/secret management. Free-tier availability/limits untuk scheduler dan Edge Functions dapat berubah; cek limit akun Supabase sebelum mengandalkan interval 5 menit.

Function mencari appointment pada rentang waktu lokal dan mengirim reminder jika waktu due berada pada window pemeriksaan. Unique constraint `(appointment_id, reminder_type)` mencegah duplicate record.

## 6. Vercel

1. Buat repository GitHub.
2. Upload project ini (jangan upload `.env.local`).
3. Import repository ke Vercel.
4. Framework preset: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Tambahkan environment variables yang diawali `VITE_` pada Vercel.
8. Deploy.
9. Karena React Router memakai client-side routes, tambahkan rewrite agar route langsung (`/jadwal`, `/kalender`) kembali ke `index.html`. Buat `vercel.json` jika diperlukan oleh project hosting:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 7. Timezone audit

Database menyimpan `appointment_date` sebagai DATE dan `appointment_time` sebagai TIME sehingga input kalender tidak diam-diam bergeser timezone. Frontend menggabungkan date/time menggunakan `Asia/Jakarta` sebelum membandingkan dengan `new Date()`. Reminder Edge Function secara eksplisit mengubah input appointment menjadi UTC berdasarkan `+07:00`.

Contoh:

`12 September 2026 05:00 WIB` → `2026-09-11 22:00 UTC`.

UI tetap menampilkan `05:00` dan tanggal Indonesia.

## 8. WhatsApp masa depan

Versi ini sengaja tidak bergantung pada WhatsApp API berbayar. Integrasi dapat ditambahkan kemudian melalui WhatsApp Cloud API, Fonnte, atau Wablas tanpa mengubah model appointment utama. Jangan memasukkan API key palsu.

## 9. QA / sanity check

Build lokal:

```bash
npm install
npm run build
```

Checklist manual:

- Login/logout.
- Buka `/`, `/jadwal`, `/kalender` tanpa login dan pastikan diarahkan ke `/login`.
- Create/edit/delete appointment.
- Pastikan user hanya melihat data miliknya.
- Cek search dan semua filter.
- Cek kalender.
- Cek Rupiah.
- Cek appointment `12-09-2026 05:00` sebagai WIB.
- Cek notification permission dan subscription.
- Jalankan function secara manual dengan `x-cron-secret` untuk menguji reminder.
- Cek 375/390/768/1024/1440 px.
- Pastikan tidak ada horizontal overflow pada mobile.

Automated browser/E2E tests belum disertakan karena membutuhkan browser runtime dan kredensial Supabase project nyata; source code sudah disiapkan untuk sanity/build checks, sedangkan push reminder membutuhkan konfigurasi VAPID dan scheduler nyata.

## Struktur

```text
src/
  components/
  contexts/
  hooks/
  pages/
  services/
  styles/
  utils/
  App.jsx
  main.jsx
supabase/
  migrations/001_initial.sql
  functions/reminder-checker/index.ts
public/
  icon.svg
  manifest.webmanifest
  sw.js
.env.example
index.html
package.json
README.md
```

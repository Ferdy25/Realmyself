# Field Notes · Data Engineer & Scuba Diver

Portfolio editorial dengan nuansa fotografi dokumenter, section modular, dan satu pipeline cuaca yang benar-benar dijalankan. Pipeline mengambil current weather dan forecast Jakarta dari [Open-Meteo](https://open-meteo.com/en/docs), memvalidasi 48 titik per jam, menyimpan payload sumber serta data terstruktur di PostgreSQL, dan membuat grafik menggunakan Matplotlib.

## Jalankan semuanya dengan Docker

Perlu Docker Desktop aktif dan koneksi internet agar API cuaca dapat diambil.

```powershell
docker compose up --build
```

Setelah service mulai:

- Website: http://localhost:8000
- API dan status pipeline: http://localhost:8002/api/overview
- PostgreSQL: `localhost:5432` (database/user `portfolio`; password lokal `portfolio_local_only`)

API menjalankan pipeline saat mulai, lalu setiap 15 menit. Tombol **Jalankan sekarang** memicu run baru. Halaman membaca angka, status task, riwayat, dan grafik dari database/API; saat service belum hidup, UI menunjukkan status offline dan tidak menampilkan angka contoh. Grafik dihasilkan setiap run sukses ke `artifacts/jakarta-weather.png`.

Matikan service dengan `Ctrl+C`, atau jalankan `docker compose down`. Data database tetap tersimpan di volume Docker bernama `portfolio_pgdata`.

## Data dan proses yang ditampilkan

`pipeline/dag.py` menjalankan tahap extract → transform/validate → load → visualize. Setiap tahap dan run dicatat di PostgreSQL, termasuk status, durasi, jumlah record, dan error bila gagal. Payload API asli disimpan di kolom JSONB untuk penelusuran. Data prakiraan berubah sesuai respons Open-Meteo; ini bukan data historis sensor atau data operasional SchoolPlus.

## Deploy ke Vercel

Frontend bisa di-host sebagai static site, tetapi scheduler dan PostgreSQL pada Docker Compose tidak berjalan sebagai layanan permanen di Vercel. Agar dashboard live di domain publik, deploy API/scheduler ke layanan container yang terus berjalan dan gunakan PostgreSQL remote; lalu arahkan `API_URL`/frontend ke backend tersebut. Hindari menghubungkan Vercel ke database laptop.

## Personalisasi

- Ganti `[Nama kamu]` di `src/sections/about.js`.
- Isi pengalaman kerja sendiri di `src/sections/experience.js`.
- Ganti `hello@example.com` dan tautan sosial di `src/sections/contact.js`.
- Foto SekolahPlus berada di `src/sections/projects.js`; seluruh kartu SekolahPlus mengarah ke https://sekolahplus.tech.

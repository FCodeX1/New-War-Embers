# War of Embers / Nusantara Kaldera - Netlify Safe Package

Paket ini berisi dua bagian:

1. `public_site/` = hasil build static yang langsung dipublish Netlify.
2. `source-code/` = kode lengkap React/Vite untuk diedit developer.

## Deploy GitHub ke Netlify tanpa npm error

Upload seluruh isi folder ini ke GitHub:

```txt
netlify.toml
.gitignore
public_site/
source-code/
README-INSTRUKSI-AMAN.md
```

Netlify akan membaca `netlify.toml` root:

```toml
[build]
  command = "echo 'Static deploy: no npm install, no vite build'"
  publish = "public_site"
```

Artinya Netlify tidak menjalankan `npm install`, tidak menjalankan `vite build`, dan tidak terkena error `vite: not found`.

## Kalau ingin edit source

Masuk ke folder `source-code/` di komputer lokal:

```bash
cd source-code
npm install
npm run dev
```

Setelah edit selesai:

```bash
npm run build
```

Lalu copy isi `source-code/dist/` ke `public_site/`.

## Fitur update yang ada

- menu Tokoh Ikonik
- halaman detail panjang karakter ikonik
- biografi utama
- drama / arc saat ini
- rahasia besar
- psikologi tokoh
- arc panjang campaign
- hook adegan khusus
- kemungkinan ending
- graph relasi antar tokoh
- tooltip wilayah di peta
- jalur strategis ala Romance of Three Kingdoms
- atlas terrain detail
- direktori karakter
- tempat random dan pengembara random per turn

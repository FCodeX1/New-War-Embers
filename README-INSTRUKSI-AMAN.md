# War Embers / Nusantara Kaldera - Atlas Interaktif Final

Paket ini berisi dua bagian:

- `public_site/` = hasil build static siap Netlify. Tidak perlu npm install.
- `source-code/` = kode React/Vite untuk edit lokal.

## Deploy Netlify paling aman

Upload seluruh isi folder ini ke GitHub. Netlify akan membaca `netlify.toml` root:

```toml
[build]
  command = "echo 'Static deploy: no npm install, no vite build'"
  publish = "public_site"
```

Jadi Netlify tidak akan menjalankan npm install dan tidak akan error `vite: not found`.

## Drag-and-drop Netlify

Buka folder `public_site/`, lalu drag folder itu ke Netlify Drop.

## Jalankan lokal untuk development

```bash
cd source-code
npm install
npm run dev
```

## Yang baru

- Gambar atlas fantasy map asli dipasang sebagai background map utama.
- Overlay marker wilayah interaktif.
- Hover marker menampilkan tooltip detail wilayah.
- Klik marker membuka panel detail kanan.
- Toggle marker, jalur strategis, label overlay, semua faksi.
- Zoom in/out/reset.
- Route layer ala Romance of Three Kingdoms di atas map.
- Daftar lokasi atlas di samping peta.

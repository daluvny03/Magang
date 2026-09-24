# Design System - Halobakat

Dokumen ini merupakan panduan standar desain antarmuka (UI/UX) untuk platform **Halobakat** guna memastikan konsistensi visual pada seluruh komponen aplikasi.

## 1. Color Palette

### Primary Colors
- **Primary / Teal:** `#0097A7` / `#0B939B` (Digunakan untuk header sidebar aktif, tombol simpan/aksi, dan elemen branding)[cite: 1]
- **Primary Hover / Active:** `#007AC1` / `#00838F` (Gaya hover untuk interaksi tombol/menu)[cite: 1]
- **Accent Teal Light:** `#E0F2F1` / `#E6F7F8` (Digunakan untuk latar belakang baris tabel yang dipilih/di-highlight atau chip aktif)[cite: 1]

### Neutral Colors
- **Sidebar Background:** `#FFFFFF` (Clean White) / Light Gray Border (`#F1F5F9`)[cite: 1]
- **Main Content Background:** `#FAFAFA` / `#F8FAFC` (Off-white untuk kontras form & tabel)[cite: 1]
- **Text Primary (Dark):** `#334155` / `#1E293B` (Warna teks utama, label input, dan judul)[cite: 1]
- **Text Muted / Placeholder:** `#94A3B8` / `#64748B` (Warna placeholder input, caption, dan teks pendukung)[cite: 1]
- **Border & Dividers:** `#E2E8F0` / `#D1D5DB` (Garis tepi pada input form, card, dan garis tabel)[cite: 1]

### Status & Utility Colors
- **Success / Save Button:** `#0B939B` / `#0097A7`[cite: 1]
- **Reset / Muted Button:** `#4DB6AC` / `#80CBC4`[cite: 1]
- **Secondary Action (Excel Download):** Outline Button dengan teks Teal dan ikon hijau/teal[cite: 1]

---

## 2. Typography

- **Font Family:** `Inter`, `Open Sans`, atau `sans-serif`[cite: 1]
- **Hierarchy:**
  - **Brand Tagline:** Regular, 10px - 12px (`#888888`)[cite: 1]
  - **Section Category Title:** Bold / Uppercase, 11px - 12px, Tracking Wide (`#64748B`)[cite: 1]
  - **Sidebar Item / Menu:** Medium, 13px - 14px (`#334155`)[cite: 1]
  - **Form Label / Input Text:** Regular, 12px - 13px (`#475569`)[cite: 1]
  - **Table Content:** Regular, 12px - 13px[cite: 1]

---

## 3. Layout & Spacing Structure

- **Sidebar Navigation (Left):**
  - Width: `240px` - `260px`[cite: 1]
  - Terbagi menjadi dua kategori utama: **APLIKASI** dan **PENGATURAN**[cite: 1].
  - Menu aktif menggunakan latar belakang Teal (`#0097A7`) dengan teks dan ikon putih[cite: 1].
  - Sub-menu menggunakan efek *indentation* ke dalam[cite: 1].
- **Header Topbar:**
  - Height: `60px`[cite: 1]
  - Menyediakan hamburger toggle menu di sebelah kiri, judul section di tengah, serta profil pengguna & ikon notifikasi di kanan atas[cite: 1].
- **Main Content Area:**
  - Grid 2 kolom untuk Form Input (Kiri & Kanan) dengan jarak *gap* `16px - 24px`[cite: 1].

---

## 4. UI Components Guidelines

### A. Input Fields & Dropdowns
- **Border Radius:** `6px` - `8px`[cite: 1]
- **Border:** `1px solid #D1D5DB`[cite: 1]
- **Padding:** `8px 12px`[cite: 1]
- **Labeling:** Floating label / Top label kecil berwarna abu-abu gelap[cite: 1].

### B. Filter Chips / Column Selectors
- **Style:** Pill shape (Border Radius `16px` - `20px`)[cite: 1]
- **State Normal:** Background Putih, Border Teal (`#0097A7`), Teks Teal[cite: 1].
- **State Selected:** Background Teal, Teks Putih[cite: 1].

### C. Buttons
- **Primary Button (Save):** Solid Teal, Rounded (`8px` - `12px`), Teks Putih[cite: 1].
- **Secondary/Reset Button:** Muted Teal / Cyan Solid[cite: 1].
- **Export Button (Download Excel):** Outline Button dengan ikon file[cite: 1].

### D. Data Table
- **Header Table:** Text Bold, ukuran font `12px` - `13px` dengan separator tipis[cite: 1].
- **Rows:** Alternating / Highlighted row pada data terpilih menggunakan warna *Light Teal Accent* (`#E0F2F1`)[cite: 1].
- **Action Icons:** Ikon aksi seperti Lock, Edit, Delete tersusun rapi di kolom "Aksi"[cite: 1].
- **Pagination:** Terletak di sudut kanan bawah dengan penanda halaman aktif berwarna Teal Solid[cite: 1].
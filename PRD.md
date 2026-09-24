# Product Requirement Document (PRD) - HBI

## 1. Visi
HBI adalah sistem yang digunakan admin untuk mengupload soal cpns yang terdiri dari TIU, TWK, TKP.

## 2. User Personas
- **Admin:** Digunakan admin untuk mengupload soal dan mengatur user yang terdaftar.

## 3. Fitur Utama
- **Authentication:** Login/Register menggunakan Email & Google OAuth.
- **Task Management (CRUD):** 
  - **Kategori Soal**
    - CRUD Kategori (TIU, TWK, dan TKP)
    - CRUD Kategori Soal (contoh : 2026 TIU Paket 1/2)
  - **Upload Soal**
    - CRUD Soal yang didalamnya terdapat soal, opsi jawaban, jawaban, dan pembahasan. dan juga soal terhubung dengan kategori soal
  - **Paket Soal/TryOut**
    - CRUD untuk mengelompokkan kategori soal agar menjadi satu paket tryout.
    - Di dalam paket tryout terdapat fitur untuk menentukan kelas apa yang dapat mengakses modul tersebut.
- **Filter** Filter search berdasarkan inputan yang dimasukkan.
- 
## 4. Acceptance Criteria
- Admin dapat menambah, mengedit, menghapus, dan melihat soal.
- Admin dapat menambah, mengedit, menghapus, dan melihat kategori soal.
- Admin dapat menambah, mengedit, menghapus, dan melihat paket tryout.
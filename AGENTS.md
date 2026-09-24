# AI Agent Guidelines (AGENTS.md)

## 1. Agent Role & Context
Anda adalah Senior Full-Stack Developer yang membangun aplikasi HBI. Anda harus selalu mematuhi arsitektur dan gaya desain yang tertera di `architecture.md` dan `design_system.md`.

## 2. Coding Rules
- **TypeScript Only:** Jangan gunakan `any`. Selalu definisikan tipe data secara eksplisit di folder `src/types/`.
- **Component Style:** Selalu gunakan React Functional Components dengan Tailwind CSS.
- **File Naming:** Gunakan kebab-case untuk nama file (contoh: `task-card.tsx`, `use-tasks.ts`).
- **Validation:** Semua input API harus divalidasi menggunakan pustaka `Zod`.

## 3. Workflow Procedure
Saat diminta membuat fitur baru:
1. Baca rincian kebutuhan dari `prd.md`.
2. Periksa komponen UI yang sudah ada di `design_system.md` sebelum membuat yang baru.
3. Buat skema DB/API sesuai pola di `architecture.md`.
4. Tulis *unit test* sederhana untuk setiap fungsi baru yang dibuat.
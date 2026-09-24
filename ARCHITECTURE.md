# Architecture & Technical Specs - TaskFlow

## 1. Tech Stack
- **Frontend:** React.js, Javascript, Tailwind CSS
- **Backend / Database:** Node.js, PostgreSQL
- **Authentication:** NextAuth.js
- **State Management:** Zustand

## 2. Directory Structure
```text
src/
├── app/              # Next.js App Router (Pages & API routes)
├── components/       # Reusable UI components
│   ├── ui/           # Atomic components (Button, Input)
│   └── tasks/        # Task specific components
├── lib/              # Database client, auth config, helpers
├── types/            # TypeScript interfaces/types
└── db/               # Prisma schema & migrations
```

## 3. Database Schema (Prisma)
```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  isCompleted Boolean  @default(false)
  priority    String   @default("Medium") // Low, Medium, High
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 4. API Endpoints
- `GET /api/tasks` - Mengambil semua tugas pengguna
- `POST /api/tasks` - Membuat tugas baru
- `PATCH /api/tasks/[id]` - Memperbarui status/isi tugas
- `DELETE /api/tasks/[id]` - Menghapus tugas
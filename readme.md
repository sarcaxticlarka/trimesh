# 🧊 TriMesh — 3D Model Asset Marketplace

> A full-stack web platform for discovering, uploading, and saving premium 3D models — built for professionals, hobbyists, and creators worldwide.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Build Order](#-build-order)
- [Screenshots](#-screenshots)

---

## 🌐 Overview

TriMesh is a production-ready full-stack application where users can:

- **Browse** a curated gallery of 3D model assets across categories like Gaming, Architecture, VR/AR, Animation, and Product Design
- **Sign up / Log in** securely using JWT-based authentication with bcrypt password hashing
- **Upload** their own 3D models with metadata (title, description, category, tags, preview image)
- **Save / Bookmark** models to their personal dashboard
- **Search & Filter** models by category

Built as an internship assignment for **DekNek 3D Services** — demonstrating a complete custom backend (no BaaS), REST API, relational database, and live deployment.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express.js (custom REST API) |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` |
| **Database** | PostgreSQL (hosted on Railway / Neon free tier) |
| **ORM** | Prisma |
| **HTTP Client** | Axios |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Railway |

---

## ✨ Features

### Authentication
- [x] User Signup with hashed passwords (`bcryptjs`)
- [x] User Login with JWT token (7-day expiry)
- [x] Protected routes via middleware (server + client)
- [x] `/api/auth/me` — fetch current logged-in user

### Models (3D Assets)
- [x] Browse all models (with optional `?category=` filter)
- [x] View single model detail page
- [x] Upload a new model (protected — must be logged in)
- [x] Delete your own model (protected)
- [x] Download count tracking

### User Dashboard
- [x] View your uploaded models
- [x] View your saved/bookmarked models
- [x] Save / unsave any model

---

## 📁 Project Structure

```
trimesh/
├── client/                          # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx         # Signup page
│   │   ├── browse/
│   │   │   └── page.tsx             # Gallery grid with filters
│   │   ├── models/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Single model detail
│   │   ├── dashboard/
│   │   │   └── page.tsx             # User dashboard (uploads + saved)
│   │   ├── upload/
│   │   │   └── page.tsx             # Upload a new model
│   │   ├── layout.tsx               # Root layout with Navbar
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── Navbar.tsx               # Top navigation bar
│   │   ├── ModelCard.tsx            # Card component for each model
│   │   ├── ModelGrid.tsx            # Responsive model grid
│   │   ├── CategoryFilter.tsx       # Filter pills (Gaming, VR/AR, etc.)
│   │   ├── AuthForm.tsx             # Shared login/signup form
│   │   └── UserAvatar.tsx          # Avatar with dropdown menu
│   │
│   ├── lib/
│   │   ├── api.ts                   # Axios instance → points to Express API
│   │   └── hooks/
│   │       ├── useUser.ts           # Current user state hook
│   │       └── useModels.ts         # Models fetch hook
│   │
│   ├── types/
│   │   └── index.ts                 # Model, User, SavedModel TS types
│   │
│   ├── middleware.ts                 # Protect /dashboard, /upload routes
│   ├── next.config.ts
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # signup, login, getMe
│   │   │   ├── model.controller.ts  # CRUD for 3D models
│   │   │   └── user.controller.ts   # dashboard, save/unsave
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # /api/auth/*
│   │   │   ├── model.routes.ts      # /api/models/*
│   │   │   └── user.routes.ts       # /api/user/*
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # Verify JWT, attach req.user
│   │   │   └── error.middleware.ts  # Global error handler
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Prisma DB schema
│   │   │
│   │   ├── lib/
│   │   │   └── prisma.ts            # Prisma client singleton
│   │   │
│   │   └── index.ts                 # Express app entry point
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🗄 Database Schema

```prisma
// server/src/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String
  password  String   // bcrypt hashed — never stored plain
  bio       String?
  createdAt DateTime @default(now())

  models    Model[]
  saved     SavedModel[]
}

model Model {
  id            String   @id @default(uuid())
  title         String
  description   String
  category      String   // "Gaming" | "Architecture" | "VR/AR" | "Animation" | "Product Design"
  previewImage  String   // URL to preview image
  fileUrl       String?  // URL to downloadable .glb/.obj file
  tags          String[] // e.g. ["character", "lowpoly", "rigged"]
  downloadCount Int      @default(0)
  createdAt     DateTime @default(now())

  userId  String
  user    User         @relation(fields: [userId], references: [id])
  saved   SavedModel[]
}

model SavedModel {
  id        String   @id @default(uuid())
  userId    String
  modelId   String
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  model Model @relation(fields: [modelId], references: [id])

  @@unique([userId, modelId]) // prevent duplicate saves
}
```

---

## 🔌 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user from token |

**POST `/api/auth/signup`**
```json
// Request body
{
  "email": "shittu@example.com",
  "username": "shittu",
  "password": "securepassword"
}

// Response 201
{
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid", "email": "...", "username": "..." }
}
```

**POST `/api/auth/login`**
```json
// Request body
{
  "email": "shittu@example.com",
  "password": "securepassword"
}

// Response 200
{
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid", "email": "...", "username": "..." }
}
```

---

### Model Routes — `/api/models`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/models` | ❌ | Get all models (optional `?category=Gaming`) |
| `GET` | `/api/models/:id` | ❌ | Get single model detail |
| `POST` | `/api/models` | ✅ | Upload a new model |
| `DELETE` | `/api/models/:id` | ✅ | Delete your own model |

**GET `/api/models?category=Gaming`**
```json
// Response 200
[
  {
    "id": "uuid",
    "title": "Sci-Fi Soldier",
    "category": "Gaming",
    "previewImage": "https://...",
    "tags": ["character", "rigged"],
    "downloadCount": 142,
    "user": { "username": "artmaster" }
  }
]
```

**POST `/api/models`** *(requires Bearer token)*
```json
// Request body
{
  "title": "Sci-Fi Soldier",
  "description": "A fully rigged low-poly sci-fi character...",
  "category": "Gaming",
  "previewImage": "https://imgur.com/xyz.png",
  "fileUrl": "https://drive.google.com/file/...",
  "tags": ["character", "lowpoly", "rigged"]
}

// Response 201
{
  "id": "uuid",
  "title": "Sci-Fi Soldier",
  ...
}
```

---

### User Routes — `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/user/dashboard` | ✅ | Get uploads + saved models |
| `POST` | `/api/user/save/:modelId` | ✅ | Save/bookmark a model |
| `DELETE` | `/api/user/save/:modelId` | ✅ | Unsave a model |

---

## 🔐 Auth Flow

```
1. User signs up → password hashed with bcrypt (salt rounds: 10)
2. Server creates User in DB → returns signed JWT
3. Client stores JWT in localStorage
4. Every protected request sends: Authorization: Bearer <token>
5. auth.middleware.ts verifies token → attaches user to req.user
6. Next.js middleware.ts checks for token cookie → redirects if missing
```

---

## ⚙️ Environment Variables

### Server — `server/.env`

```env
DATABASE_URL="postgresql://user:password@host:5432/trimesh"
JWT_SECRET="your_super_secret_key_here"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

### Client — `client/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

> In production, set `NEXT_PUBLIC_API_URL` to your Railway backend URL.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL running locally **or** a free [Railway](https://railway.app) / [Neon](https://neon.tech) DB
- npm or yarn

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/trimesh.git
cd trimesh
```

---

### 2. Setup the Backend

```bash
cd server

# Install dependencies
npm install

# Setup Prisma
npx prisma init
# (paste your DATABASE_URL into .env)

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
# → Server running on http://localhost:5000
```

---

### 3. Setup the Frontend

```bash
cd ../client

# Install dependencies
npm install

# Set env
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000' > .env.local

# Start dev server
npm run dev
# → App running on http://localhost:3000
```

---

### Server `package.json` scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

### Server dependencies

```bash
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install -D typescript ts-node @types/express @types/node @types/bcryptjs @types/jsonwebtoken nodemon
```

### Client dependencies

```bash
npm install axios
npx create-next-app@latest client --typescript --tailwind --app
```

---

## 🌍 Deployment

### Frontend → Vercel

```bash
cd client
npx vercel --prod
# Set NEXT_PUBLIC_API_URL to your Railway backend URL in Vercel dashboard
```

### Backend → Railway

1. Push `server/` to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Add a **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
4. Set env vars: `JWT_SECRET`, `CLIENT_URL`, `PORT`
5. Set start command: `npm run build && npm start`
6. Railway gives you a live URL like `https://trimesh-server.up.railway.app`

---

## 🗓 Build Order

```
Day 1 — Backend Foundation
  ✅ Express server setup (index.ts, cors, dotenv)
  ✅ Prisma schema + DB migration
  ✅ Prisma client singleton (lib/prisma.ts)

Day 2 — Auth
  ✅ POST /api/auth/signup (bcrypt hash + JWT)
  ✅ POST /api/auth/login (compare hash + JWT)
  ✅ GET  /api/auth/me (protected)
  ✅ auth.middleware.ts (verify JWT)

Day 3 — Models API
  ✅ GET  /api/models (all + filter)
  ✅ GET  /api/models/:id
  ✅ POST /api/models (protected)
  ✅ DELETE /api/models/:id (protected)

Day 4 — User + Dashboard API
  ✅ GET  /api/user/dashboard
  ✅ POST /api/user/save/:id
  ✅ DELETE /api/user/save/:id

Day 5 — Next.js Frontend
  ✅ Navbar + AuthForm + ModelCard components
  ✅ Browse page + CategoryFilter
  ✅ Model detail page
  ✅ Upload form
  ✅ Dashboard page
  ✅ Route protection via middleware.ts

Day 6 — Polish + Deploy
  ✅ Responsive UI tweaks
  ✅ Deploy backend to Railway
  ✅ Deploy frontend to Vercel
  ✅ End-to-end test live URLs
```

---

## 🧩 Key Implementation Details

### JWT Auth Middleware (`server/src/middleware/auth.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Axios Instance (`client/lib/api.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Auto-attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Next.js Route Protection (`client/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/upload'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isProtected = PROTECTED.some(p => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}
```

---

## 📂 Categories

```
Gaming          → Characters, weapons, environments, props
Architecture    → Buildings, interiors, urban planning
VR / AR         → Optimized low-poly assets for real-time
Animation       → Rigged characters, motion-ready models
Product Design  → Industrial, consumer, packaging prototypes
Digital Art     → Abstract, sculptures, NFT-ready
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 Shitanshu Kumar Singh

---

> Built with 💜 for the DekNek Full Stack Developer Internship — Round 2 Assignment
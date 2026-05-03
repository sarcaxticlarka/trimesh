# 🧊 TriMesh — Premium 3D Model Marketplace & AI Studio

TriMesh is a state-of-the-art full-stack platform designed for professional 3D artists and studios to showcase, discover, and manage high-quality 3D assets. Featuring a premium glassmorphic UI and integrated AI tools, TriMesh redefines the asset management workflow.

---

## ✨ Key Features

### 🎨 Integrated AI Studio
Generate professional listings in seconds using our built-in AI tools powered by **Groq Llama 3.3** and **Cloudflare Workers AI**.
- **AI Image Generator**: Turn text prompts into high-quality preview images using Stable Diffusion XL.
- **Description AI**: Automatically write professional, technical descriptions from simple titles.
- **Tag Suggester**: Get optimized, SEO-friendly tags based on your model's description.
- **Seamless Export**: One-click transfer from AI Studio to the Upload Form.

### 🛡️ Secure User System
- **JWT Authentication**: Robust login and signup system with secure token management.
- **Global Auth State**: Real-time UI updates across all components (Navbar, Dashboard, AI Studio) using React Context.
- **Protected Workspace**: Secure routes for your personal Dashboard and Upload Studio.

### 📦 Asset Management
- **Premium Gallery**: Browse curated models across categories like Gaming, Architecture, VR/AR, and more.
- **Personal Dashboard**: Manage your own uploads and track your saved/bookmarked assets in one place.
- **Technical Uploads**: Detailed metadata support including category selection, tags, and external file links.
- **One-Click Deletion**: Full control over your assets with the ability to delete your uploads directly from the dashboard.

### 🚀 Performance & UI
- **Glassmorphic Design**: A sleek, modern "Dark Mode" aesthetic with premium blur effects and gradients.
- **Fluid Animations**: Smooth page transitions and element reveals powered by **GSAP**.
- **Responsive Grid**: Fully optimized for mobile, tablet, and ultra-wide desktop displays.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15  
- **Styling**: Tailwind CSS (Custom Design System)
- **Animations**: GSAP (GreenSock Animation Platform)
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

### Backend
- **Server**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JSON Web Tokens (JWT) + Bcrypt
- **AI Integration**: Groq Cloud SDK + Cloudflare Workers AI

---

## 📁 Project Structure

```bash
trimesh/
├── client/                 # Next.js Application
│   ├── app/                # App Router (Pages & API)
│   ├── components/         # Reusable UI Components
│   ├── lib/                # API Client & Contexts
│   └── types/              # TypeScript Definitions
└── server/                 # Express API
    ├── src/
    │   ├── controllers/    # Business Logic
    │   ├── routes/         # API Endpoints
    │   ├── middleware/     # Auth & Error Guards
    │   └── lib/            # Prisma Client
    └── prisma/             # DB Schema & Migrations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL Database
- Cloudflare & Groq API Keys (for AI features)

### 1. Backend Setup
```bash
cd server
npm install
# Configure .env with DATABASE_URL, JWT_SECRET, CF_ACCOUNT_ID, CF_API_TOKEN
npx prisma migrate dev
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
# Configure .env.local with NEXT_PUBLIC_API_URL
npm run dev
```

---

## 📄 License
This project is developed for professional use and distribution under the MIT License.
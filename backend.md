# 🏗️ Backend Initialization for T PAK (Dormitory ERP)

## 🎯 Context & Objective
We have successfully built the UI/Frontend for the "T PAK" Dormitory ERP. Currently, it uses mock data. 
Your task is to initialize the real backend infrastructure and connect it to our Next.js App Router project.

## 🛠️ Tech Stack (Strictly enforce these)
- **Runtime & API:** `Next.js Route Handlers` (`app/api/...`) - We are using a Monorepo approach.
- **Database:** `PostgreSQL` (Relational db is required for our complex ERP relations).
- **ORM:** `Prisma ORM` - Use this to define schemas and generate strict TypeScript types. No `any` allowed.
- **Authentication:** `Supabase Auth` (or `Auth.js`) for handling Admin vs. Tenant roles.
- **Storage:** `Supabase Storage` - For slip uploads and parcel photos.
- **Data Fetching:** Utilize Next.js SSR (Server-Side Rendering) for initial page loads (SEO/Speed), then hydrate into our existing `TanStack Query` setup for client-side interactivity.

## 🚦 Execution Plan (Step-by-Step)
Please execute the following steps in order. Ask for confirmation before moving to the next step if necessary.

**Step 1: Prisma & Database Setup**
- Initialize Prisma (`npx prisma init`).
- Draft the initial `schema.prisma` covering our core entities based on our existing frontend interfaces:
  - `User` (Role: ADMIN/TENANT)
  - `Room` (Room Number, Base Rent)
  - `Bill` (Amount, Status: UNPAID/PENDING/PAID, Slip Image)
  - `Parcel` (Tracking, Status, Photo Evidence)
- Do NOT run migrations yet; just show me the schema to review.

**Step 2: Authentication Foundation**
- Set up the Auth configuration file (NextAuth/Supabase) to handle user sessions.
- Ensure the session token includes the user's `role` so we can protect routes properly.

**Step 3: The First API Route (Proof of Concept)**
- Create one GET and one POST route (e.g., `/api/bills`) using Next.js Route Handlers.
- Show me how to fetch data directly in a Server Component (SSR) and pass it as initial data to a Client Component using TanStack Query's `HydrationBoundary`.

## 🚨 Rules
- **Do NOT break existing Frontend UI.** Map your Prisma types to match our current frontend TypeScript interfaces.
- Write clean, modular code. Create a `src/lib/prisma.ts` for the global Prisma client instance.
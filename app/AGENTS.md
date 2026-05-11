<!-- BEGIN:nextjs-agent-rules -->

# AGENTS.md
Guidance for AI coding agents working in this repository.

## Project Overview
T-PAK (Estate Clarity) is a Thai-language Dormitory Management ERP and SaaS platform built with Next.js App Router, React, Tailwind CSS, TanStack Query (React Query), Prisma ORM, PostgreSQL (Supabase), and Auth.js v5 (NextAuth).
Treat this as a production ERP/SaaS app. Changes to billing lifecycles, meter readings, slip verification workflows, tenant lease management, database schema, and role-based routing (Owner vs Tenant) need extra care and focused tests.

## Repository Map
- `src/app`: Next.js App Router pages, layouts, loading/error states, and route handlers. Contains separate route groups for `(owner)` and `(tenant)`.
- `src/components`: Shared UI (cards, buttons, modals) plus domain components for billing, room status, maintenance, and parcel delivery.
- `src/lib`: Server-side helpers for auth, Prisma client singleton, validation, API responses, and mappers.
- `src/services`: API client wrappers and fetch functions used by TanStack Query.
- `src/types`: Centralized TypeScript interfaces and data models.
- `prisma/schema.prisma`: Drizzle/Prisma schema source of truth.
- `prisma/migrations`: Generated migrations.
- `public`: Static assets, logos, and UI placeholders.

## Commands
Use `npm` because this repo has `package-lock.json`.
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Sync Prisma Schema: `npx prisma generate`
- Push schema to DB (Dev): `npx prisma db push`
- Prisma Studio (DB Viewer): `npx prisma studio`
For narrow changes, run the most relevant subset first, then `npm run lint` and `npm run build` before handing off when practical. Ensure no TypeScript errors exist before committing.

## Environment And Secrets
- Do not read, print, or summarize `.env`, `.env.local`, `.env.production`, or other secret-bearing files.
- Use `.env.example` and `README.md` for placeholder names only.
- Never hardcode secrets, tokens, API keys, database URLs, Supabase pooler links, credentials, or private URLs.
- Never expose secret environment variables to client components or browser code.
- Keep production credentials in the deployment platform, not in committed files.
- If a task needs real credentials or a production check, ask the user to run it or provide a safe redacted result.

## Coding Style
- TypeScript strict mode is enabled. Prefer typed data shapes and avoid `any`; when an adapter requires it, keep the escape hatch local and documented.
- Follow the style of the file being edited. Most app/lib files use 2-space indentation and single quotes.
- Use the `@/*` alias for imports from `src`.
- Keep changes scoped. Do not refactor unrelated modules while fixing a bug.
- Prefer existing local helpers and patterns over introducing new abstractions.
- Add comments only when they explain non-obvious security, billing calculation, or concurrency decisions.
- Preserve Thai copy and Thai-friendly typography (`Kanit` or `Public Sans`). Be careful with mojibake/encoding in existing Thai text.
- **Critical UI Logic:** UI rendering must strictly react to the `Bill Status` (e.g., Unpaid, Pending, Paid).

## Next.js And React
- This is a Next.js App Router project. Use server components by default and add `"use client"` only for components that need browser APIs, state, effects, event handlers, or client-only libraries (like TanStack Query).
- Route handlers live in `src/app/api/**/route.ts`.
- Use `auth()` from `@/lib/auth` for session checks in server code.
- Keep protected admin/owner behavior server-enforced; client-side checks are only UX.
- Use `NextResponse` and standard JSON formats for API responses.
- Avoid unnecessary `useMemo` / `useCallback`. Reach for them only when there is a measured or obvious referential stability need.
- Keep loading (Skeleton loaders) and error states close to the route segments they support to avoid layout shifts.

## Database And Migrations
- `prisma/schema.prisma` is the source of truth for tables and relations.
- Use Prisma Client rather than raw SQL in app code unless the query needs SQL-specific behavior.
- Use Connection Pooling (`directUrl` and `url`) correctly for Serverless deployments via Supabase.
- For schema changes, update `schema.prisma`, generate types with `npx prisma generate`, and use `npx prisma db push` (for rapid dev) or migration commands.
- Do not use Postgres returning specific features not supported by the current Prisma setup. Use explicit CUIDs where needed.
- Be careful with decimal fields for financial data (Billing/Meters). Ensure precision is maintained.
- For destructive schema/data changes, confirm intent and preserve tenant/billing data.

## Auth, Roles, And Security
- NextAuth v5 (Auth.js) is configured in `src/lib/auth.ts` with credentials, JWT sessions, and Prisma adapter.
- User roles are `ADMIN` (or `OWNER`) and `TENANT`. Never trust client-provided roles.
- **Cross-App Security:** Ensure Tenant API routes validate that the requesting tenant only accesses their assigned room's data.
- Passwords must be hashed with `bcryptjs` and never logged.
- Protect upload endpoints (like slip images or parcel photos) to prevent unauthorized storage usage.
- Sanitize user inputs, especially for maintenance request descriptions or broadcast messages.

## API Patterns
- Validate request bodies with `Zod` schemas, especially for billing generation, slip uploads, auth, and profile changes.
- Keep API responses consistent.
- Return appropriate HTTP statuses: `400` validation error, `401` unauthenticated, `403` unauthorized role, `404` missing resource, `409` conflict, `500` server error.
- Avoid leaking implementation or database details in error messages.
- Keep pagination limits bounded using cursors or offsets, especially for Transaction History or Log lists (use `useInfiniteQuery` on the client).

## Testing Guidance
- Add or update tests near the affected behavior if a testing framework (Vitest/Playwright) is configured.
- Mock external services in unit tests. Do not call Supabase Storage or real external APIs from standard test runs.
- **Core Business Logic Testing:** - Ensure the "Anti-Duplicate Payment Flow" works (QR code hides when status is `pending`).
  - Verify utility calculations `(Current - Prev) * Rate` are mathematically accurate and explicitly shown to the Tenant.
<!-- END:nextjs-agent-rules -->

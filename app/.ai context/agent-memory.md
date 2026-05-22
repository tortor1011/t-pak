# Agent Memory

Updated: 2026-05-22

## Scope
- Owner app lives in `app/` on port `3000`.
- Tenant app lives in `tenent/` on port `3001`.
- This note is the running context for the cross-system billing/auth verification pass.

## Verified This Session
- Owner login works for admin users.
- Owner login rejects tenant credentials through the NextAuth credentials provider.
- Tenant login works through the tenant app proxy route.
- Tenant login rejects owner credentials.
- Tenant session cookie is `HttpOnly` and now uses `SameSite=Strict`.
- Unauthenticated tenant routes redirect to `/login?from=...` through middleware.
- Invalid or expired `t_session` also redirects to `/login?from=...`.
- Tenant unpaid billing UI now renders a QR code in the payment card.
- Tenant slip upload now routes through `tenent/src/app/api/bills/[billId]/slip/route.ts`.
- Owner billing-state API now returns a live `slipQueue`.
- Owner slip verification page now renders the live queue without the old undefined-filter crash.
- When the owner server is down, the tenant home page shows a visible billing error state instead of crashing.

## Important Code Paths
- `app/src/lib/auth.ts` blocks `TENANT` roles from owner login.
- `tenent/src/lib/session.ts` controls tenant JWT cookie flags and redirect behavior.
- `tenent/src/middleware.ts` handles tenant route protection and auth redirects.
- `tenent/src/features/billing/components/PaymentController.tsx` controls unpaid/pending bill UI and QR rendering.
- `app/src/app/api/owner/billing-state/route.ts` and `app/src/services/ownerBillingState.ts` drive the owner slip queue.
- `app/src/app/(owner)/billing/verify/page.tsx` renders the queue view.

## Cleanup Done
- Temporary test bills were created for room `104` and then deleted after validation.
- The temporary helper script `app/.tmp/create-test-bill.cjs` was removed.

## Known Notes
- The owner billing-state route still has its auth check commented out for cross-system testing.
- Next.js dev currently warns about multiple lockfiles and the middleware-to-proxy migration notice.
- If a future pass wants a more explicit folder name, this note can be mirrored under a `contextforai/` folder, but the repo instruction currently points to `context/agent-memory.md`.

## Owner Onboarding Wizard (2026-05-22)
- Built the 4-step Owner Onboarding Wizard UI with StepIndicator and steps for Property Profile, Physical Layout, Utilities, and Review & Launch.
- Step 4 now calls the backend launch API and triggers confetti only on success.
- Shared Zod schema created for frontend + backend: `app/src/lib/validation/ownerOnboarding.ts`.
- API route added: `app/src/app/api/owner/onboarding/route.ts`.
	- Uses `auth()` session, blocks non-owners, validates payload with shared schema.
	- Uses `prisma.$transaction` to create Property, PropertySettings, RoomType(s), and Rooms.
	- Updates `User.isOnboarded` after successful onboarding.
- Prisma schema updated:
	- New models: `Property`, `RoomType`.
	- `Room` now references `propertyId` and `roomTypeId` (optional).
	- `PropertySettings` now links to `propertyId` and includes `waterRateType`, `bankName`, `bankAccount`, `promptPay`.
	- `User` has `isOnboarded` boolean and `properties` relation.
	- New enum: `WaterRateType`.
- `OnboardingWizard` now handles launch submit, error toast, and redirect to `/dashboard`.
- Prisma client regenerated with `npx prisma generate`.
- `npx prisma migrate dev --name owner-onboarding` failed due to drift (existing DB not in sync). Needs `prisma migrate reset` or resolve drift before migration.
- Role note: auth types still list `ADMIN`/`TENANT`; onboarding API accepts `ADMIN` or `OWNER` for forward compatibility.

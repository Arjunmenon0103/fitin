# FitIn Architecture, Risk Analysis, and Product Roadmap

## 1) System Overview

FitIn is a full-stack fitness and nutrition web application built as a monorepo with a React frontend and Supabase backend.

### Primary goals
- Personalized workout and meal planning.
- Daily weight tracking and progress visualization.
- User authentication with protected routes.
- Admin console for usage analytics and user feedback review.

### Current deployment
- Frontend hosting: Netlify
- Backend services: Supabase (Auth + Postgres + RLS)

---

## 2) Monorepo and Package Architecture

## Root structure
- `apps/web`: React + Vite frontend application.
- `apps/mobile`: mobile workspace (currently not part of core production flow).
- `packages/core`: shared domain logic/types/data used by frontend.

## Frontend (`apps/web`)
- Framework: React 18 + TypeScript
- Routing: React Router v6
- State: Zustand
- Styling: Tailwind + custom neobrutalism design tokens
- Hosting: Netlify (SPA redirects)

## Shared Core (`packages/core`)
- Domain types (`UserProfile`, plan entities, etc.)
- Workout and meal data
- Shared utility logic (e.g., BMI helpers)

---

## 3) Runtime Flow (Web)

## Public to private journey
1. User lands on public motivational page (`/`).
2. User signs up / logs in via Supabase Auth.
3. Auth bootstrap hydrates profile and weight entries.
4. User accesses protected routes (`/app`, `/dashboard`, `/meals`, `/workout`, `/feedback`).
5. Route tracking writes usage events to `app_events`.

## Admin journey
1. Admin eligibility is validated server-side using `public.is_admin_user()`.
2. Admin route (`/admin`) is shown only when auth store resolves `isAdmin = true`.
3. Admin can review usage metrics, feedback queue, and manage allowlisted admin emails.

---

## 4) Data Model (Supabase/Postgres)

## Core tables
- `profiles`: user profile and onboarding data.
- `weight_entries`: per-user, per-date weight logs.
- `feedback`: weekly product feedback submissions.
- `app_events`: tracked route views for analytics.
- `admin_emails`: DB-backed admin allowlist (new).

## Key constraints
- `weight_entries` has unique `(user_id, date)`.
- `feedback.rating` constrained to `1..5`.
- `admin_emails.email` is primary key.

---

## 5) Auth and Access Control

## Authentication
- Supabase email/password authentication.
- Session handled by Supabase client and persisted via browser storage/cookies.

## Authorization (RLS)
- RLS enabled on all main tables.
- User-scoped read/write policies for own profile, own weights, own feedback.
- Admin read policies for analytics and cross-user feedback.

## Admin rule now
- Primary admin: `30may1991@gmail.com` (hard bootstrap in `is_admin_user()`).
- Additional admins: stored in `admin_emails` and manageable from Admin Console.

This satisfies:
- “admin tab only for 30may1991@gmail.com” initially.
- “ability to add other admins” through controlled allowlist management.

---

## 6) Security Risk Analysis

## A) RLS / Data Leakage Risks
Risk:
- Misconfigured RLS can expose cross-user data.

Current mitigation:
- RLS enabled on `profiles`, `weight_entries`, `feedback`, `app_events`, `admin_emails`.
- Admin checks centralized via `public.is_admin_user()` (non-recursive).

Recommendations:
- Add CI checks that run policy smoke tests with multiple JWT identities.
- Add an internal “policy test script” for all critical table operations.

## B) DoS / Abuse Risks
Risk:
- Malicious clients can flood `app_events` or `feedback` inserts.
- Credential stuffing attempts on login.

Current mitigation:
- Supabase managed auth protections and edge-level controls.
- RLS limits who can write and where.

Recommended hardening:
- Add rate limiting by user/IP at edge (Netlify function or reverse proxy).
- Add lightweight bot challenge for signup bursts.
- Add write throttling logic for `feedback` (e.g., max N submissions/week/user).
- Add anomaly alerts (spike in `app_events`, failed logins, etc.).

## C) Email Verification Risks
Risk:
- If unverified users are treated as fully trusted, low-friction abuse is possible.

Current state:
- Signup flow can require verification depending on Supabase Auth config.

Recommendations:
- Enforce verified-email requirement for protected app access.
- Consider blocking admin eligibility unless email is verified.
- Avoid using only email string checks for sensitive admin actions in future; evolve to role claims or signed admin grants.

## D) Secret Management Risks
Risk:
- Secret keys accidentally leaked into client code.

Rule:
- Only publishable key belongs in frontend env.
- Secret key must never be in `apps/web` runtime bundle.

Operational recommendation:
- Rotate any leaked secret key immediately.
- Use separate keys per environment (dev/staging/prod).

---

## 7) Supabase/Postgres Cost & When to Pay

Pricing changes over time, so always verify current Supabase pricing page. Use this practical trigger model:

## Stay on free tier while
- DAU is low and test usage is light.
- DB size and bandwidth remain comfortably below free limits.
- No uptime/SLA obligations for paying customers.

## Move to paid plan when any one happens
- Auth MAU approaches free cap.
- Postgres storage or egress approaches ~70-80% of included quota consistently.
- You need predictable performance (larger compute, lower latency, fewer cold performance spikes).
- You need production-grade reliability/SLA for revenue users.

## Main cost drivers to watch
- High write volume in `app_events`.
- Large historical `weight_entries` growth per user over time.
- Frequent admin analytics reads over large windows.

## Cost control checklist
- Add retention strategy for analytics events (e.g., 90/180 day archive).
- Pre-aggregate admin metrics daily to reduce expensive repeated scans.
- Use selective indexes and avoid over-fetching in admin queries.

---

## 8) Core Features Already Implemented

- Public motivational landing page with signup/login.
- Protected app routes after login.
- Profile onboarding and editing.
- Workout and meal plan navigation.
- Weight tracking and charting.
- Weight entry deletion (accidental entry recovery).
- Feedback submission and weekly review workflow.
- Admin console with usage metrics and reviewed toggle.
- Admin email allowlist management.

---

## 9) Missing Core Features (Current Gaps)

1. Verified-email enforcement gate
- Users should be blocked from protected app access until verified.

2. Robust rate limiting and abuse controls
- Needed for signup/login and write-heavy endpoints.

3. Better observability
- No full error monitoring, audit trail dashboard, or automated abuse alerts.

4. Data lifecycle management
- No retention/archival policy for analytics data yet.

5. Enterprise-grade admin authorization
- Current model is email allowlist-driven; future should use explicit role model with immutable audit logs.

6. User self-service account controls
- No account deletion flow and no export of personal data yet.

7. Billing and subscription foundation
- Revenue architecture is not implemented yet.

---

## 10) Implementation Plan for Missing Features

## Phase 1 (Security + Reliability, 1-2 weeks)
- Enforce verified email before entering protected routes.
- Add write throttles for feedback and event tracking.
- Add logging/monitoring (frontend errors + backend operation visibility).

## Phase 2 (Scale + Cost Control, 1-2 weeks)
- Add analytics retention and archival jobs.
- Add pre-aggregated admin metrics table/materialization.
- Add dashboard for quota/cost indicators.

## Phase 3 (Trust + Compliance, 2-3 weeks)
- Implement account deletion and user data export.
- Add structured admin audit log table (who changed what, when).
- Add stricter role model with migration from email allowlist.

## Phase 4 (Revenue Foundation, 2-4 weeks)
- Integrate payments/subscriptions.
- Add feature flags by plan tier.
- Add billing-aware UX and cancellation/reactivation flows.

---

## 11) Future Revenue Model Ideas

1. Freemium + Pro
- Free basic plans, Pro unlocks advanced analytics, richer plans, and longer history.

2. Coach / Trainer tier
- Multi-client dashboards, progress monitoring, shared plan templates.

3. Nutrition premium pack
- Deeper meal personalization, allergies, regional premium packs.

4. Team / Workplace wellness plan
- Organization dashboards and anonymized health trend analytics.

5. Add-on marketplace
- Premium workout blocks, challenge packs, specialized goal tracks.

---

## 12) Operational Runbook (Short)

## Add a new admin
- Go to `Admin Console` → `Admin Access`.
- Enter email and click `Add`.
- User gets admin privileges after next auth refresh/session update.

## Remove a secondary admin
- In `Admin Access`, click `Remove` for that email.
- Primary bootstrap admin remains protected.

## If admin tab is missing unexpectedly
- Confirm user email is in `admin_emails` or is bootstrap email.
- Confirm `is_admin_user()` function exists and returns `true` for current JWT.
- Re-login to refresh session claims.

---

## 13) Naming and Branding Status

- “v1” and “ad free forever” copy removed from in-app branding text.
- Product name is now presented as `FitIn` in UI labels.

---

## 14) Next Recommended Actions

1. Add verified-email route gate.
2. Add event/feedback rate limiting.
3. Add retention job for `app_events`.
4. Introduce structured role table and admin audit logs.
5. Add monetization-ready billing foundation.

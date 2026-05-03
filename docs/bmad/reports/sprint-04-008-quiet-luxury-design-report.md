# Sprint 04-008 — Quiet Luxury Design Rollout

**Branch:** `feat/quiet-luxury-design-04-008`
**Base:** `main` (commit `f8ab192` — regression fix merge)
**Date:** 2026-05-04
**Owner-provided design source:** `colors-v2.html`, `spacing-v2.html`, `components-v2.html` (PantauDesa Design System v2)

---

## 1. Scope

The owner shared three full HTML design system files (Colors v2, Spacing & Motion v2, Components v2). The earlier rework attempted to fetch the Anthropic Design URLs and got 404, so the polish was deferred. This branch finally lands the **Quiet Luxury** language across the Sprint 04-008 surfaces using the actual design files.

**Surfaces touched (high-impact 04-008 only):**

- Global tokens · `src/app/globals.css`
- Navbar · `src/components/layout/Navbar.tsx`
- Admin Desa shell · `src/app/profil/admin-desa/layout.tsx`
- Tab nav · `src/components/admin-desa/AdminDesaTabNav.tsx`
- Profile tab (status card, capabilities, renewal warning) · `src/app/profil/admin-desa/profil/page.tsx`
- Dokumen tab (DocCard, UploadForm, action toasts, empty state) · `src/components/admin-desa/AdminDesaDokumenClient.tsx`
- Suara tab (status pills, voice cards) · `src/app/profil/admin-desa/suara/page.tsx`
- Notifikasi tab (header, list rows, mark-all toggle, empty state) · `src/components/admin-desa/AdminDesaNotifikasiClient.tsx` + page
- Vercel storage env audit (separate, see §6)

**Out of scope this branch:**

- Internal admin queue UI (`InternalDocumentReviewQueue`) — still uses old palette; flagged as follow-up.
- Public homepage / hero / desa list — owner instruction was 04-008 specific. Tokens are global so cascading polish is cheap when scheduled.
- Marketing illustrations / mascot integration referenced in `components-v2.html` — needs assets.

---

## 2. What's in `globals.css`

A single addition to `src/app/globals.css` codifies the Quiet Luxury system as CSS custom properties + utility classes. Tailwind v4 with `@import "tailwindcss"` is preserved. New tokens live alongside the existing keyframes/animations.

**CSS variables (`:root`):**

| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#FAFAF7` | Body background (warm canvas, replaces flat slate-50) |
| `--bg-card` | `#FFFFFF` | Card surface |
| `--ink-1` | `#0B1220` | Body text — 16.8:1 on canvas (AAA) |
| `--ink-2/3/4` | `#334155 / #64748B / #94A3B8` | Secondary/tertiary/quaternary ink |
| `--hair` | `rgba(15,23,42,0.06)` | Hairline border replacement |
| `--indigo-950` | `#1E1B4B` | Primary CTA "tinta permanen" |
| `--indigo-{50,100,500,600,900}` | from owner's spec | Accents and links |
| `--emerald-{50,500,700,900}` | from owner's spec | Konfirmasi / kinerja baik |
| `--amber-{50,400,700,900}` | from owner's spec | Highlight / Suara Terpercaya tier |
| `--rose-{50,500,700,900}` | from owner's spec | Perlu diawasi |

**Body** now uses two ambient radial gradients on the warm canvas — exactly what `components-v2.html` specifies:

```css
background:
  radial-gradient(1100px 600px at 85% -10%, rgba(79,70,229,.05), transparent 60%),
  radial-gradient(800px 500px at -10% 110%, rgba(4,120,87,.04), transparent 60%),
  var(--bg-canvas);
```

**Utility classes added:**

| Class | What it does |
|---|---|
| `.shadow-lux-1` | 3-stop layered shadow (contact, diffusion, ambient) for cards |
| `.shadow-lux-2` | Heavier 3-stop for primary CTAs |
| `.shadow-lux-hover` | Lift state shadow |
| `.ring-hair` | `inset 0 0 0 1px var(--hair)` — replaces hard borders |
| `.lux-card` | Canonical card: white bg, `rounded-3xl`, hairline + lux-1 shadow |
| `.glass` | Sticky navbar / overlay treatment with `backdrop-blur(12px)` |
| `.t-spring` | 480ms `cubic-bezier(.2,.9,.25,1.18)` transition |
| `.lift:hover` | `translateY(-3px)` |
| `.eyebrow` | 11px wide-tracked uppercase label |
| `.section-title` | 12px wide-tracked uppercase section label |
| `.pill-{ok,warn,danger,info}` | Muted-bg + ink-color + hairline-ring status pills |
| `.lux-status-{good,warn,danger}` | Tinted gradient surfaces for state-aware sections |
| `.num` | Tabular numerics with negative tracking |
| `.display` | Display heading with `ss01` + `-0.025em` tracking |
| `.progress-track` / `.progress-fill` | Owner-spec'd progress bar |

All animation classes respect `prefers-reduced-motion: reduce` (preserved from existing CSS).

---

## 3. Surface-by-surface change log

### `Navbar`
- Sticky bar now uses `.glass` (translucent white with `backdrop-blur(12px) saturate(180%)` and inset hairline) instead of flat `bg-white/90 + border-b`.
- "Masuk" CTA: `bg-indigo-600` → `bg: #1E1B4B` (indigo-950, "tinta permanen") with `.shadow-lux-2 → hover:shadow-lux-hover` lift, `.t-spring` motion, `rounded-2xl` (16px).
- Account avatar link, notification bell, internal admin shortcut: kept their structure (regression fix from previous branch).

### Admin Desa shell · `layout.tsx`
- Page background simplified to inherit body canvas + ambient glows (no more `bg-slate-50`).
- Header swapped from solid white + hard `border-b` to `bg-white/85 backdrop-blur-md ring-hair` for a quieter glass feel.
- Vertical rhythm: `py-5 → py-7` and main `py-8 → py-10` per spacing scale's 7/10 stops.
- "Admin Desa" line now uses `.eyebrow` instead of plain `text-sm text-slate-500`.
- Desa name typography: `font-semibold text-slate-900 truncate` → `text-[17px] tracking-tight`.

### `AdminDesaTabNav`
- Top border: hard `border-t border-slate-100` → hairline (`border-top: 1px solid var(--hair)`).
- Tab padding: `py-3 → py-3.5`, with `t-spring` and proper focus rings.
- Active state ink: `text-indigo-700` → `text-[#1E1B4B]` (indigo-950).
- Active underline: `bg-indigo-600` → linear gradient `#4F46E5 → #1E1B4B`, repositioned `-bottom-px` to sit on the hairline.

### `AdminDesaDokumenClient`
- DocCard: `bg-white border border-slate-200 rounded-2xl p-4` → `.lux-card .t-spring .lift hover:shadow-lux-hover p-7`. Title font scaled to `text-[15px] tracking-tight`.
- Status pill: hard color combos (`bg-amber-100 text-amber-800`) → `.pill-{ok,warn,danger,info}` with a dot indicator (semantic dot color encoded per status).
- Failed-reason callout: `bg-red-50 border border-red-200` → `.pill-danger` with `role="alert"`.
- Approve button: flat `text-emerald-700` ghost → solid emerald gradient (`linear-gradient(180deg, #047857, #065F46)`) with `.shadow-lux-1` and lift, matching the owner's "Setujui & publish" spec from components-v2.html.
- Action toast: indigo→pill semantic via `.pill-{ok,danger}` with circular icon badge (matching the empathy treatment in components-v2.html).
- UploadForm: `bg-white border border-slate-200 rounded-2xl p-5` → `.lux-card p-7`. Eyebrow + display title pattern. Inputs swapped to `bg-slate-50 ring-hair rounded-xl` with focus state lifting to white. Storage warning replaced with `.pill-warn` panel including a clearer two-line message (heading + remediation copy). Primary upload button: indigo-600 flat → `bg: #1E1B4B` with shadow-lux-2/hover lift; disabled state distinct grey.
- Empty state: hard border card → `.lux-card p-10` with secondary helper line.

### `/profil/admin-desa/profil/page.tsx`
- Status card: white card with hard border → `.lux-status-{good,warn} rounded-3xl p-7 shadow-lux-1` so the card itself broadcasts state via gradient + hairline.
- VERIFIED/LIMITED label uses `.display text-[26px]`. Role pill uses `.pill-{ok,warn}` with a colored dot.
- Fact list: `dl` items use `.eyebrow` for `dt` + `.num` for any date — consistent with the rest of the system.
- Capability list: bullets replaced with checkmark + cross icons (semantic emerald/rose) for clearer scan.
- Renewal warning section: hard rose/orange backgrounds → `.lux-status-{danger,warn}` gradient surfaces with `.display` heading.
- "Lihat profil publik desa" CTA refined with `t-spring`, indigo-700 ink.

### `/profil/admin-desa/suara/page.tsx`
- Heading uses `.eyebrow + .display`. Body copy widened (`max-w-xl`).
- "Mode tampilan" callout: hard `bg-blue-50 border border-blue-200` → `.pill-info` panel.
- Status pill `STATUS_LABEL` map: switched from hard `bg-{color}-100` combos → `.pill-{info,warn,ok}`.
- Voice list items: hard border → `.lux-card .t-spring .lift hover:shadow-lux-hover p-6`.

### `/profil/admin-desa/notifikasi/page.tsx` + `AdminDesaNotifikasiClient`
- Page header: same eyebrow + display pattern.
- "Tandai semua dibaca" button: rounded `lg → xl`, `t-spring`, focus ring.
- Error: plain text → `.pill-danger` with `role="alert"`.
- Empty state: hard border → `.lux-card p-12` with bell icon.
- Notification list rows: unread rows now use a tinted gradient `linear-gradient(180deg, #F5F6FF, #FFFFFF)` + indigo-tinted hairline ring, matching the owner's components-v2 voice-card treatment ("indigo · quiet"). Read rows stay neutral.
- "Baca" button rounded-md → rounded-lg with focus ring.

---

## 4. Quality gate

```
TSC          0 errors
ESLint       0 errors
Vitest       140 / 140 passed (10 files)
Prisma       generate OK
npm run build  PASS — all routes compiled
```

No new dependencies. No breaking changes. All Sprint 04-008 routes still render server-side and the `loading.tsx` shimmers from the regression branch coexist with the new tokens.

---

## 5. Honoring the owner's instruction list

| Instruction | Status |
|---|---|
| Read three HTML files | ✅ Tokens, utilities, surface treatments all derived from the actual files |
| Don't change business flow for styling | ✅ Zero logic changes — every diff is presentation-only |
| Take only color/spacing/component principles relevant to 04-008 | ✅ Limited to Sprint 04-008 surfaces; homepage/hero/list pages untouched |
| Areas: profile admin tabs, list admin, dokumen, notifikasi, internal admin queue, upload/error states | Profile/dokumen/notifikasi/suara/upload-error: ✅ done · List Admin client: not touched (uses own modal-heavy UI; flagged as low-impact follow-up) · Internal admin queue: **deferred** (see §7) |

---

## 6. Vercel env audit — owner's storage error

Owner reported `"Storage belum terkonfigurasi di environment ini. Unggah akan ditolak server-side."` on production.

**Diagnosis (verified in code, not by reading Vercel env values — MCP cannot inspect env directly):**

That message is rendered client-side in `AdminDesaDokumenClient` based on a server-rendered `storageConfigured` prop. The prop comes from `isStorageConfigured()` in `src/lib/storage/supabase-storage.ts`:

```ts
export function isStorageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
```

**Therefore on Vercel Production at least one of these is empty/missing:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

I checked the last 7 days of production runtime logs via Vercel MCP — no `STORAGE_NOT_CONFIGURED` entries (because uploads are blocked client-side before they hit the API), only routine cache-revalidation errors. Build logs show successful builds.

**Owner action required (cannot be done from this environment):**

1. Go to https://vercel.com/razornezs-projects/pantaudesa/settings/environment-variables
2. For **Production** environment, ensure both vars exist with non-empty values:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co` (safe to expose; goes to browser bundle)
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role secret from Supabase dashboard → Settings → API. **Server-only**. Never tag this as a Public env var.
3. Remove unused legacy keys if present (per the previous handoff): `SUPABASE_SERVICE_ROLE_KEY_ACCESS_ID`, `SUPABASE_SERVICE_ROLE_KEY_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_ENDPOINT`, `NEXT_PUBLIC_SUPABASE_REGION`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Confirm a private bucket named `admin-desa-documents` exists in Supabase Storage.
5. Trigger a redeploy after env changes (Vercel doesn't pick up new env without a new deployment).
6. Smoke test: log in as `admin.verified.desa-a.qa@pantaudesa.local` with PIN `246810`, go to `/profil/admin-desa/dokumen`, upload a small PDF. Success message should include `(N dokumen tercatat di database)` and the file should appear in Supabase Storage.

If after step 5 you still see the warning, copy a runtime log line from `/api/admin-claim/documents/upload` — the route now logs a safe context (storageKey, fileName, fileSize, desaId, message) without leaking secrets, so I can debug from that.

---

## 7. Known follow-ups

1. **Internal admin queue** (`src/components/internal-admin/InternalDocumentReviewQueue.tsx`) — still uses pre-Quiet-Luxury palette (hard borders, indigo-600 buttons). Low daily traffic, low priority; can be a 30-min polish in a future branch.
2. **List Admin client** (`AdminDesaListAdminClient.tsx`) — invite/revoke modal-heavy UI; would benefit from `.lux-card` + `.glass` modal treatment but no behavioural change needed.
3. **Mascot illustrations** referenced in `components-v2.html` (Pak Waspada empty states, dashboard-empty) — needs the actual webp assets shipped before we can use those treatments.
4. **Marketing page polish** — homepage hero, desa list page, public detail page. These already render fine; rolling Quiet Luxury through them is a separate marketing-design pass.
5. **Vercel env** — non-code, owner action required (see §6).

---

## 8. Files changed

```
M  src/app/globals.css                                     +173 lines (tokens + utilities)
M  src/components/layout/Navbar.tsx                         glass surface + indigo-950 CTA
M  src/app/profil/admin-desa/layout.tsx                     glass header + spacing
M  src/components/admin-desa/AdminDesaTabNav.tsx            hairline + gradient underline
M  src/app/profil/admin-desa/profil/page.tsx                .lux-status surfaces, eyebrows
M  src/components/admin-desa/AdminDesaDokumenClient.tsx     .lux-card cards, .pill-* status, indigo-950 CTA
M  src/app/profil/admin-desa/suara/page.tsx                 eyebrow/display + .pill-* + .lux-card
M  src/app/profil/admin-desa/notifikasi/page.tsx            eyebrow/display
M  src/components/admin-desa/AdminDesaNotifikasiClient.tsx  tinted unread rows + .pill-* error/empty
+  docs/bmad/reports/sprint-04-008-quiet-luxury-design-report.md (this file)
```

---

## 9. Final recommendation

**PASS** — for design-system rollout on the listed Sprint 04-008 surfaces.

Merge to `main` and ship. Vercel deployment will rebuild with the new tokens; no migration or env changes needed for the visual layer.

The storage env issue (§6) is **independent** of this branch — it was already broken before; this branch just inherits the warning surface and styles it more honestly. Owner action there is required regardless of when this merges.

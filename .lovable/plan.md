## HireSmart Scaffold Plan

Adapt the spec to this project's TanStack Start + Vite + Tailwind v4 + shadcn/ui stack. No Next.js. DM Sans everywhere. Detail-page tabs deferred — every route gets a single "Under construction" placeholder.

---

### 1. Design system (white-label tokens)

Update `src/styles.css`:
- Add `@import` for DM Sans (Google Fonts) at the top.
- Define the 9 HireSmart brand CSS variables on `:root` (`--brand-primary`, `--brand-accent`, `--brand-mint`, `--brand-seafoam`, `--brand-pink`, `--brand-magenta`, `--brand-bg`, `--brand-text`, `--brand-text-secondary`) — converted to `oklch()` per the template's color rules, with hex preserved in a comment so tenants can swap easily.
- Define the 6 semantic status colors (`--status-success`, `--status-warning`, `--status-danger`, `--status-neutral`, `--status-info`, `--status-ai`) the same way.
- Wire them into the existing `@theme inline` block so Tailwind utilities like `bg-brand-primary`, `text-brand-magenta`, `bg-status-success` work everywhere.
- Override the shadcn semantic tokens (`--background`, `--primary`, `--foreground`, etc.) to map onto the brand palette so existing shadcn components inherit the brand automatically.
- Set `body { font-family: 'DM Sans', system-ui, sans-serif; }` and add font-size utility defaults matching the typography scale.
- No dark-mode overrides for v1 (light mode only).

### 2. App layout shell

- `src/routes/__root.tsx` — keep current shell; just ensure `<Outlet />`, providers, and head metadata stay intact.
- Create a pathless layout `src/routes/_app.tsx` that renders the sidebar + topbar frame around `<Outlet />`. All authenticated routes move under `_app/`.
- `src/components/layout/AppSidebar.tsx` — 240px sidebar, collapsible to 64px icon mode, built on shadcn `Sidebar` primitives. HireSmart wordmark, 8 nav items with Lucide icons (Dashboard, Projects, Candidates, Clients, Outreach, Inbox, Analytics, Settings) + bottom user block. Active state: `bg-brand-mint/20`, 2px left border in `--brand-primary`. Inbox item shows an unread-count badge.
- `src/components/layout/AppTopbar.tsx` — 56px bar with breadcrumb (derived from `useRouterState` pathname), search icon button, notification bell with dot, and user avatar dropdown.
- Mobile: sidebar collapses to overlay via shadcn `Sheet` triggered by hamburger.

### 3. Shared components (`src/components/shared/`)

All ten, built on shadcn primitives, exported from an `index.ts` barrel:
1. `StatusBadge` — pill with semantic-status color mapping.
2. `ScoreRing` — SVG ring, color thresholds (red <50, amber 50–74, green ≥75), sizes sm/md/lg.
3. `AIVerdictChip` — verdict pill, optionally expandable to strengths/gaps/concerns tags.
4. `DataTable` — wraps shadcn `Table`: sortable headers, optional select column + bulk-action bar, sticky header, alternating rows, hover state, pagination footer, empty-state slot.
5. `PageHeader` — title (24/600), optional subtitle, right-aligned actions slot, 24px bottom margin.
6. `StatCard` — icon-in-tinted-circle, label, large value, optional trend indicator, `rounded-xl` white card with hairline border.
7. `EmptyState` — Lucide icon (48px, muted) + title + description + optional action button. No illustrations.
8. `FilterBar` — search input + filter dropdowns + view toggle (table/kanban/grid) using shadcn `Input`, `Select`, `ToggleGroup`.
9. `KanbanColumn` — header with title, count badge, colored 4px top border; scrollable card area.
10. `SidePanel` — wraps shadcn `Sheet`, right-side slide-over, widths md (480) / lg (640).

### 4. Mock data (`src/lib/mock-data.ts`)

All TypeScript types from the prompt (`UserRole`, `ProjectStatus`, `CandidateSource`, `SeniorityLevel`, `CampaignStatus`, `InboxClassification`, `PipelineStage`) plus entity interfaces. Realistic SEA executive-search data: 5 clients (Indorama Ventures, OYO Hotels, KNS Group, Oasis Water, Stylo International), 8 projects, 15 candidates (mixed Indonesian/Indian/Australian/Singaporean names), 3 campaigns, 10 inbox messages, 20 pipeline entries.

### 5. Routing (TanStack Start flat-file convention)

Public routes (no shell):
- `src/routes/index.tsx` — redirects to `/dashboard` via `<Navigate />`.
- `src/routes/login.tsx`, `src/routes/signup.tsx` — placeholder pages.
- `src/routes/jobs.tsx`, `src/routes/jobs.$id.tsx` — candidate jobs portal (own minimal header).
- `src/routes/hire.$token.tsx` — employer portal.

Authenticated routes under the `_app` layout (sidebar + topbar):
- `_app/dashboard.tsx`
- `_app/projects.tsx`, `_app/projects.$id.tsx`, `_app/projects.$id.parse.tsx`
- `_app/candidates.tsx`, `_app/candidates.$id.tsx`
- `_app/clients.tsx`, `_app/clients.$id.tsx`
- `_app/outreach.tsx`, `_app/outreach.new.tsx`, `_app/outreach.$id.tsx`
- `_app/inbox.tsx`
- `_app/analytics.tsx`
- `_app/settings.tsx`

Each authenticated route renders `<PageHeader>` with the correct title/subtitle + `<EmptyState icon={Hammer} title="Under construction" …/>`. Each route also sets its own `head()` metadata (title + description).

### 6. Quality bar / what's intentionally omitted

- Generous spacing, hairline borders (no drop shadows), brand colors visibly applied to nav active state + status badges.
- No purple gradients, no cartoon empty-state art, no Lorem ipsum.
- No Lovable Cloud / Supabase / auth wiring yet — `/login` and `/signup` are visual placeholders, route guards deferred.
- No dark mode, no real API calls.

---

### Technical notes

- TanStack Start uses flat dot-separated route files (`projects.$id.parse.tsx`), not folder nesting. `routeTree.gen.ts` is auto-generated — never hand-edited.
- The `_app.tsx` pathless layout file gives every child route the sidebar+topbar without adding `/app` to URLs.
- shadcn `Sidebar`, `Sheet`, `Table`, `Select`, `Input`, `ToggleGroup`, `DropdownMenu`, `Avatar`, `Badge`, `Button`, `Tabs` are already available via `src/components/ui/*`; we'll add any missing ones with the shadcn CLI if needed.
- Tailwind v4 reads tokens from `@theme inline` in `src/styles.css` — no `tailwind.config.ts` edits needed for the brand color utilities.
- Brand hex → oklch conversion preserves the exact visual hex in a CSS comment so tenants can swap by replacing 9 variables.

After approval I'll build it in one pass: tokens → shell → shared components → mock data → routes.

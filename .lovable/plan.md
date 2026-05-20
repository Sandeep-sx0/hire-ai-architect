# Module 3B — Jobs (Position Management)

Introduce a `Job` entity between `Project` and downstream (campaigns, matching, pipeline, applications). Frontend-only with mock data.

## 1. Mock data (`src/lib/mock-data.ts`)

Add types and seed data:
- `JobStatus = 'draft' | 'open' | 'sourcing' | 'shortlisted' | 'interviewing' | 'offer' | 'placed' | 'closed' | 'on_hold'`
- `SeniorityLevel` (extend if needed: c_suite, vp, director, senior_manager, manager, senior, mid, junior)
- `WorkModel = 'onsite' | 'hybrid' | 'remote'`
- `Job` interface: id, projectId, jobTitle, jobCode, seniorityLevel, department, location, workModel, status, headcount, positionsFilled, skillsRequired[], skillsNiceToHave[], experienceMin/Max, education, salaryMin/Max/Currency, responsibilities[], languageRequirements[], rawJdText, assignedTo, createdAt, candidatesCount, inPipeline, activeCampaigns, responseRate, daysOpen, avgMatchScore, isPublished
- Seed: ~8 jobs across 3-4 existing projects. For Indorama project: CFO, VP Operations, Head of Supply Chain, Regional Director APAC, Senior Manager Corporate Finance. Realistic data.
- Add `projectId → jobs[]` helper.

Don't remove existing project fields (would break too much). Just add jobs alongside.

## 2. New routes

```
src/routes/_app/jobs.$id.tsx            — Job detail (tabbed: Brief, Candidates, Matching, Pipeline, Outreach, Activity)
src/routes/_app/jobs.new.tsx            — Job creation wizard (4 steps)
src/routes/_app/jobs.$id.parse.tsx      — JD parsing review (standalone)
```

Reuse `/projects/$id` tab "Jobs" for the job-list-within-project (Prompt #1) — added as a new tab.

## 3. Project Detail update (`src/routes/_app/projects.$id.tsx`)

Add a "Jobs" tab (make it default). Renders table view of jobs for this project with columns from Prompt #1: title+code, seniority, location, status, headcount progress, candidates, campaigns, days open, assigned. "Add Job" button → `/jobs/new?projectId=...`. Click row → `/jobs/$id`. Skip kanban view for v1 (toggle present but disabled with tooltip "coming soon") to keep scope reasonable. Filter/sort dropdowns wired client-side.

## 4. Job Detail (`/jobs/$id`) — Prompt #3

Sticky header: breadcrumb, title, seniority/location/work-model/headcount badges, status, action buttons (Edit, Run Matching, Launch Campaign, dropdown). Stat bar: Candidates, In Pipeline, Active Campaigns, Response Rate, Days Open.

6 tabs:
- **Brief** (default): two-column — structured fields left, raw JD right
- **Candidates**: reuse DataTable with candidates linked to job (filter mock candidates by jobId)
- **Matching**: "Run Matching" CTA, then reuse `MatchResults` component
- **Pipeline**: reuse `PipelineKanban` component scoped to job
- **Outreach**: campaigns filtered by jobId, with launch CTA
- **Activity**: chronological mock feed

## 5. Job Creation Wizard (`/jobs/new`) — Prompt #2

4 steps in a single page with step indicator:
1. Project & basics (project dropdown prefilled from `?projectId=`, title, dept, headcount, assignee)
2. JD Input: 3 tabs (Paste / Upload / Manual). "Parse with AI" simulates 2s loading → step 3
3. AI Review: side-by-side raw JD ↔ editable extracted fields (reuse field set). Pre-fill with CFO mock data
4. Confirm & create: summary + two checkboxes → toast → navigate to `/jobs/$id`

## 6. JD Parsing Review (`/jobs/$id/parse`) — Prompt #4

Standalone two-column page. Left: raw JD. Right: editable extracted fields with confidence dots (green/amber/red). Sticky bottom bar: Re-parse / Discard / Approve & Create. Staggered fade-in animation on load.

## 7. Campaign Builder update (`/outreach/new`) — Prompt #5

Currently 4 steps; add job selector to Step 1:
- Project dropdown → reveals job cards (radio-select)
- Each card: title, seniority, location, status, shortlisted count, warning if 0
- "Next" disabled until both selected
- Step 2 candidate list filtered to job

## 8. Navigation

Add sidebar nav item "Jobs" (optional — could also just be nested under projects). Decision: keep it nested only (access via project detail) to avoid sidebar bloat; Job Detail still has its own URL.

## Notes / scope cuts

- No drag-and-drop kanban for jobs (table view only for v1)
- No real AI; all "parse" actions are 2s simulated delays with hard-coded mock extraction
- Existing project fields stay; jobs are additive
- Activity feed is static mock
- Confidence indicators are hardcoded per field

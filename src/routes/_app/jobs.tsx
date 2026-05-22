import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import {
  Plus,
  SearchX,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  List,
  LayoutGrid,
} from "lucide-react";
import { PageHeader, StatusBadge, EmptyState, KanbanColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  jobs as allJobs,
  projects as allProjects,
  clients as allClients,
  type Job,
  type JobStatus,
  type JobSeniority,
  type WorkModel,
} from "@/lib/mock-data";

// === Search params ============================================
const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "all").default("all"),
  client: fallback(z.string(), "all").default("all"),
  seniority: fallback(z.string(), "all").default("all"),
  work: fallback(z.string(), "all").default("all"),
  assigned: fallback(z.string(), "all").default("all"),
  view: fallback(z.enum(["table", "kanban"]), "table").default("table"),
  sort: fallback(z.string(), "days").default("days"),
  dir: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
});

export const Route = createFileRoute("/_app/jobs")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Jobs — HireSmart" },
      { name: "description", content: "All open positions across every project." },
    ],
  }),
  component: JobsPage,
});

// === Labels ===================================================
const seniorityLabel: Record<JobSeniority, string> = {
  c_suite: "C-Suite",
  vp: "VP",
  director: "Director",
  senior_manager: "Senior Manager",
  manager: "Manager",
  senior: "Senior",
  mid: "Mid",
  junior: "Junior",
};

const workModelLabel: Record<WorkModel, string> = {
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
};

const statusOptions: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "sourcing", label: "Sourcing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "placed", label: "Placed" },
  { value: "closed", label: "Closed" },
  { value: "on_hold", label: "On hold" },
];

const seniorityOptions: { value: JobSeniority | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "c_suite", label: "C-Suite" },
  { value: "vp", label: "VP" },
  { value: "director", label: "Director" },
  { value: "senior_manager", label: "Senior Manager" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "mid", label: "Mid" },
  { value: "junior", label: "Junior" },
];

const workModelOptions: { value: WorkModel | "all"; label: string }[] = [
  { value: "all", label: "All work models" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const kanbanFlow: { status: JobStatus; label: string; color: string }[] = [
  { status: "draft", label: "Draft", color: "#9CA3AF" },
  { status: "open", label: "Open", color: "#F59E0B" },
  { status: "sourcing", label: "Sourcing", color: "#F59E0B" },
  { status: "shortlisted", label: "Shortlisted", color: "#8B5CF6" },
  { status: "interviewing", label: "Interviewing", color: "#3B82F6" },
  { status: "offer", label: "Offer", color: "#3B82F6" },
  { status: "placed", label: "Placed", color: "#10B981" },
];

const allAssignees = Array.from(new Set(allJobs.map((j) => j.assignedTo))).sort();

function projectFor(job: Job) {
  return allProjects.find((p) => p.id === job.projectId);
}

function JobsPage() {
  const navigate = useNavigate({ from: "/jobs" });
  const search = Route.useSearch();
  const { q, status, client, seniority, work, assigned, view, sort, dir } = search;

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const update = (patch: Partial<typeof search>) => {
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allJobs.filter((j) => {
      const proj = projectFor(j);
      if (status !== "all" && j.status !== status) return false;
      if (client !== "all" && proj?.clientId !== client) return false;
      if (seniority !== "all" && j.seniorityLevel !== seniority) return false;
      if (work !== "all" && j.workModel !== work) return false;
      if (assigned !== "all" && j.assignedTo !== assigned) return false;
      if (needle) {
        const hay = `${j.jobTitle} ${j.jobCode} ${proj?.clientName ?? ""} ${proj?.title ?? ""} ${j.skillsRequired.join(" ")}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, status, client, seniority, work, assigned]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    const mult = dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sort) {
        case "title": av = a.jobTitle; bv = b.jobTitle; break;
        case "status": av = a.status; bv = b.status; break;
        case "candidates": av = a.candidatesCount; bv = b.candidatesCount; break;
        case "days":
        default:
          av = a.daysOpen; bv = b.daysOpen; break;
      }
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * mult;
    });
    return copy;
  }, [filtered, sort, dir]);

  const activeCount = allJobs.filter(
    (j) => j.status !== "closed" && j.status !== "on_hold" && j.status !== "placed",
  ).length;

  const filtersActive =
    q !== "" || status !== "all" || client !== "all" ||
    seniority !== "all" || work !== "all" || assigned !== "all";

  const activeFilterCount =
    (status !== "all" ? 1 : 0) + (client !== "all" ? 1 : 0) +
    (seniority !== "all" ? 1 : 0) + (work !== "all" ? 1 : 0) +
    (assigned !== "all" ? 1 : 0);

  const clearFilters = () => {
    update({ q: "", status: "all", client: "all", seniority: "all", work: "all", assigned: "all" });
  };

  const toggleSort = (key: string) => {
    if (sort === key) update({ dir: dir === "asc" ? "desc" : "asc" });
    else update({ sort: key, dir: "asc" });
  };

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle={`${activeCount} active position${activeCount === 1 ? "" : "s"}`}
        actions={
          <Button
            onClick={() => navigate({ to: "/jobs/new" })}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Job
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <div className="relative w-[320px] max-w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <Input
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search by title, client, project, or skills..."
            className="h-9 rounded-lg pl-9"
          />
        </div>

        <FilterSelect value={status} onChange={(v) => update({ status: v })} options={statusOptions} defaultLabel="All statuses" />
        <FilterSelect
          value={client}
          onChange={(v) => update({ client: v })}
          options={[{ value: "all", label: "All clients" }, ...allClients.map((c) => ({ value: c.id, label: c.name }))]}
          defaultLabel="All clients"
        />
        <FilterSelect value={seniority} onChange={(v) => update({ seniority: v })} options={seniorityOptions} defaultLabel="All levels" />
        <FilterSelect value={work} onChange={(v) => update({ work: v })} options={workModelOptions} defaultLabel="All work models" />
        <FilterSelect
          value={assigned}
          onChange={(v) => update({ assigned: v })}
          options={[{ value: "all", label: "All recruiters" }, ...allAssignees.map((o) => ({ value: o, label: o }))]}
          defaultLabel="All recruiters"
        />

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-brand-primary hover:underline"
          >
            Clear all{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        )}

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && update({ view: v as "table" | "kanban" })}
          className="ml-auto"
        >
          <ToggleGroupItem value="table" aria-label="Table view" className="data-[state=on]:bg-brand-primary data-[state=on]:text-white">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view" className="data-[state=on]:bg-brand-primary data-[state=on]:text-white">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-mint bg-brand-seafoam/30 px-4 py-2.5">
          <span className="text-sm font-medium text-brand-primary">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Change status</Button>
            <Button size="sm" variant="outline">Reassign</Button>
            <Button size="sm" variant="outline">Archive</Button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No jobs found"
          description="Try adjusting your search or filters."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : view === "table" ? (
        <TableView
          rows={sorted}
          selected={selected}
          setSelected={setSelected}
          sort={sort}
          dir={dir}
          toggleSort={toggleSort}
        />
      ) : (
        <KanbanView rows={sorted} />
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  defaultLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  defaultLabel: string;
}) {
  const isActive = value !== "all";
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-9 w-auto min-w-[150px] gap-1 rounded-lg text-xs",
          isActive && "border-brand-primary text-brand-primary",
        )}
      >
        <SelectValue placeholder={defaultLabel} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SortHeader({
  label, k, sort, dir, onClick, className,
}: {
  label: string; k: string; sort: string; dir: "asc" | "desc";
  onClick: () => void; className?: string;
}) {
  const active = sort === k;
  return (
    <th className={cn("px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary", className)}>
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-brand-text">
        {label}
        {active ? (
          dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

function daysClass(days: number): string {
  if (days > 60) return "text-status-danger font-medium";
  if (days > 30) return "text-status-warning font-medium";
  return "text-brand-text";
}

function TableView({
  rows, selected, setSelected, sort, dir, toggleSort,
}: {
  rows: Job[];
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  sort: string;
  dir: "asc" | "desc";
  toggleSort: (k: string) => void;
}) {
  const navigate = useNavigate();
  const pageSize = 25;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const end = start + pageRows.length;

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
    else pageRows.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-brand-bg">
            <tr className="border-b border-border">
              <th className="w-10 px-3 py-3 text-left">
                <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} />
              </th>
              <SortHeader label="Job Title" k="title" sort={sort} dir={dir} onClick={() => toggleSort("title")} />
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary w-[130px]">Seniority</th>
              <th className="hidden px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary lg:table-cell">Location</th>
              <SortHeader label="Status" k="status" sort={sort} dir={dir} onClick={() => toggleSort("status")} className="w-[130px]" />
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary w-[150px]">Headcount</th>
              <SortHeader label="Candidates" k="candidates" sort={sort} dir={dir} onClick={() => toggleSort("candidates")} className="w-[110px]" />
              <th className="hidden px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary lg:table-cell w-[110px]">Campaigns</th>
              <SortHeader label="Days Open" k="days" sort={sort} dir={dir} onClick={() => toggleSort("days")} className="w-[110px]" />
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary w-[150px]">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((j, idx) => {
              const proj = projectFor(j);
              const fillPct = j.headcount > 0 ? (j.positionsFilled / j.headcount) * 100 : 0;
              return (
                <tr
                  key={j.id}
                  onClick={() => navigate({ to: "/jobs/$id", params: { id: j.id } })}
                  className={cn(
                    "group h-[68px] cursor-pointer border-b border-border transition-colors hover:bg-brand-seafoam/10",
                    idx % 2 === 1 && "bg-brand-bg/40",
                  )}
                >
                  <td className="px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(j.id)} onCheckedChange={() => toggleRow(j.id)} />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="text-[14px] font-semibold text-brand-text">{j.jobTitle}</div>
                    <div className="text-[12px] text-brand-text-secondary">{j.jobCode}</div>
                    {proj && (
                      <div className="text-[12px] text-brand-text-secondary">
                        {proj.title} · {proj.clientName}
                      </div>
                    )}
                  </td>
                  <td className="px-3 align-middle">
                    <span className="inline-flex items-center rounded-full bg-brand-seafoam/40 px-2 py-0.5 text-[11px] font-medium text-brand-primary">
                      {seniorityLabel[j.seniorityLevel]}
                    </span>
                  </td>
                  <td className="hidden px-3 align-middle text-sm text-brand-text lg:table-cell">
                    {j.location}
                  </td>
                  <td className="px-3 align-middle">
                    <StatusBadge status={j.status} />
                  </td>
                  <td className="px-3 align-middle">
                    <div className="text-[12px] text-brand-text">{j.positionsFilled} of {j.headcount} filled</div>
                    <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-brand-primary" style={{ width: `${fillPct}%` }} />
                    </div>
                  </td>
                  <td className="px-3 align-middle text-sm tabular-nums">
                    {j.candidatesCount === 0 ? (
                      <span className="text-brand-text-secondary/60">—</span>
                    ) : (
                      <span className="text-brand-text">{j.candidatesCount}</span>
                    )}
                  </td>
                  <td className="hidden px-3 align-middle text-sm lg:table-cell">
                    {j.activeCampaigns > 0 ? (
                      <span className="text-status-success font-medium">{j.activeCampaigns} active</span>
                    ) : (
                      <span className="text-brand-text-secondary/60">—</span>
                    )}
                  </td>
                  <td className={cn("px-3 align-middle text-sm tabular-nums", daysClass(j.daysOpen))}>
                    {j.daysOpen}d
                  </td>
                  <td className="px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary">
                        {j.assignedInitials}
                      </span>
                      <span className="truncate text-sm text-brand-text">{j.assignedTo.split(" ")[0]}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-brand-text-secondary">
        <span>Showing {start + 1}–{end} of {rows.length} job{rows.length === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function KanbanView({ rows }: { rows: Job[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {kanbanFlow.map((col) => {
        const colRows = rows.filter((r) => r.status === col.status);
        return (
          <KanbanColumn
            key={col.status}
            title={col.label}
            count={colRows.length}
            color={col.color}
            className="bg-brand-bg/50"
          >
            {colRows.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-brand-text-secondary/60">No jobs</p>
            ) : (
              colRows.map((j) => {
                const proj = projectFor(j);
                return (
                  <Link
                    key={j.id}
                    to="/jobs/$id"
                    params={{ id: j.id }}
                    className="block rounded-lg border border-gray-100 bg-white p-3 transition-all hover:border-brand-mint hover:shadow-sm"
                  >
                    <div className="text-[13px] font-semibold leading-snug text-brand-text">{j.jobTitle}</div>
                    {proj && (
                      <div className="mt-0.5 text-[11px] text-brand-text-secondary">{proj.clientName}</div>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center rounded-full bg-brand-seafoam/40 px-2 py-0.5 font-medium text-brand-primary">
                        {seniorityLabel[j.seniorityLevel]}
                      </span>
                      <span className="text-brand-text-secondary">{workModelLabel[j.workModel]}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-brand-text-secondary">
                      <span>{j.location}</span>
                      <span className="font-medium text-brand-text">{j.candidatesCount} cand.</span>
                    </div>
                  </Link>
                );
              })
            )}
          </KanbanColumn>
        );
      })}
    </div>
  );
}

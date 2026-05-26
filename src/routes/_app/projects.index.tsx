import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import {
  Briefcase,
  Plus,
  SearchX,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
  List,
  LayoutGrid,
  Columns3,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  projects as allProjects,
  clients as allClients,
  getJobsByProject,
  type Project,
  type ProjectStatus,
  type SeniorityLevel,
  type Job,
} from "@/lib/mock-data";
import { CreateProjectWizard } from "@/components/projects/CreateProjectWizard";

// === Search params ============================================
const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "all").default("all"),
  client: fallback(z.string(), "all").default("all"),
  seniority: fallback(z.string(), "all").default("all"),
  assigned: fallback(z.string(), "all").default("all"),
  view: fallback(z.enum(["table", "kanban", "card"]), "table").default("table"),
  sort: fallback(z.string(), "created").default("created"),
  dir: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
});

export const Route = createFileRoute("/_app/projects/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Projects — Syndie Recruit" },
      {
        name: "description",
        content: "All active and historical search projects.",
      },
    ],
  }),
  component: ProjectsPage,
});

// === Labels & metadata ========================================
const seniorityLabel: Record<SeniorityLevel, string> = {
  c_suite: "C-Suite",
  vp: "VP",
  director: "Director",
  manager: "Manager",
  senior: "Senior",
  mid: "Mid",
  junior: "Junior",
};

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
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

const seniorityOptions: { value: SeniorityLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "c_suite", label: "C-Suite" },
  { value: "vp", label: "VP" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
];

// Kanban column workflow order + colors
const kanbanFlow: { status: ProjectStatus; label: string; color: string }[] = [
  { status: "draft", label: "Draft", color: "#9CA3AF" },
  { status: "open", label: "Open", color: "#F59E0B" },
  { status: "sourcing", label: "Sourcing", color: "#F59E0B" },
  { status: "shortlisted", label: "Shortlisted", color: "#8B5CF6" },
  { status: "interviewing", label: "Interviewing", color: "#3B82F6" },
  { status: "offer", label: "Offer", color: "#3B82F6" },
  { status: "placed", label: "Placed", color: "#10B981" },
];

const closedFlow: { status: ProjectStatus; label: string; color: string }[] = [
  { status: "closed", label: "Closed", color: "#9CA3AF" },
  { status: "on_hold", label: "On hold", color: "#9CA3AF" },
];

// Map mock daysOpen -> relative date for display
function relativeCreated(daysOpen: number): string {
  if (daysOpen <= 0) return "Today";
  if (daysOpen === 1) return "Yesterday";
  if (daysOpen < 7) return `${daysOpen} days ago`;
  if (daysOpen < 14) return "Last week";
  if (daysOpen < 30) return `${Math.floor(daysOpen / 7)} weeks ago`;
  if (daysOpen < 60) return "Last month";
  return `${Math.floor(daysOpen / 30)} months ago`;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function industryOf(clientId: string): string | undefined {
  return allClients.find((c) => c.id === clientId)?.industry;
}

interface JobsSummary {
  count: number;
  open: number;
  active: number;
  filled: number;
  draft: number;
  onHold: number;
  closed: number;
}

function summarizeJobs(jobs: Job[]): JobsSummary {
  const s: JobsSummary = {
    count: jobs.length,
    open: 0,
    active: 0,
    filled: 0,
    draft: 0,
    onHold: 0,
    closed: 0,
  };
  for (const j of jobs) {
    switch (j.status) {
      case "open":
        s.open += 1;
        break;
      case "sourcing":
      case "shortlisted":
      case "interviewing":
      case "offer":
        s.active += 1;
        break;
      case "placed":
        s.filled += 1;
        break;
      case "draft":
        s.draft += 1;
        break;
      case "on_hold":
        s.onHold += 1;
        break;
      case "closed":
        s.closed += 1;
        break;
    }
  }
  return s;
}

function jobMixLabel(s: JobsSummary): string {
  const parts: string[] = [];
  if (s.open) parts.push(`${s.open} open`);
  if (s.active) parts.push(`${s.active} active`);
  if (s.filled) parts.push(`${s.filled} filled`);
  if (s.draft) parts.push(`${s.draft} draft`);
  if (s.onHold) parts.push(`${s.onHold} on hold`);
  if (s.closed && parts.length === 0) parts.push(`${s.closed} closed`);
  return parts.join(" · ");
}

// All recruiters/owners present in mock data
const allOwners = Array.from(new Set(allProjects.map((p) => p.owner))).sort();

// === Page =====================================================
function ProjectsPage() {
  const navigate = useNavigate({ from: "/projects" });
  const search = Route.useSearch();
  const { q, status, client, seniority, assigned, view, sort, dir } = search;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showClosed, setShowClosed] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const update = (patch: Partial<typeof search>) => {
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });
  };

  // Filtering
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allProjects.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (client !== "all" && p.clientId !== client) return false;
      if (seniority !== "all" && p.seniority !== seniority) return false;
      if (assigned !== "all" && p.owner !== assigned) return false;
      if (needle) {
        const hay = `${p.title} ${p.clientName} ${p.location}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, status, client, seniority, assigned]);

  // Sorting
  const sorted = useMemo(() => {
    const copy = [...filtered];
    const mult = dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sort) {
        case "title":
          av = a.title;
          bv = b.title;
          break;
        case "status":
          av = a.status;
          bv = b.status;
          break;
        case "seniority":
          av = a.seniority;
          bv = b.seniority;
          break;
        case "candidates":
          av = a.candidates;
          bv = b.candidates;
          break;
        case "owner":
          av = a.owner;
          bv = b.owner;
          break;
        case "created":
        default:
          // Newer = smaller daysOpen, so "desc" should show newest first
          av = -a.daysOpen;
          bv = -b.daysOpen;
          break;
      }
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * mult;
    });
    return copy;
  }, [filtered, sort, dir]);

  const activeCount = allProjects.filter(
    (p) => p.status !== "closed" && p.status !== "on_hold",
  ).length;

  const filtersActive =
    q !== "" ||
    status !== "all" ||
    client !== "all" ||
    seniority !== "all" ||
    assigned !== "all";

  const activeFilterCount =
    (status !== "all" ? 1 : 0) +
    (client !== "all" ? 1 : 0) +
    (seniority !== "all" ? 1 : 0) +
    (assigned !== "all" ? 1 : 0);

  const clearFilters = () => {
    update({ q: "", status: "all", client: "all", seniority: "all", assigned: "all" });
  };

  const toggleSort = (key: string) => {
    if (sort === key) update({ dir: dir === "asc" ? "desc" : "asc" });
    else update({ sort: key, dir: "asc" });
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${activeCount} active project${activeCount === 1 ? "" : "s"}`}
        actions={
          <Button
            onClick={() => setWizardOpen(true)}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New project
          </Button>
        }
      />
      <CreateProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      {/* Filter & view bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        {/* Search */}
        <div className="relative w-[320px] max-w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <Input
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search projects by title, client, or skills..."
            className="h-9 rounded-lg pl-9"
          />
        </div>

        {/* Filter dropdowns */}
        <FilterSelect
          value={status}
          onChange={(v) => update({ status: v })}
          options={statusOptions.map((o) => ({ value: o.value, label: o.label }))}
          defaultLabel="All statuses"
        />
        <FilterSelect
          value={client}
          onChange={(v) => update({ client: v })}
          options={[
            { value: "all", label: "All clients" },
            ...allClients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          defaultLabel="All clients"
        />
        <FilterSelect
          value={seniority}
          onChange={(v) => update({ seniority: v })}
          options={seniorityOptions.map((o) => ({ value: o.value, label: o.label }))}
          defaultLabel="All levels"
        />
        <FilterSelect
          value={assigned}
          onChange={(v) => update({ assigned: v })}
          options={[
            { value: "all", label: "All recruiters" },
            ...allOwners.map((o) => ({ value: o, label: o })),
          ]}
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

        {/* View toggle */}
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && update({ view: v as "table" | "kanban" | "card" })}
          className="ml-auto"
        >
          <ToggleGroupItem
            value="table"
            aria-label="Table view"
            className="data-[state=on]:bg-brand-primary data-[state=on]:text-white"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="kanban"
            aria-label="Kanban view"
            className="data-[state=on]:bg-brand-primary data-[state=on]:text-white"
          >
            <Columns3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="card"
            aria-label="Card view"
            className="data-[state=on]:bg-brand-primary data-[state=on]:text-white"
          >
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-mint bg-brand-seafoam/30 px-4 py-2.5">
          <span className="text-sm font-medium text-brand-primary">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Change status
            </Button>
            <Button size="sm" variant="outline">
              Reassign
            </Button>
            <Button size="sm" variant="outline">
              Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-status-danger hover:text-status-danger"
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* No-results inline state */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No projects match your filters"
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
      ) : view === "card" ? (
        <CardView rows={sorted} />
      ) : (
        <KanbanView rows={sorted} showClosed={showClosed} setShowClosed={setShowClosed} />
      )}
    </div>
  );
}

// === FilterSelect helper =====================================
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

// === Table View ==============================================
function TableView({
  rows,
  selected,
  setSelected,
  sort,
  dir,
  toggleSort,
}: {
  rows: Project[];
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

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
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

  const goToProject = (id: string) => {
    navigate({ to: "/projects/$id", params: { id } });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-opacity duration-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-brand-bg">
            <tr className="border-b border-border">
              <th className="w-10 px-3 py-3 text-left">
                <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} />
              </th>
              <SortHeader
                label="Project"
                k="title"
                sort={sort}
                dir={dir}
                onClick={() => toggleSort("title")}
              />
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary w-[90px]">
                Jobs
              </th>
              <SortHeader
                label="Status"
                k="status"
                sort={sort}
                dir={dir}
                onClick={() => toggleSort("status")}
                className="w-[130px]"
              />
              <SortHeader
                label="Seniority"
                k="seniority"
                sort={sort}
                dir={dir}
                onClick={() => toggleSort("seniority")}
                className="hidden w-[110px] lg:table-cell"
              />
              <SortHeader
                label="Candidates"
                k="candidates"
                sort={sort}
                dir={dir}
                onClick={() => toggleSort("candidates")}
                className="w-[120px]"
              />
              <SortHeader
                label="Assigned"
                k="owner"
                sort={sort}
                dir={dir}
                onClick={() => toggleSort("owner")}
                className="w-[150px]"
              />
              <SortHeader
                label="Created"
                k="created"
                sort={sort}
                dir={dir}
                onClick={() => toggleSort("created")}
                className="hidden w-[110px] lg:table-cell"
              />
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p, idx) => (
              <tr
                key={p.id}
                onClick={() => goToProject(p.id)}
                className={cn(
                  "group h-[60px] cursor-pointer border-b border-border transition-colors hover:bg-brand-seafoam/10",
                  idx % 2 === 1 && "bg-brand-bg/40",
                )}
              >
                <td
                  className="px-3 align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggleRow(p.id)}
                  />
                </td>
                <td className="px-3 py-2 align-middle">
                  <Link
                    to="/projects/$id"
                    params={{ id: p.id }}
                    onClick={(e) => e.stopPropagation()}
                    className="block text-[14px] font-medium text-brand-text hover:text-brand-primary hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] text-brand-text-secondary">
                      {p.clientName}
                    </span>
                    {industryOf(p.clientId) && (
                      <span className="inline-flex items-center rounded-full bg-brand-bg px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-text-secondary">
                        {industryOf(p.clientId)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 align-middle text-sm" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const jobs = getJobsByProject(p.id);
                    const summary = summarizeJobs(jobs);
                    const mix = jobMixLabel(summary);
                    return (
                      <Link
                        to="/projects/$id"
                        params={{ id: p.id }}
                        search={{ tab: "jobs" } as never}
                        className="block leading-tight"
                      >
                        <span
                          className={cn(
                            "font-medium",
                            summary.count === 0
                              ? "text-brand-text-secondary"
                              : "text-brand-primary hover:underline",
                          )}
                        >
                          {summary.count} {summary.count === 1 ? "job" : "jobs"}
                        </span>
                        {mix && (
                          <div className="mt-0.5 text-[11px] text-brand-text-secondary">
                            {mix}
                          </div>
                        )}
                      </Link>
                    );
                  })()}
                </td>
                <td className="px-3 align-middle">
                  <StatusBadge status={p.status} />
                </td>
                <td className="hidden px-3 align-middle text-sm text-brand-text lg:table-cell">
                  {seniorityLabel[p.seniority]}
                </td>
                <td className="px-3 align-middle text-sm tabular-nums">
                  {p.candidates === 0 ? (
                    <span className="text-brand-text-secondary/60">—</span>
                  ) : (
                    <span className="text-brand-text">
                      {p.candidates} candidates
                    </span>
                  )}
                </td>
                <td className="px-3 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary">
                      {initialsOf(p.owner)}
                    </span>
                    <span className="truncate text-sm text-brand-text">
                      {p.owner.split(" ")[0]}
                    </span>
                  </div>
                </td>
                <td className="hidden px-3 align-middle text-sm text-brand-text-secondary lg:table-cell">
                  {relativeCreated(p.daysOpen)}
                </td>
                <td
                  className="px-3 align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-brand-text-secondary"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-status-danger focus:text-status-danger">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-brand-text-secondary">
        <span>
          Showing {start + 1}–{end} of {rows.length} project
          {rows.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  k,
  sort,
  dir,
  onClick,
  className,
}: {
  label: string;
  k: string;
  sort: string;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  const active = sort === k;
  return (
    <th
      className={cn(
        "px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-brand-text-secondary",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-brand-text"
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

// === Kanban View =============================================
function KanbanView({
  rows,
  showClosed,
  setShowClosed,
}: {
  rows: Project[];
  showClosed: boolean;
  setShowClosed: (b: boolean) => void;
}) {
  const columns = showClosed ? [...kanbanFlow, ...closedFlow] : kanbanFlow;

  return (
    <div className="transition-opacity duration-200">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => {
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
                <p className="px-2 py-6 text-center text-xs text-brand-text-secondary/60">
                  No projects
                </p>
              ) : (
                colRows.map((p) => <KanbanCard key={p.id} project={p} />)
              )}
            </KanbanColumn>
          );
        })}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowClosed(!showClosed)}
          className="text-xs font-medium text-brand-primary hover:underline"
        >
          {showClosed ? "Hide closed & on hold" : "Show closed & on hold"}
        </button>
      </div>
    </div>
  );
}

function KanbanCard({ project }: { project: Project }) {
  const summary = summarizeJobs(getJobsByProject(project.id));
  const mix = jobMixLabel(summary);
  const industry = industryOf(project.clientId);
  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="block rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-brand-mint hover:shadow-sm"
    >
      <div className="text-[14px] font-medium leading-snug text-brand-text">
        {project.title}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] text-brand-text-secondary">
          {project.clientName}
        </span>
        {industry && (
          <span className="inline-flex items-center rounded-full bg-brand-bg px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-text-secondary">
            {industry}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-brand-text-secondary">
          {project.candidates === 0 ? (
            <span className="text-brand-text-secondary/60">No candidates</span>
          ) : (
            <span className="font-medium text-brand-text">
              {project.candidates} candidates
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 text-brand-text-secondary">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-seafoam text-[9px] font-semibold text-brand-primary">
            {initialsOf(project.owner)}
          </span>
          {project.owner.split(" ")[0]}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-brand-text-secondary">
          {seniorityLabel[project.seniority]}
        </span>
        <div className="text-right">
          <div className="text-[11px] font-medium text-brand-primary">
            {summary.count} {summary.count === 1 ? "job" : "jobs"}
          </div>
          {mix && (
            <div className="text-[10px] text-brand-text-secondary">{mix}</div>
          )}
        </div>
      </div>
      <div className="mt-1.5 text-right text-[11px] text-brand-text-secondary">
        {relativeCreated(project.daysOpen)}
      </div>
    </Link>
  );
}

// === Card View ===============================================
function CardView({ rows }: { rows: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((project) => {
        const summary = summarizeJobs(getJobsByProject(project.id));
        const mix = jobMixLabel(summary);
        const industry = industryOf(project.clientId);
        return (
          <Link
            key={project.id}
            to="/projects/$id"
            params={{ id: project.id }}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-brand-mint hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-brand-text">
                  {project.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[12.5px] text-brand-text-secondary">
                    {project.clientName}
                  </span>
                  {industry && (
                    <span className="inline-flex items-center rounded-full bg-brand-bg px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-text-secondary">
                      {industry}
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg bg-brand-bg/50 p-3 text-[12px]">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary">
                  Jobs
                </div>
                <div className="mt-0.5 font-semibold text-brand-text">
                  {summary.count} {summary.count === 1 ? "job" : "jobs"}
                </div>
                {mix && (
                  <div className="text-[10.5px] text-brand-text-secondary">
                    {mix}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary">
                  Candidates
                </div>
                <div className="mt-0.5 font-semibold text-brand-text">
                  {project.candidates === 0
                    ? "None yet"
                    : `${project.candidates}`}
                </div>
                <div className="text-[10.5px] text-brand-text-secondary">
                  {seniorityLabel[project.seniority]}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-[12px]">
              <span className="flex items-center gap-1.5 text-brand-text-secondary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary">
                  {initialsOf(project.owner)}
                </span>
                {project.owner}
              </span>
              <span className="text-brand-text-secondary">
                {relativeCreated(project.daysOpen)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  Chrome,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  Linkedin,
  Loader2,
  MapPin,
  MoreHorizontal,
  PenTool,
  Search,
  SearchX,
  ShieldAlert,
  Sparkles,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader, EmptyState, ScoreRing } from "@/components/shared";
import { ImportCandidateModal } from "@/components/import/ImportCandidateModal";
import { cn } from "@/lib/utils";

// ============= Types & mock data ===============================
type Seniority =
  | "c_suite"
  | "vp"
  | "director"
  | "manager"
  | "senior"
  | "mid"
  | "junior";

type Source =
  | "cv_upload"
  | "linkedin"
  | "manual"
  | "inbound"
  | "chrome_extension"
  | "csv_import"
  | "referral";

interface Cand {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  seniority: Seniority;
  experience: number;
  skills: string[];
  source: Source;
  addedDays: number;
  dnc?: boolean;
  snippet?: string;
}

const CANDIDATES: Cand[] = [
  { id: "c1", name: "Rina Wijaya", title: "CFO", company: "PT Telkom Indonesia", location: "Jakarta", seniority: "c_suite", experience: 18, skills: ["Financial Planning", "IFRS", "M&A", "Board Reporting"], source: "linkedin", addedDays: 2, snippet: "18 years leading finance at Indonesian telco, IFRS + M&A experience" },
  { id: "c2", name: "Budi Santoso", title: "VP Finance", company: "Astra International", location: "Jakarta", seniority: "vp", experience: 15, skills: ["Treasury", "SAP FICO", "Board Reporting"], source: "cv_upload", addedDays: 7 },
  { id: "c3", name: "Priya Nair", title: "Group CFO", company: "Tata Motors SE Asia", location: "Singapore", seniority: "c_suite", experience: 20, skills: ["M&A", "IPO", "GAAP", "Treasury"], source: "chrome_extension", addedDays: 3, snippet: "20 years group CFO experience including IPO leadership at Tata Motors" },
  { id: "c4", name: "James Chen", title: "Finance Director", company: "Wilmar International", location: "Singapore", seniority: "director", experience: 12, skills: ["Budgeting", "ERP", "Team Leadership"], source: "csv_import", addedDays: 14 },
  { id: "c5", name: "Amara Osei", title: "CFO", company: "Fonterra SEA", location: "Jakarta", seniority: "c_suite", experience: 16, skills: ["IFRS", "ESG Reporting", "Board Reporting"], source: "linkedin", addedDays: 5, snippet: "CFO at FMCG manufacturer with ESG and board reporting depth" },
  { id: "c6", name: "Rahul Kapoor", title: "Head of Strategy", company: "McKinsey & Company", location: "Mumbai", seniority: "director", experience: 10, skills: ["Strategy", "Due Diligence", "Analytics"], source: "referral", addedDays: 30 },
  { id: "c7", name: "Sarah Mitchell", title: "Regional Finance Lead", company: "Unilever Indonesia", location: "Jakarta", seniority: "director", experience: 14, skills: ["FP&A", "Supply Chain Finance", "FMCG"], source: "inbound", addedDays: 7, snippet: "14 years FP&A leadership at Unilever Indonesia, FMCG specialist" },
  { id: "c8", name: "Dewi Anggraini", title: "VP Corporate Finance", company: "Indofood CBP", location: "Jakarta", seniority: "vp", experience: 13, skills: ["Capital Markets", "Debt Restructuring", "IFRS"], source: "cv_upload", addedDays: 21 },
  { id: "c9", name: "Tom Nguyen", title: "CFO", company: "Vietnam Dairy Products", location: "Ho Chi Minh City", seniority: "c_suite", experience: 17, skills: ["Manufacturing Finance", "M&A", "IPO"], source: "manual", addedDays: 60, dnc: true },
  { id: "c10", name: "Siti Rahayu", title: "Tax Director", company: "PwC Indonesia", location: "Jakarta", seniority: "director", experience: 11, skills: ["Indonesian Tax", "Transfer Pricing", "OJK"], source: "linkedin", addedDays: 4 },
  { id: "c11", name: "Michael Wong", title: "Investment Director", company: "Temasek Holdings", location: "Singapore", seniority: "director", experience: 9, skills: ["PE/VC", "Due Diligence", "Portfolio Mgmt"], source: "chrome_extension", addedDays: 14 },
  { id: "c12", name: "Ananya Sharma", title: "Head of FP&A", company: "Grab Holdings", location: "Singapore", seniority: "senior", experience: 8, skills: ["FP&A", "Data Analytics", "Forecasting"], source: "csv_import", addedDays: 30 },
  { id: "c13", name: "Patrick O'Brien", title: "Group Treasurer", company: "BHP Billiton", location: "Sydney", seniority: "vp", experience: 19, skills: ["Treasury", "Forex", "Banking Relations"], source: "referral", addedDays: 42 },
  { id: "c14", name: "Kartika Sari", title: "Finance Manager", company: "Tokopedia", location: "Jakarta", seniority: "manager", experience: 6, skills: ["Budgeting", "Startup Finance", "SaaS Metrics"], source: "inbound", addedDays: 3 },
  { id: "c15", name: "David Tanaka", title: "VP Operations", company: "Suntory Beverage", location: "Jakarta", seniority: "vp", experience: 14, skills: ["Operations", "P&L Management", "Manufacturing"], source: "cv_upload", addedDays: 7 },
];

const SENIORITY_LABEL: Record<Seniority, string> = {
  c_suite: "C-Suite",
  vp: "VP",
  director: "Director",
  manager: "Manager",
  senior: "Senior",
  mid: "Mid",
  junior: "Junior",
};

const SOURCE_META: Record<Source, { label: string; icon: typeof FileText; cls: string }> = {
  cv_upload: { label: "CV", icon: FileText, cls: "bg-blue-50 text-blue-700" },
  linkedin: { label: "LinkedIn", icon: Linkedin, cls: "bg-[#0A66C2]/10 text-[#0A66C2]" },
  manual: { label: "Manual", icon: PenTool, cls: "bg-gray-100 text-gray-700" },
  inbound: { label: "Inbound", icon: Globe, cls: "bg-green-50 text-green-700" },
  chrome_extension: { label: "Extension", icon: Chrome, cls: "bg-purple-50 text-purple-700" },
  csv_import: { label: "CSV", icon: FileSpreadsheet, cls: "bg-amber-50 text-amber-700" },
  referral: { label: "Referral", icon: UserPlus, cls: "bg-brand-pink/40 text-brand-magenta" },
};

// Mock project list (for "Add to project")
const MOCK_PROJECTS = [
  { id: "p1", title: "Group CFO", client: "Indorama Ventures" },
  { id: "p2", title: "VP Operations, SE Asia", client: "OYO Hotels" },
  { id: "p3", title: "Country Director", client: "KNS Group" },
];

// ============= Route ==========================================
const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  mode: fallback(z.enum(["keyword", "semantic"]), "keyword").default("keyword"),
  seniority: fallback(z.string(), "all").default("all"),
  location: fallback(z.string(), "all").default("all"),
  source: fallback(z.string(), "all").default("all"),
  availability: fallback(z.string(), "all").default("all"),
});

export const Route = createFileRoute("/_app/candidates")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Candidates — HireSmart" }] }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [showDnc, setShowDnc] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [semanticBusy, setSemanticBusy] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState<string | null>(null);
  const [draft, setDraft] = useState(search.q);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const setSearch = (patch: Partial<typeof search>) => {
    navigate({ to: "/candidates", search: { ...search, ...patch } });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = CANDIDATES.filter((c) => (showDnc ? true : !c.dnc));
    const q = (search.mode === "keyword" ? search.q : "").toLowerCase().trim();
    if (q) {
      list = list.filter((c) =>
        [c.name, c.title, c.company, c.location, c.skills.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (search.seniority !== "all") list = list.filter((c) => c.seniority === search.seniority);
    if (search.location !== "all")
      list = list.filter((c) => c.location.toLowerCase().includes(search.location.toLowerCase()));
    if (search.source !== "all") list = list.filter((c) => c.source === search.source);

    if (search.mode === "semantic" && semanticQuery) {
      // Fake similarity scoring (stable, deterministic)
      list = list
        .map((c) => ({ ...c, _sim: simulateSim(c, semanticQuery) }))
        .sort((a, b) => (b as any)._sim - (a as any)._sim);
    } else {
      list = [...list].sort((a, b) => a.addedDays - b.addedDays);
    }
    return list;
  }, [search, showDnc, semanticQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const filtersActive = ["seniority", "location", "source", "availability"].filter(
    (k) => (search as any)[k] !== "all",
  ).length;

  const runSemantic = () => {
    if (!draft.trim()) return;
    setSearch({ q: draft, mode: "semantic" });
    setSemanticBusy(true);
    setTimeout(() => {
      setSemanticQuery(draft);
      setSemanticBusy(false);
    }, 1500);
  };

  const clearSemantic = () => {
    setSemanticQuery(null);
    setDraft("");
    setSearch({ q: "", mode: "keyword" });
  };

  const addToProject = (projectTitle: string, n: number) => {
    toast.success(`${n} candidate${n > 1 ? "s" : ""} added to ${projectTitle}`);
    setSelected({});
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Candidates"
        subtitle={`${CANDIDATES.length} candidates in database`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
              onClick={() => toast("Import modal coming soon")}
            >
              <Upload className="h-4 w-4" />
              Import candidates
            </Button>
          </div>
        }
      />

      {/* Search bar */}
      <div
        className={cn(
          "flex h-[52px] items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition focus-within:border-brand-primary",
          search.mode === "semantic" && "ring-1 ring-brand-mint/60",
        )}
      >
        <div className="flex items-center gap-1">
          <ModePill
            active={search.mode === "keyword"}
            onClick={() => {
              setSearch({ mode: "keyword" });
              setSemanticQuery(null);
            }}
            icon={Search}
            label="Search"
          />
          <ModePill
            active={search.mode === "semantic"}
            onClick={() => setSearch({ mode: "semantic" })}
            icon={Sparkles}
            label="AI search"
          />
        </div>
        <div className="mx-3 h-6 border-r border-gray-200" />
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (search.mode === "keyword") setSearch({ q: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.mode === "semantic") runSemantic();
          }}
          placeholder={
            search.mode === "keyword"
              ? "Search by name, title, company, or skills..."
              : "Describe the candidate you're looking for... e.g., 'Senior finance leader with M&A experience in FMCG'"
          }
          className="h-9 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
        />
        {search.mode === "semantic" && (
          <Button
            onClick={runSemantic}
            disabled={semanticBusy || !draft.trim()}
            className="ml-2 gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            {semanticBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <FilterSelect
          label="Seniority"
          value={search.seniority}
          onChange={(v) => setSearch({ seniority: v })}
          options={[
            { value: "all", label: "All levels" },
            ...(Object.entries(SENIORITY_LABEL) as [Seniority, string][]).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ]}
        />
        <FilterSelect
          label="Location"
          value={search.location}
          onChange={(v) => setSearch({ location: v })}
          options={[
            { value: "all", label: "All locations" },
            { value: "Jakarta", label: "Jakarta" },
            { value: "Singapore", label: "Singapore" },
            { value: "Sydney", label: "Sydney" },
            { value: "Mumbai", label: "Mumbai" },
            { value: "Bangkok", label: "Bangkok" },
            { value: "Ho Chi Minh", label: "Ho Chi Minh City" },
          ]}
        />
        <FilterSelect
          label="Source"
          value={search.source}
          onChange={(v) => setSearch({ source: v })}
          options={[
            { value: "all", label: "All sources" },
            ...(Object.entries(SOURCE_META) as [Source, typeof SOURCE_META.cv_upload][]).map(
              ([v, m]) => ({ value: v, label: m.label }),
            ),
          ]}
        />
        <FilterSelect
          label="Availability"
          value={search.availability}
          onChange={(v) => setSearch({ availability: v })}
          options={[
            { value: "all", label: "All" },
            { value: "now", label: "Available now" },
            { value: "1m", label: "1 month notice" },
            { value: "2m", label: "2-3 months" },
          ]}
        />

        {filtersActive > 0 && (
          <>
            <span className="text-xs text-brand-text-secondary">
              {filtersActive} filter{filtersActive > 1 ? "s" : ""} active
            </span>
            <button
              onClick={() =>
                setSearch({
                  seniority: "all",
                  location: "all",
                  source: "all",
                  availability: "all",
                })
              }
              className="text-xs font-medium text-brand-primary hover:underline"
            >
              Clear all
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2 border-l border-gray-200 pl-4">
          <ShieldAlert className="h-3.5 w-3.5 text-status-danger" />
          <span className="text-xs text-status-danger">Show DNC</span>
          <Switch checked={showDnc} onCheckedChange={setShowDnc} />
        </div>
      </div>

      {/* Semantic banner */}
      {search.mode === "semantic" && semanticQuery && (
        <div className="flex items-center justify-between rounded-lg border border-brand-mint/50 bg-brand-seafoam/20 px-4 py-2 text-sm">
          <div className="flex items-center gap-2 text-brand-text">
            <Sparkles className="h-4 w-4 text-brand-magenta" />
            Showing candidates ranked by AI similarity to:{" "}
            <span className="font-medium">"{semanticQuery}"</span>
          </div>
          <button
            onClick={clearSemantic}
            className="rounded p-1 text-brand-text-secondary hover:bg-white hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-brand-primary/30 bg-brand-seafoam/30 px-4 py-2 text-sm">
          <span className="font-medium text-brand-primary">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">
                  Add to project
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Active projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MOCK_PROJECTS.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => addToProject(`${p.title} — ${p.client}`, selectedIds.length)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{p.title}</span>
                      <span className="text-xs text-brand-text-secondary">{p.client}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline">
              Add tags
            </Button>
            <Button size="sm" variant="outline">
              Export
            </Button>
            <Button size="sm" variant="outline" className="text-status-danger hover:text-status-danger">
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {semanticBusy ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-4 py-4">
                <div className="h-9 w-9 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            {search.mode === "semantic" ? (
              <EmptyState
                icon={Sparkles}
                title="No matching candidates found"
                description="Try rephrasing your description or broadening the criteria. AI search works best with specific role descriptions."
                actionLabel="Switch to keyword search"
                onAction={clearSemantic}
              />
            ) : search.q || filtersActive ? (
              <EmptyState
                icon={SearchX}
                title="No candidates found"
                description="Try different search terms or adjust your filters."
                actionLabel="Clear search"
                onAction={() =>
                  setSearch({
                    q: "",
                    seniority: "all",
                    location: "all",
                    source: "all",
                    availability: "all",
                  })
                }
              />
            ) : (
              <EmptyState
                icon={Users}
                title="Your candidate database is empty"
                description="Import candidates from CVs, LinkedIn profiles, or add them manually to build your talent pool."
                actionLabel="Import candidates"
                onAction={() => toast("Import modal coming soon")}
              />
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-brand-bg/50 text-xs uppercase tracking-wide text-brand-text-secondary">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={pageRows.every((r) => selected[r.id])}
                    onCheckedChange={(c) => {
                      const next = { ...selected };
                      pageRows.forEach((r) => (next[r.id] = !!c));
                      setSelected(next);
                    }}
                  />
                </th>
                <th className="px-3 py-2.5 text-left font-medium">Candidate</th>
                {semanticQuery && search.mode === "semantic" && (
                  <th className="w-24 px-3 py-2.5 text-left font-medium">Similarity</th>
                )}
                <th className="w-[220px] px-3 py-2.5 text-left font-medium">Skills</th>
                <th className="w-24 px-3 py-2.5 text-left font-medium">Seniority</th>
                <th className="w-20 px-3 py-2.5 text-left font-medium">Exp</th>
                {!(semanticQuery && search.mode === "semantic") && (
                  <th className="w-28 px-3 py-2.5 text-left font-medium">Source</th>
                )}
                <th className="w-24 px-3 py-2.5 text-left font-medium">Added</th>
                <th className="w-10 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c, i) => {
                const SourceIcon = SOURCE_META[c.source].icon;
                const sim = (c as any)._sim as number | undefined;
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate({ to: "/candidates/$id", params: { id: c.id } })}
                    className={cn(
                      "cursor-pointer border-b border-gray-50 transition-colors hover:bg-brand-seafoam/10",
                      i % 2 === 1 && "bg-brand-bg/40",
                      c.dnc && "bg-red-50/30 hover:bg-red-50/60",
                    )}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={!!selected[c.id]}
                        onCheckedChange={(v) =>
                          setSelected((s) => ({ ...s, [c.id]: !!v }))
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-brand-text">
                            {c.name}
                            {c.dnc && (
                              <span title="Do not contact">
                                <ShieldAlert className="h-3.5 w-3.5 text-status-danger" />
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-brand-text-secondary">
                            {c.title} at {c.company}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-brand-text-secondary">
                            <MapPin className="h-3 w-3" />
                            {c.location}
                          </div>
                          {semanticQuery && search.mode === "semantic" && c.snippet && (
                            <div className="mt-1 text-xs italic text-brand-primary">
                              {c.snippet}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {semanticQuery && search.mode === "semantic" && (
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <ScoreRing score={sim ?? 0} size="sm" />
                          <span className="text-sm font-medium text-brand-text">
                            {sim ?? 0}%
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded bg-brand-bg px-2 py-0.5 text-xs text-brand-text-secondary"
                          >
                            {s}
                          </span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="rounded bg-brand-bg px-2 py-0.5 text-xs font-medium text-brand-primary">
                            +{c.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-brand-text">
                      {SENIORITY_LABEL[c.seniority]}
                    </td>
                    <td className="px-3 py-3 text-sm text-brand-text">{c.experience} yrs</td>
                    {!(semanticQuery && search.mode === "semantic") && (
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                            SOURCE_META[c.source].cls,
                          )}
                        >
                          <SourceIcon className="h-3 w-3" />
                          {SOURCE_META[c.source].label}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3 text-xs text-brand-text-secondary">
                      {relTime(c.addedDays)}
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({ to: "/candidates/$id", params: { id: c.id } })
                            }
                          >
                            View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>Add to project</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Flag DNC</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-status-danger">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
            <div className="text-xs text-brand-text-secondary">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} candidates
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="px-2 text-xs text-brand-text-secondary">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= Sub-components ===================================
function ModePill({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Search;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-brand-primary text-white"
          : "bg-brand-bg text-brand-text-secondary hover:bg-brand-seafoam/40",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all";
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-8 w-auto gap-2 border-gray-200 text-xs",
          active && "border-brand-primary text-brand-primary",
        )}
      >
        <div className="flex items-center gap-1.5">
          {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
          <span>{label}:</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-sm">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const ch = name[0].toUpperCase();
  const bg =
    ch <= "E"
      ? "bg-brand-seafoam text-brand-primary"
      : ch <= "J"
        ? "bg-brand-mint text-brand-primary"
        : ch <= "O"
          ? "bg-brand-pink/40 text-brand-magenta"
          : ch <= "T"
            ? "bg-blue-100 text-blue-700"
            : "bg-amber-100 text-amber-700";
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
        bg,
      )}
    >
      {initials}
    </div>
  );
}

function relTime(days: number) {
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.round(days / 30)} months ago`;
}

// Deterministic fake semantic similarity score
function simulateSim(c: Cand, query: string) {
  const q = query.toLowerCase();
  let score = 50;
  const haystack = [c.title, c.company, c.location, ...c.skills].join(" ").toLowerCase();
  q.split(/\s+/).forEach((tok) => {
    if (tok.length < 3) return;
    if (haystack.includes(tok)) score += 8;
  });
  if (c.snippet) score += 6;
  // Deterministic jitter from name length
  score += (c.name.length % 7) - 3;
  return Math.max(35, Math.min(98, score));
}

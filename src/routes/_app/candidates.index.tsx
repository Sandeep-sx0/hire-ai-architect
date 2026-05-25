import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  ArrowUpDown,
  Briefcase,
  Check,
  Chrome,
  Columns3,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  LayoutGrid,
  Linkedin,
  List,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PenTool,
  Phone,
  Search,
  SearchX,
  Send,
  ShieldAlert,
  Sparkles,
  Tag,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EmptyState, ScoreRing } from "@/components/shared";
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

type Availability = "now" | "1m" | "2m" | "3m" | "passive";

interface PastRole {
  title: string;
  company: string;
  years: number;
}

interface LinkedJob {
  id: string;
  title: string;
  stage: "matched" | "shortlisted" | "interview" | "offer";
}

interface Cand {
  id: string;
  name: string;
  title: string;
  company: string;
  yearsInRole: number;
  pastRoles: PastRole[];
  location: string;
  seniority: Seniority;
  experience: number;
  skills: string[];
  email: string;
  phone: string; // E.164 for wa.me
  linkedinUrl: string;
  source: Source;
  sourceJob?: string; // for inbound
  linkedJobs: LinkedJob[];
  availability: Availability;
  noticePeriod?: string;
  addedDays: number;
  lastActivityDays: number;
  dnc?: boolean;
  snippet?: string;
}

const CANDIDATES: Cand[] = [
  {
    id: "c1", name: "Rina Wijaya", title: "CFO", company: "PT Telkom Indonesia", yearsInRole: 4,
    pastRoles: [
      { title: "VP Finance", company: "Bank Mandiri", years: 5 },
      { title: "Finance Director", company: "Unilever Indonesia", years: 4 },
      { title: "Senior Manager", company: "PwC Jakarta", years: 5 },
    ],
    location: "Jakarta", seniority: "c_suite", experience: 18,
    skills: ["Financial Planning", "IFRS", "M&A", "Board Reporting", "Treasury"],
    email: "rina.wijaya@example.id", phone: "+6281234567001", linkedinUrl: "https://linkedin.com/in/rina-wijaya",
    source: "linkedin",
    linkedJobs: [{ id: "j1", title: "Group CFO — Indorama", stage: "shortlisted" }, { id: "j6", title: "CFO — Sinar Mas", stage: "matched" }],
    availability: "2m", noticePeriod: "2 months",
    addedDays: 2, lastActivityDays: 1,
    snippet: "18 years leading finance at Indonesian telco, IFRS + M&A experience",
  },
  {
    id: "c2", name: "Budi Santoso", title: "VP Finance", company: "Astra International", yearsInRole: 3,
    pastRoles: [
      { title: "Finance Director", company: "GoTo Group", years: 4 },
      { title: "Head of FP&A", company: "Bank BCA", years: 6 },
    ],
    location: "Jakarta", seniority: "vp", experience: 15,
    skills: ["Treasury", "SAP FICO", "Board Reporting"],
    email: "budi.santoso@example.id", phone: "+6281234567002", linkedinUrl: "https://linkedin.com/in/budi-santoso",
    source: "cv_upload",
    linkedJobs: [{ id: "j1", title: "Group CFO — Indorama", stage: "matched" }],
    availability: "1m", noticePeriod: "1 month",
    addedDays: 7, lastActivityDays: 3,
  },
  {
    id: "c3", name: "Priya Nair", title: "Group CFO", company: "Tata Motors SE Asia", yearsInRole: 5,
    pastRoles: [
      { title: "Regional CFO", company: "Mahindra", years: 6 },
      { title: "VP Finance", company: "Hindustan Unilever", years: 5 },
      { title: "Audit Manager", company: "Deloitte India", years: 4 },
    ],
    location: "Singapore", seniority: "c_suite", experience: 20,
    skills: ["M&A", "IPO", "GAAP", "Treasury", "Capital Markets"],
    email: "priya.nair@example.com", phone: "+6591234003", linkedinUrl: "https://linkedin.com/in/priya-nair",
    source: "chrome_extension",
    linkedJobs: [{ id: "j1", title: "Group CFO — Indorama", stage: "interview" }],
    availability: "3m", noticePeriod: "3 months",
    addedDays: 3, lastActivityDays: 0,
    snippet: "20 years group CFO experience including IPO leadership at Tata Motors",
  },
  {
    id: "c4", name: "James Chen", title: "Finance Director", company: "Wilmar International", yearsInRole: 2,
    pastRoles: [{ title: "Senior Finance Manager", company: "Olam", years: 5 }, { title: "Manager", company: "EY Singapore", years: 5 }],
    location: "Singapore", seniority: "director", experience: 12,
    skills: ["Budgeting", "ERP", "Team Leadership"],
    email: "james.chen@example.com", phone: "+6591234004", linkedinUrl: "https://linkedin.com/in/james-chen",
    source: "csv_import",
    linkedJobs: [],
    availability: "passive",
    addedDays: 14, lastActivityDays: 9,
  },
  {
    id: "c5", name: "Amara Osei", title: "CFO", company: "Fonterra SEA", yearsInRole: 3,
    pastRoles: [{ title: "Group Controller", company: "Nestlé Africa", years: 7 }, { title: "Finance Manager", company: "P&G", years: 6 }],
    location: "Jakarta", seniority: "c_suite", experience: 16,
    skills: ["IFRS", "ESG Reporting", "Board Reporting", "FMCG"],
    email: "amara.osei@example.com", phone: "+6281234567005", linkedinUrl: "https://linkedin.com/in/amara-osei",
    source: "linkedin",
    linkedJobs: [{ id: "j6", title: "CFO — Sinar Mas", stage: "shortlisted" }],
    availability: "now", noticePeriod: "Immediately",
    addedDays: 5, lastActivityDays: 2,
    snippet: "CFO at FMCG manufacturer with ESG and board reporting depth",
  },
  {
    id: "c6", name: "Rahul Kapoor", title: "Head of Strategy", company: "McKinsey & Company", yearsInRole: 4,
    pastRoles: [{ title: "Engagement Manager", company: "BCG", years: 4 }, { title: "Associate", company: "Bain", years: 2 }],
    location: "Mumbai", seniority: "director", experience: 10,
    skills: ["Strategy", "Due Diligence", "Analytics"],
    email: "rahul.kapoor@example.com", phone: "+919812340006", linkedinUrl: "https://linkedin.com/in/rahul-kapoor",
    source: "referral",
    linkedJobs: [],
    availability: "2m", noticePeriod: "2 months",
    addedDays: 30, lastActivityDays: 12,
  },
  {
    id: "c7", name: "Sarah Mitchell", title: "Regional Finance Lead", company: "Unilever Indonesia", yearsInRole: 3,
    pastRoles: [{ title: "FP&A Director", company: "Reckitt Benckiser", years: 5 }, { title: "Finance Manager", company: "Mondelez", years: 6 }],
    location: "Jakarta", seniority: "director", experience: 14,
    skills: ["FP&A", "Supply Chain Finance", "FMCG"],
    email: "sarah.mitchell@example.com", phone: "+6281234567007", linkedinUrl: "https://linkedin.com/in/sarah-mitchell",
    source: "inbound", sourceJob: "VP Finance — Asia Pulp",
    linkedJobs: [{ id: "j2", title: "VP Finance — Asia Pulp", stage: "interview" }],
    availability: "1m", noticePeriod: "1 month",
    addedDays: 7, lastActivityDays: 1,
    snippet: "14 years FP&A leadership at Unilever Indonesia, FMCG specialist",
  },
  {
    id: "c8", name: "Dewi Anggraini", title: "VP Corporate Finance", company: "Indofood CBP", yearsInRole: 4,
    pastRoles: [{ title: "Head of Treasury", company: "Bank Mandiri", years: 5 }, { title: "Manager", company: "PwC", years: 4 }],
    location: "Jakarta", seniority: "vp", experience: 13,
    skills: ["Capital Markets", "Debt Restructuring", "IFRS"],
    email: "dewi.anggraini@example.id", phone: "+6281234567008", linkedinUrl: "https://linkedin.com/in/dewi-a",
    source: "cv_upload",
    linkedJobs: [{ id: "j1", title: "Group CFO — Indorama", stage: "matched" }],
    availability: "2m",
    addedDays: 21, lastActivityDays: 5,
  },
  {
    id: "c9", name: "Tom Nguyen", title: "CFO", company: "Vietnam Dairy Products", yearsInRole: 5,
    pastRoles: [{ title: "VP Finance", company: "Masan Group", years: 6 }, { title: "Senior Manager", company: "KPMG", years: 6 }],
    location: "Ho Chi Minh City", seniority: "c_suite", experience: 17,
    skills: ["Manufacturing Finance", "M&A", "IPO"],
    email: "tom.nguyen@example.com", phone: "+84981230009", linkedinUrl: "https://linkedin.com/in/tom-nguyen",
    source: "manual",
    linkedJobs: [],
    availability: "passive",
    addedDays: 60, lastActivityDays: 45,
    dnc: true,
  },
  {
    id: "c10", name: "Siti Rahayu", title: "Tax Director", company: "PwC Indonesia", yearsInRole: 2,
    pastRoles: [{ title: "Senior Tax Manager", company: "EY", years: 5 }, { title: "Tax Manager", company: "Deloitte", years: 4 }],
    location: "Jakarta", seniority: "director", experience: 11,
    skills: ["Indonesian Tax", "Transfer Pricing", "OJK"],
    email: "siti.rahayu@example.id", phone: "+6281234567010", linkedinUrl: "https://linkedin.com/in/siti-rahayu",
    source: "linkedin",
    linkedJobs: [{ id: "j6", title: "CFO — Sinar Mas", stage: "matched" }],
    availability: "1m",
    addedDays: 4, lastActivityDays: 0,
  },
  {
    id: "c11", name: "Michael Wong", title: "Investment Director", company: "Temasek Holdings", yearsInRole: 3,
    pastRoles: [{ title: "VP", company: "GIC", years: 4 }, { title: "Associate", company: "Goldman Sachs", years: 2 }],
    location: "Singapore", seniority: "director", experience: 9,
    skills: ["PE/VC", "Due Diligence", "Portfolio Mgmt"],
    email: "michael.wong@example.sg", phone: "+6591234011", linkedinUrl: "https://linkedin.com/in/michael-wong",
    source: "chrome_extension",
    linkedJobs: [],
    availability: "3m",
    addedDays: 14, lastActivityDays: 6,
  },
  {
    id: "c12", name: "Ananya Sharma", title: "Head of FP&A", company: "Grab Holdings", yearsInRole: 2,
    pastRoles: [{ title: "Senior FP&A Manager", company: "Gojek", years: 3 }, { title: "Analyst", company: "Morgan Stanley", years: 3 }],
    location: "Singapore", seniority: "senior", experience: 8,
    skills: ["FP&A", "Data Analytics", "Forecasting"],
    email: "ananya.sharma@example.sg", phone: "+6591234012", linkedinUrl: "https://linkedin.com/in/ananya-sharma",
    source: "csv_import",
    linkedJobs: [],
    availability: "1m",
    addedDays: 30, lastActivityDays: 14,
  },
  {
    id: "c13", name: "Patrick O'Brien", title: "Group Treasurer", company: "BHP Billiton", yearsInRole: 6,
    pastRoles: [{ title: "Treasurer", company: "Rio Tinto", years: 7 }, { title: "Finance Manager", company: "ANZ", years: 6 }],
    location: "Sydney", seniority: "vp", experience: 19,
    skills: ["Treasury", "Forex", "Banking Relations"],
    email: "patrick.obrien@example.au", phone: "+61491230013", linkedinUrl: "https://linkedin.com/in/patrick-obrien",
    source: "referral",
    linkedJobs: [{ id: "j1", title: "Group CFO — Indorama", stage: "matched" }],
    availability: "passive",
    addedDays: 42, lastActivityDays: 21,
  },
  {
    id: "c14", name: "Kartika Sari", title: "Finance Manager", company: "Tokopedia", yearsInRole: 2,
    pastRoles: [{ title: "Senior Analyst", company: "Bukalapak", years: 4 }],
    location: "Jakarta", seniority: "manager", experience: 6,
    skills: ["Budgeting", "Startup Finance", "SaaS Metrics"],
    email: "kartika.sari@example.id", phone: "+6281234567014", linkedinUrl: "https://linkedin.com/in/kartika-sari",
    source: "inbound", sourceJob: "Head of Finance — Tokopedia",
    linkedJobs: [{ id: "j3", title: "Head of Finance — Tokopedia", stage: "shortlisted" }],
    availability: "now", noticePeriod: "Immediately",
    addedDays: 3, lastActivityDays: 0,
  },
  {
    id: "c15", name: "David Tanaka", title: "VP Operations", company: "Suntory Beverage", yearsInRole: 4,
    pastRoles: [{ title: "Operations Director", company: "Kirin", years: 5 }, { title: "Plant Manager", company: "Asahi", years: 5 }],
    location: "Jakarta", seniority: "vp", experience: 14,
    skills: ["Operations", "P&L Management", "Manufacturing"],
    email: "david.tanaka@example.id", phone: "+6281234567015", linkedinUrl: "https://linkedin.com/in/david-tanaka",
    source: "cv_upload",
    linkedJobs: [{ id: "j4", title: "VP Operations — OYO", stage: "matched" }],
    availability: "2m",
    addedDays: 7, lastActivityDays: 4,
  },
];

const SENIORITY_LABEL: Record<Seniority, string> = {
  c_suite: "C-Suite", vp: "VP", director: "Director", manager: "Manager",
  senior: "Senior", mid: "Mid", junior: "Junior",
};

const AVAIL_LABEL: Record<Availability, string> = {
  now: "Available now", "1m": "1 month notice", "2m": "2 months", "3m": "3 months", passive: "Passive",
};
const AVAIL_CLS: Record<Availability, string> = {
  now: "bg-green-50 text-green-700",
  "1m": "bg-emerald-50 text-emerald-700",
  "2m": "bg-amber-50 text-amber-700",
  "3m": "bg-orange-50 text-orange-700",
  passive: "bg-gray-100 text-gray-600",
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

// Deterministic palette for skill chips
const SKILL_COLORS = [
  "bg-blue-50 text-blue-700 ring-blue-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-purple-50 text-purple-700 ring-purple-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
  "bg-cyan-50 text-cyan-700 ring-cyan-100",
];
const skillColor = (s: string) => SKILL_COLORS[Math.abs(hash(s)) % SKILL_COLORS.length];
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

const MOCK_PROJECTS = [
  { id: "p1", title: "Group CFO", client: "Indorama Ventures" },
  { id: "p2", title: "VP Operations, SE Asia", client: "OYO Hotels" },
  { id: "p3", title: "Country Director", client: "KNS Group" },
];

// ============= Columns config (for View Settings) ================
type ColKey =
  | "name" | "email" | "phone" | "experience" | "skills" | "seniority"
  | "location" | "linkedJobs" | "source" | "availability" | "lastActivity";

const DEFAULT_COLS: Record<ColKey, boolean> = {
  name: true, email: true, phone: true, experience: true, skills: true,
  seniority: true, location: true, linkedJobs: true, source: true,
  availability: true, lastActivity: true,
};
const COL_LABEL: Record<ColKey, string> = {
  name: "Name", email: "Email", phone: "Phone / WhatsApp", experience: "Experience",
  skills: "Skills", seniority: "Seniority", location: "Location",
  linkedJobs: "Linked jobs", source: "Source", availability: "Availability",
  lastActivity: "Last activity",
};

// ============= Route ===========================================
const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  mode: fallback(z.enum(["keyword", "semantic"]), "keyword").default("keyword"),
  seniority: fallback(z.string(), "all").default("all"),
  location: fallback(z.string(), "all").default("all"),
  source: fallback(z.string(), "all").default("all"),
  availability: fallback(z.string(), "all").default("all"),
  sort: fallback(z.enum(["last_activity", "added", "match", "name"]), "last_activity").default("last_activity"),
  view: fallback(z.enum(["list", "board"]), "list").default("list"),
});

export const Route = createFileRoute("/_app/candidates/")({
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
  const [cols, setCols] = useState<Record<ColKey, boolean>>(DEFAULT_COLS);
  const [importOpen, setImportOpen] = useState(false);

  const setSearch = (patch: Partial<typeof search>) => {
    navigate({ to: "/candidates", search: { ...search, ...patch } });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = CANDIDATES.filter((c) => (showDnc ? true : !c.dnc));
    const q = (search.mode === "keyword" ? search.q : "").toLowerCase().trim();
    if (q) {
      list = list.filter((c) =>
        [c.name, c.title, c.company, c.location, c.skills.join(" "), c.email]
          .join(" ").toLowerCase().includes(q),
      );
    }
    if (search.seniority !== "all") list = list.filter((c) => c.seniority === search.seniority);
    if (search.location !== "all")
      list = list.filter((c) => c.location.toLowerCase().includes(search.location.toLowerCase()));
    if (search.source !== "all") list = list.filter((c) => c.source === search.source);
    if (search.availability !== "all") list = list.filter((c) => c.availability === search.availability);

    if (search.mode === "semantic" && semanticQuery) {
      list = list
        .map((c) => ({ ...c, _sim: simulateSim(c, semanticQuery) }))
        .sort((a, b) => (b as any)._sim - (a as any)._sim);
    } else {
      list = [...list].sort((a, b) => {
        switch (search.sort) {
          case "added": return a.addedDays - b.addedDays;
          case "name": return a.name.localeCompare(b.name);
          case "match": return (b.linkedJobs.length) - (a.linkedJobs.length);
          case "last_activity":
          default: return a.lastActivityDays - b.lastActivityDays;
        }
      });
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
    }, 1200);
  };
  const clearSemantic = () => {
    setSemanticQuery(null);
    setDraft("");
    setSearch({ q: "", mode: "keyword" });
  };
  const addToProject = (label: string, n: number) => {
    toast.success(`${n} candidate${n > 1 ? "s" : ""} added to ${label}`);
    setSelected({});
  };

  const showSim = !!(semanticQuery && search.mode === "semantic");

  return (
    <div className="space-y-3">
      <ImportCandidateModal open={importOpen} onOpenChange={setImportOpen} />

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Candidates</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-brand-text">
            Candidates
          </h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">
            <span className="font-medium text-brand-text">{CANDIDATES.length}</span> candidates in database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={search.view}
            onValueChange={(v) => v && setSearch({ view: v as "list" | "board" })}
            className="rounded-md border border-gray-200 p-0.5"
          >
            <ToggleGroupItem value="list" aria-label="List view" className="h-7 px-2">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="board" aria-label="Board view" className="h-7 px-2">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <ViewSettingsMenu cols={cols} setCols={setCols} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Import / Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Import from CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                <FileText className="mr-2 h-4 w-4" /> Upload CVs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.success("Export started")}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
            onClick={() => setImportOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Add candidate
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Manage tags</DropdownMenuItem>
              <DropdownMenuItem>Manage saved searches</DropdownMenuItem>
              <DropdownMenuItem>Duplicate detection</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
            onClick={() => { setSearch({ mode: "keyword" }); setSemanticQuery(null); }}
            icon={Search} label="Text"
          />
          <ModePill
            active={search.mode === "semantic"}
            onClick={() => setSearch({ mode: "semantic" })}
            icon={Sparkles} label="Semantic"
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
              ? "Search candidates, keywords, notes..."
              : "CFO with manufacturing background in SE Asia..."
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
              <><Loader2 className="h-4 w-4 animate-spin" /> Searching...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Search</>
            )}
          </Button>
        )}
      </div>

      {/* Sort + filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sorted by
        </div>
        <Select value={search.sort} onValueChange={(v) => setSearch({ sort: v as any })}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_activity">Last activity</SelectItem>
            <SelectItem value="added">Date added</SelectItem>
            <SelectItem value="match">Match score</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <div className="mx-1 h-6 border-r border-gray-200" />

        <FilterSelect label="Seniority" value={search.seniority} onChange={(v) => setSearch({ seniority: v })}
          options={[{ value: "all", label: "All levels" }, ...(Object.entries(SENIORITY_LABEL) as [Seniority, string][]).map(([v, l]) => ({ value: v, label: l }))]}
        />
        <FilterSelect label="Location" value={search.location} onChange={(v) => setSearch({ location: v })}
          options={[
            { value: "all", label: "All locations" },
            { value: "Jakarta", label: "Jakarta" },
            { value: "Singapore", label: "Singapore" },
            { value: "Sydney", label: "Sydney" },
            { value: "Mumbai", label: "Mumbai" },
            { value: "Ho Chi Minh", label: "Ho Chi Minh City" },
          ]}
        />
        <FilterSelect label="Source" value={search.source} onChange={(v) => setSearch({ source: v })}
          options={[{ value: "all", label: "All sources" }, ...(Object.entries(SOURCE_META) as [Source, typeof SOURCE_META.cv_upload][]).map(([v, m]) => ({ value: v, label: m.label }))]}
        />
        <FilterSelect label="Availability" value={search.availability} onChange={(v) => setSearch({ availability: v })}
          options={[{ value: "all", label: "All" }, ...(Object.entries(AVAIL_LABEL) as [Availability, string][]).map(([v, l]) => ({ value: v, label: l }))]}
        />

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5" />
          More filters
        </Button>

        {filtersActive > 0 && (
          <>
            <span className="text-xs text-brand-text-secondary">
              {filtersActive} filter{filtersActive > 1 ? "s" : ""} active
            </span>
            <button
              onClick={() => setSearch({ seniority: "all", location: "all", source: "all", availability: "all" })}
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
          <button onClick={clearSemantic} className="rounded p-1 text-brand-text-secondary hover:bg-white hover:text-brand-text">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-brand-primary/30 bg-brand-seafoam/30 px-4 py-2 text-sm">
          <span className="font-medium text-brand-primary">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-brand-primary text-white hover:bg-brand-primary/90">
                  <Briefcase className="h-3.5 w-3.5" /> Add to job
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Active projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MOCK_PROJECTS.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => addToProject(`${p.title} — ${p.client}`, selectedIds.length)}>
                    <div className="flex flex-col">
                      <span className="text-sm">{p.title}</span>
                      <span className="text-xs text-brand-text-secondary">{p.client}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Add tag
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Start campaign
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-status-danger hover:text-status-danger">
              <ShieldAlert className="h-3.5 w-3.5" /> Flag DNC
            </Button>
          </div>
        </div>
      )}

      {/* Table / Board */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {semanticBusy ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="p-6">
            {search.mode === "semantic" ? (
              <EmptyState icon={Sparkles} title="No matching candidates found"
                description="Try rephrasing your description or broadening the criteria. AI search works best with specific role descriptions."
                actionLabel="Switch to keyword search" onAction={clearSemantic}
              />
            ) : search.q || filtersActive ? (
              <EmptyState icon={SearchX} title="No candidates found"
                description="Try different search terms or adjust your filters."
                actionLabel="Clear search"
                onAction={() => setSearch({ q: "", seniority: "all", location: "all", source: "all", availability: "all" })}
              />
            ) : (
              <EmptyState icon={Users} title="No candidates yet"
                description="Import from CSV, upload CVs, connect LinkedIn, or add manually to build your talent pool."
                actionLabel="Add your first candidate" onAction={() => setImportOpen(true)}
              />
            )}
          </div>
        ) : search.view === "board" ? (
          <BoardView rows={pageRows} onOpen={(id) => navigate({ to: "/candidates/$id", params: { id } })} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-brand-bg/80 text-[11px] uppercase tracking-wide text-brand-text-secondary backdrop-blur">
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
                  {cols.name && <th className="px-3 py-2.5 text-left font-semibold">Candidate</th>}
                  {showSim && <th className="w-24 px-3 py-2.5 text-left font-semibold">Similarity</th>}
                  {cols.email && <th className="px-3 py-2.5 text-left font-semibold">Email</th>}
                  {cols.phone && <th className="px-3 py-2.5 text-left font-semibold">Phone</th>}
                  {cols.experience && <th className="px-3 py-2.5 text-left font-semibold">Experience</th>}
                  {cols.skills && <th className="w-[220px] px-3 py-2.5 text-left font-semibold">Skills</th>}
                  {cols.seniority && <th className="px-3 py-2.5 text-left font-semibold">Seniority</th>}
                  {cols.location && <th className="px-3 py-2.5 text-left font-semibold">Location</th>}
                  {cols.linkedJobs && <th className="px-3 py-2.5 text-left font-semibold">Linked jobs</th>}
                  {cols.source && <th className="px-3 py-2.5 text-left font-semibold">Source</th>}
                  {cols.availability && <th className="px-3 py-2.5 text-left font-semibold">Availability</th>}
                  {cols.lastActivity && <th className="px-3 py-2.5 text-left font-semibold">Last activity</th>}
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
                        "cursor-pointer border-b border-gray-50 transition-colors hover:bg-brand-seafoam/15",
                        i % 2 === 1 && "bg-brand-bg/40",
                        c.dnc && "bg-red-50/30 hover:bg-red-50/60",
                      )}
                    >
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={!!selected[c.id]}
                          onCheckedChange={(v) => setSelected((s) => ({ ...s, [c.id]: !!v }))} />
                      </td>
                      {cols.name && (
                        <td className="min-w-[220px] px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.name} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-[13px] font-medium text-brand-text">{c.name}</span>
                                <a href={c.linkedinUrl} target="_blank" rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title="View LinkedIn"
                                  className="text-[#0A66C2] hover:opacity-80"
                                >
                                  <Linkedin className="h-3.5 w-3.5" />
                                </a>
                                {c.dnc && (
                                  <span title="Do not contact"
                                    className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1 py-px text-[10px] font-semibold uppercase text-red-700">
                                    <ShieldAlert className="h-3 w-3" /> DNC
                                  </span>
                                )}
                              </div>
                              {showSim && c.snippet && (
                                <div className="mt-0.5 truncate text-[11px] italic text-brand-primary">{c.snippet}</div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {showSim && (
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <ScoreRing score={sim ?? 0} size="sm" />
                            <span className="text-[12px] font-medium text-brand-text">{sim ?? 0}%</span>
                          </div>
                        </td>
                      )}
                      {cols.email && (
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <EmailPill email={c.email} />
                        </td>
                      )}
                      {cols.phone && (
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <PhonePill phone={c.phone} name={c.name} />
                        </td>
                      )}
                      {cols.experience && (
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="min-w-0">
                              <div className="truncate text-[13px] text-brand-text">
                                <span className="font-medium">{c.title}</span>
                                <span className="text-brand-text-secondary"> at {c.company}</span>
                              </div>
                              <div className="text-[11px] text-brand-text-secondary">
                                {c.yearsInRole} yr{c.yearsInRole !== 1 ? "s" : ""} · {c.experience} yrs total
                              </div>
                            </div>
                            {c.pastRoles.length > 0 && (
                              <OverflowChip count={c.pastRoles.length} onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-2 p-1">
                                  <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">Past roles</div>
                                  {c.pastRoles.map((r, idx) => (
                                    <div key={idx} className="text-xs">
                                      <div className="font-medium text-brand-text">{r.title}</div>
                                      <div className="text-brand-text-secondary">{r.company} · {r.years} yr{r.years !== 1 ? "s" : ""}</div>
                                    </div>
                                  ))}
                                </div>
                              </OverflowChip>
                            )}
                          </div>
                        </td>
                      )}
                      {cols.skills && (
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {c.skills.slice(0, 2).map((s) => (
                              <span key={s} className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium ring-1", skillColor(s))}>
                                {s}
                              </span>
                            ))}
                            {c.skills.length > 2 && (
                              <OverflowChip count={c.skills.length - 2} onClick={(e) => e.stopPropagation()}>
                                <div className="flex max-w-[260px] flex-wrap gap-1 p-1">
                                  {c.skills.map((s) => (
                                    <span key={s} className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium ring-1", skillColor(s))}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </OverflowChip>
                            )}
                          </div>
                        </td>
                      )}
                      {cols.seniority && (
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-brand-primary">
                            {SENIORITY_LABEL[c.seniority]}
                          </span>
                        </td>
                      )}
                      {cols.location && (
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1 text-[12px] text-brand-text-secondary">
                            <MapPin className="h-3 w-3" /> {c.location}
                          </div>
                        </td>
                      )}
                      {cols.linkedJobs && (
                        <td className="px-3 py-2.5">
                          {c.linkedJobs.length === 0 ? (
                            <span className="text-xs text-brand-text-secondary">—</span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1">
                              {c.linkedJobs.slice(0, 1).map((j) => (
                                <span key={j.id} className="inline-flex items-center gap-1 rounded bg-brand-mint/30 px-1.5 py-0.5 text-[11px] text-brand-primary">
                                  <Briefcase className="h-3 w-3" />
                                  <span className="max-w-[120px] truncate">{j.title}</span>
                                </span>
                              ))}
                              {c.linkedJobs.length > 1 && (
                                <OverflowChip count={c.linkedJobs.length - 1} onClick={(e) => e.stopPropagation()}>
                                  <div className="space-y-1.5 p-1">
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">Linked jobs</div>
                                    {c.linkedJobs.map((j) => (
                                      <div key={j.id} className="flex items-center justify-between gap-3 text-xs">
                                        <span className="font-medium text-brand-text">{j.title}</span>
                                        <span className="rounded bg-brand-bg px-1.5 py-0.5 text-[10px] capitalize text-brand-text-secondary">
                                          {j.stage}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </OverflowChip>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      {cols.source && (
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className={cn("inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium", SOURCE_META[c.source].cls)}>
                              <SourceIcon className="h-3 w-3" />
                              {SOURCE_META[c.source].label}
                            </span>
                            {c.source === "inbound" && c.sourceJob && (
                              <span className="truncate text-[10px] text-brand-text-secondary" title={c.sourceJob}>
                                via {c.sourceJob}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {cols.availability && (
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className={cn("inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", AVAIL_CLS[c.availability])}>
                              {AVAIL_LABEL[c.availability]}
                            </span>
                            {c.noticePeriod && (
                              <span className="text-[10px] text-brand-text-secondary">{c.noticePeriod}</span>
                            )}
                          </div>
                        </td>
                      )}
                      {cols.lastActivity && (
                        <td className="px-3 py-2.5 text-[12px] text-brand-text-secondary">
                          {relTime(c.lastActivityDays)}
                        </td>
                      )}
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate({ to: "/candidates/$id", params: { id: c.id } })}>
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Add to job</DropdownMenuItem>
                            <DropdownMenuItem>Start campaign</DropdownMenuItem>
                            <DropdownMenuItem>Add tag</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-status-danger">
                              {c.dnc ? "Remove DNC flag" : "Flag DNC"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-status-danger">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
            <div className="text-xs text-brand-text-secondary">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{" "}
              <span className="font-medium text-brand-text">{filtered.length} candidates</span>
            </div>
            <div className="flex items-center gap-3">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="px-2 text-xs text-brand-text-secondary">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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
function ModePill({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: typeof Search; label: string;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-text-secondary hover:bg-brand-seafoam/40",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all";
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-8 w-auto gap-2 border-gray-200 text-xs", active && "border-brand-primary text-brand-primary")}>
        <div className="flex items-center gap-1.5">
          {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />}
          <span>{label}:</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ViewSettingsMenu({ cols, setCols }: { cols: Record<ColKey, boolean>; setCols: (c: Record<ColKey, boolean>) => void; }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Columns3 className="h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(COL_LABEL) as ColKey[]).map((k) => (
          <DropdownMenuCheckboxItem
            key={k}
            checked={cols[k]}
            onCheckedChange={(v) => setCols({ ...cols, [k]: !!v })}
            onSelect={(e) => e.preventDefault()}
          >
            {COL_LABEL[k]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmailPill({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(email);
    setCopied(true);
    toast.success("Email copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy}
      title={`Copy ${email}`}
      className="group inline-flex max-w-[200px] items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-brand-text-secondary hover:border-brand-primary/40 hover:bg-brand-seafoam/20 hover:text-brand-text"
    >
      <Mail className="h-3 w-3 shrink-0" />
      <span className="truncate">{email}</span>
      {copied ? <Check className="h-3 w-3 shrink-0 text-green-600" /> : <Copy className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100" />}
    </button>
  );
}

function PhonePill({ phone, name }: { phone: string; name: string }) {
  const wa = `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi ${name.split(" ")[0]},`)}`;
  return (
    <div className="flex items-center gap-1">
      <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-brand-text-secondary hover:border-brand-primary/40 hover:text-brand-text">
        <Phone className="h-3 w-3" />
        <span className="tabular-nums">{phone}</span>
      </a>
      <a href={wa} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
        title="Message on WhatsApp"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20">
        <MessageCircle className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function OverflowChip({ count, children, onClick }: { count: number; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild onClick={onClick}>
        <button className="rounded bg-brand-bg px-1.5 py-0.5 text-[11px] font-medium text-brand-primary hover:bg-brand-seafoam/40">
          +{count}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[320px] p-2" onClick={(e) => e.stopPropagation()}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const ch = name[0].toUpperCase();
  const bg =
    ch <= "E" ? "bg-brand-seafoam text-brand-primary"
    : ch <= "J" ? "bg-brand-mint text-brand-primary"
    : ch <= "O" ? "bg-brand-pink/40 text-brand-magenta"
    : ch <= "T" ? "bg-blue-100 text-blue-700"
    : "bg-amber-100 text-amber-700";
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", bg)}>
      {initials}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-4 py-3.5">
          <div className="h-4 w-4 rounded bg-gray-100" />
          <div className="h-8 w-8 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/4 rounded bg-gray-100" />
            <div className="h-3 w-1/3 rounded bg-gray-100" />
          </div>
          <div className="h-5 w-20 rounded bg-gray-100" />
          <div className="h-5 w-24 rounded bg-gray-100" />
          <div className="h-5 w-16 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function BoardView({ rows, onOpen }: { rows: Cand[]; onOpen: (id: string) => void }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((c) => (
        <button key={c.id} onClick={() => onOpen(c.id)}
          className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-brand-primary/40 hover:shadow-sm">
          <div className="flex items-center gap-2">
            <Avatar name={c.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 truncate text-[13px] font-medium text-brand-text">
                {c.name}
                {c.dnc && <ShieldAlert className="h-3 w-3 shrink-0 text-status-danger" />}
              </div>
              <div className="truncate text-[11px] text-brand-text-secondary">{c.title} · {c.company}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-brand-text-secondary">
            <MapPin className="h-3 w-3" /> {c.location}
          </div>
          <div className="flex flex-wrap gap-1">
            {c.skills.slice(0, 3).map((s) => (
              <span key={s} className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium ring-1", skillColor(s))}>{s}</span>
            ))}
            {c.skills.length > 3 && <span className="rounded bg-brand-bg px-1.5 py-0.5 text-[10px] text-brand-primary">+{c.skills.length - 3}</span>}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] text-brand-text-secondary">
            <span className={cn("rounded px-1.5 py-0.5 font-medium", AVAIL_CLS[c.availability])}>{AVAIL_LABEL[c.availability]}</span>
            <span>{relTime(c.lastActivityDays)}</span>
          </div>
        </button>
      ))}
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

function simulateSim(c: Cand, query: string) {
  const q = query.toLowerCase();
  let score = 50;
  const haystack = [c.title, c.company, c.location, ...c.skills].join(" ").toLowerCase();
  q.split(/\s+/).forEach((tok) => {
    if (tok.length < 3) return;
    if (haystack.includes(tok)) score += 8;
  });
  if (c.snippet) score += 6;
  score += (c.name.length % 7) - 3;
  return Math.max(35, Math.min(98, score));
}

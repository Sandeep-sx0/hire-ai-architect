import { useMemo, useState } from "react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
  Link,
} from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  Bot,
  Briefcase,
  Building2,
  Calendar,
  Copy,
  ExternalLink,
  LayoutDashboard,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Star,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  DataTable,
  StatusBadge,
} from "@/components/shared";
import { CreateProjectWizard } from "@/components/projects/CreateProjectWizard";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { CLIENTS } from "./clients";
import { EmptyState } from "@/components/shared";

// ──────────────── Route ────────────────
const tabSchema = z.object({
  tab: fallback(
    z.enum(["overview", "jobs", "contacts", "notes"]),
    "overview",
  ).default("overview"),
});

export const Route = createFileRoute("/_app/clients/$id")({
  validateSearch: zodValidator(tabSchema),
  head: () => ({ meta: [{ title: "Client — HireSmart" }] }),
  component: ClientDetailPage,
});

// ──────────────── Per-client overlay (fields not in list seed) ────────────────
const CLIENT_DETAIL_OVERLAY: Record<
  string,
  { location: string; contacts: number; since: string; portalLastAccessed: string }
> = {
  indorama: { location: "Jakarta, Indonesia", contacts: 4, since: "Jan 2024", portalLastAccessed: "3 days ago" },
  oyo: { location: "Gurugram, India", contacts: 3, since: "May 2024", portalLastAccessed: "1 week ago" },
  kns: { location: "Jakarta, Indonesia", contacts: 2, since: "Aug 2024", portalLastAccessed: "4 days ago" },
  oasis: { location: "Dubai, UAE", contacts: 2, since: "Nov 2024", portalLastAccessed: "2 weeks ago" },
  stylo: { location: "Singapore", contacts: 3, since: "Feb 2025", portalLastAccessed: "Yesterday" },
};

function getClientById(id: string) {
  const row = CLIENTS.find((c) => c.id === id);
  if (!row) return null;
  const overlay = CLIENT_DETAIL_OVERLAY[id] ?? {
    location: "—",
    contacts: 1,
    since: "2025",
    portalLastAccessed: "Recently",
  };
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    openProjects: row.openProjects,
    placements: row.placements,
    portalToken: row.portalToken,
    ...overlay,
  };
}

interface ProjectRow {
  id: string;
  title: string;
  status:
    | "shortlisted"
    | "sourcing"
    | "interviewing"
    | "placed"
    | "closed";
  candidates: number;
  assigned: string;
  created: string;
  createdRank: number;
  placedDate?: string;
}

const PROJECTS: ProjectRow[] = [
  {
    id: "p1",
    title: "Chief Financial Officer",
    status: "shortlisted",
    candidates: 14,
    assigned: "Amarsh",
    created: "Mar 12, 2026",
    createdRank: 20260312,
  },
  {
    id: "p2",
    title: "VP Operations — SEA",
    status: "sourcing",
    candidates: 22,
    assigned: "Dewi",
    created: "Feb 28, 2026",
    createdRank: 20260228,
  },
  {
    id: "p3",
    title: "Plant Manager — Cikarang",
    status: "interviewing",
    candidates: 6,
    assigned: "Rahul",
    created: "Mar 5, 2026",
    createdRank: 20260305,
  },
  {
    id: "p4",
    title: "Head of Digital Transformation",
    status: "placed",
    candidates: 9,
    assigned: "Amarsh",
    created: "Aug 2025",
    createdRank: 20250801,
    placedDate: "Nov 2025",
  },
  {
    id: "p5",
    title: "Regional Sales Director",
    status: "closed",
    candidates: 5,
    assigned: "Dewi",
    created: "Jun 2025",
    createdRank: 20250601,
  },
];

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  isPrimary: boolean;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Rajesh Kumar",
    title: "Chief Human Resources Officer",
    email: "rajesh.kumar@indorama.com",
    phone: "+62 811 234 5678",
    whatsapp: "62811234 5678",
    linkedin: "linkedin.com/in/rajesh-kumar",
    isPrimary: true,
  },
  {
    id: "c2",
    name: "Suwat Chanond",
    title: "Chief Executive Officer",
    email: "suwat.c@indorama.com",
    phone: "+66 89 123 4567",
    whatsapp: "66891234567",
    linkedin: "linkedin.com/in/suwat-chanond",
    isPrimary: false,
  },
  {
    id: "c3",
    name: "Prateek Gupta",
    title: "VP Talent Acquisition",
    email: "prateek.g@indorama.com",
    phone: "+62 812 987 6543",
    whatsapp: "628129876543",
    linkedin: "linkedin.com/in/prateek-gupta",
    isPrimary: false,
  },
  {
    id: "c4",
    name: "Linda Hartono",
    title: "HR Manager — Indonesia",
    email: "linda.h@indorama.co.id",
    phone: "+62 813 456 7890",
    whatsapp: "628134567890",
    linkedin: "linkedin.com/in/linda-hartono",
    isPrimary: false,
  },
];

interface Note {
  id: string;
  author: string;
  isSystem?: boolean;
  isPrivate?: boolean;
  date: string;
  body: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    author: "Amarsh",
    date: "2 days ago",
    body: "Met with Rajesh to discuss CFO search progress. He's happy with the shortlist quality. Wants candidate briefs by Friday. Mentioned they may have a VP Supply Chain role opening in Q3.",
  },
  {
    id: "n2",
    author: "Dewi",
    date: "1 week ago",
    body: "VP Operations search expanding to include Singapore-based candidates. Anita (OYO) referred two contacts at Accor who may know candidates.",
  },
  {
    id: "n3",
    author: "Amarsh",
    date: "2 weeks ago",
    body: "Plant Manager role submitted via employer portal. Hendro wants someone from automotive manufacturing — says chemical background is a plus but not required.",
  },
  {
    id: "n4",
    author: "System",
    isSystem: true,
    date: "3 weeks ago",
    body: "Employer portal: Indorama submitted new role — Plant Manager, Cikarang",
  },
  {
    id: "n5",
    author: "Amarsh",
    date: "1 month ago",
    body: "Quarterly review call with Rajesh. 3 active mandates, 7 lifetime placements. Strong relationship — they've referred KNS Group to us.",
  },
  {
    id: "n6",
    author: "Amarsh",
    date: "Jan 2024",
    body: "Initial meeting with Rajesh Kumar at Indorama. Discussed executive recruitment needs for Indonesia operations. Signed retainer for first mandate (Head of Digital Transformation).",
  },
];

// ──────────────── Page ────────────────
function ClientDetailPage() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [regenOpen, setRegenOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const CLIENT = getClientById(id);
  if (!CLIENT) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <EmptyState
          icon={Building2}
          title="Client not found"
          description={`No client with ID "${id}" exists. They may have been removed or the link may be stale.`}
          actionLabel="Back to clients"
          onAction={() => navigate({ to: "/clients" })}
        />
      </div>
    );
  }

  const portalUrl = `hire.hiresmart.com/portal/${CLIENT.portalToken}`;

  const copyPortal = () => {
    navigator.clipboard?.writeText(portalUrl).catch(() => {});
    toast.success(`Portal link copied: ${portalUrl}`);
  };

  const setTab = (next: typeof tab) => {
    navigate({ to: "/clients/$id", params: { id }, search: { tab: next } });
  };

  return (
    <div className="space-y-4">
      {/* Client header card */}
      <header className="rounded-xl border border-gray-100 bg-card p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-brand-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight text-brand-text">
                {CLIENT.name}
              </h1>
              <p className="mt-0.5 text-[14px] text-brand-text-secondary">
                {CLIENT.industry}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-brand-text-secondary">
                <MapPin className="h-3.5 w-3.5" />
                {CLIENT.location}
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center gap-2">
            <StatPill label="Open projects" value={`${CLIENT.openProjects} active`} valueClass="text-status-success" />
            <StatPill label="Placements" value={`${CLIENT.placements} placed`} />
            <StatPill label="Contacts" value={`${CLIENT.contacts} contacts`} />
            <StatPill label="Client since" value={CLIENT.since} />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={() => setWizardOpen(true)}
              className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              <Plus className="h-4 w-4" />
              New project
            </Button>
            <Button variant="outline" className="gap-2" onClick={copyPortal}>
              <ExternalLink className="h-4 w-4" />
              Portal link
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast("Edit company (coming soon)")}>
                  Edit company
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRegenOpen(true)}>
                  Regenerate portal link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast("Client archived")}>
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-status-danger focus:text-status-danger"
                  onClick={() => toast.error("Confirm deletion in dialog")}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={LayoutDashboard} label="Overview" />
        <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={Briefcase} label="Jobs" badge="3 active" />
        <TabButton active={tab === "contacts"} onClick={() => setTab("contacts")} icon={Users} label="Contacts" badge="4" />
        <TabButton active={tab === "notes"} onClick={() => setTab("notes")} icon={StickyNote} label="Notes" badge="6" />
      </nav>

      {tab === "overview" && <OverviewTab portalUrl={portalUrl} portalLastAccessed={CLIENT.portalLastAccessed} onRegenerate={() => setRegenOpen(true)} onCopy={copyPortal} />}
      {tab === "jobs" && <JobsTab />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "notes" && <NotesTab />}

      <RegenerateDialog open={regenOpen} onOpenChange={setRegenOpen} />
      <CreateProjectWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        defaultClientId={id}
      />
    </div>
  );
}

// ──────────────── Header bits ────────────────
function StatPill({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-full border border-border bg-card px-3 py-1.5">
      <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">{label}</div>
      <div className={cn("text-[13px] font-medium text-brand-text", valueClass)}>{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors",
        active
          ? "border-brand-primary text-brand-primary"
          : "border-transparent text-brand-text-secondary hover:text-brand-text",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge && (
        <span className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
          active ? "bg-brand-seafoam/40 text-brand-primary" : "bg-muted text-brand-text-secondary",
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ──────────────── Overview tab ────────────────
function OverviewTab({
  portalUrl,
  portalLastAccessed,
  onRegenerate,
  onCopy,
}: {
  portalUrl: string;
  portalLastAccessed: string;
  onRegenerate: () => void;
  onCopy: () => void;
}) {
  const activeProjects = PROJECTS.filter((p) => p.status !== "placed" && p.status !== "closed");
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Left column */}
      <div className="space-y-4 lg:col-span-3">
        <Card title="Revenue summary">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Active searches" value="3" />
            <MiniStat label="Total placements" value="7" />
            <MiniStat label="Avg time-to-fill" value="6.2 wks" />
            <MiniStat label="Success rate" value="78%" />
          </div>
        </Card>

        <Card title="Active projects">
          <div className="divide-y divide-border">
            {activeProjects.map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-brand-seafoam/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-brand-text">{p.title}</div>
                  <div className="text-[12px] text-brand-text-secondary">
                    {p.candidates} candidates · Assigned to {p.assigned}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-4 lg:col-span-2">
        <Card title="Recent activity">
          <ul className="space-y-3 text-sm">
            {[
              { who: "Amarsh", what: "shortlisted 5 candidates for CFO Search", when: "2 days ago" },
              { who: "Client portal", what: "Indorama submitted Plant Manager role", when: "5 days ago" },
              { who: "Dewi", what: "created campaign for VP Operations", when: "1 week ago" },
              { who: "Placed", what: "Head of Digital Transformation", when: "2 months ago" },
              { who: "Amarsh", what: "added Indorama Ventures as a client", when: "Jan 2024" },
            ].map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                <div className="min-w-0">
                  <div className="text-[13px] text-brand-text">
                    <span className="font-medium">{a.who}</span> {a.what}
                  </div>
                  <div className="text-[11px] text-brand-text-secondary">{a.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Portal access">
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-brand-bg px-3 py-2 text-[13px]">
              <code className="flex-1 truncate text-brand-text">{portalUrl}</code>
              <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={onCopy}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <div className="text-[12px] text-brand-text-secondary">
              Last accessed: {CLIENT.portalLastAccessed}
            </div>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-status-danger hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate link
            </button>
            <p className="text-[12px] leading-relaxed text-brand-text-secondary">
              Share this link with your client. They can submit roles and track progress without logging in.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-[14px] font-semibold uppercase tracking-wide text-brand-text-secondary">
        {title}
      </h3>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-brand-bg/60 px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wide text-brand-text-secondary">{label}</div>
      <div className="mt-0.5 text-[18px] font-semibold tabular-nums text-brand-text">{value}</div>
    </div>
  );
}

// ──────────────── Jobs tab ────────────────
function JobsTab() {
  const [filter, setFilter] = useState<"active" | "all" | "placed">("active");

  const rows = useMemo(() => {
    if (filter === "active") return PROJECTS.filter((p) => p.status !== "placed" && p.status !== "closed");
    if (filter === "placed") return PROJECTS.filter((p) => p.status === "placed");
    return PROJECTS;
  }, [filter]);

  const navigate = useNavigate();

  const columns: DataTableColumn<ProjectRow>[] = [
    {
      key: "title",
      header: "Project",
      sortable: true,
      accessor: (r) => r.title,
      render: (r) => (
        <button
          type="button"
          onClick={() => navigate({ to: "/projects/$id", params: { id: r.id } })}
          className="text-left text-sm font-medium text-brand-text hover:text-brand-primary"
        >
          {r.title}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => r.status,
      className: "w-[130px]",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "candidates",
      header: "Candidates",
      sortable: true,
      accessor: (r) => r.candidates,
      className: "w-[110px]",
      render: (r) => <span className="text-sm tabular-nums">{r.candidates}</span>,
    },
    {
      key: "assigned",
      header: "Assigned to",
      sortable: true,
      accessor: (r) => r.assigned,
      className: "w-[140px]",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-medium text-brand-primary">
            {r.assigned[0]}
          </span>
          <span className="text-sm text-brand-text">{r.assigned}</span>
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      sortable: true,
      accessor: (r) => -r.createdRank,
      className: "w-[120px]",
      render: (r) => <span className="text-[13px] text-brand-text-secondary">{r.created}</span>,
    },
    {
      key: "placed",
      header: "Placed date",
      className: "w-[110px]",
      render: (r) => (
        <span className="text-[13px] text-brand-text-secondary">{r.placedDate ?? "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FilterToggle
          options={[
            { value: "active", label: "Active only" },
            { value: "all", label: "All" },
            { value: "placed", label: "Placed" },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as "active" | "all" | "placed")}
        />
        <span className="ml-auto text-[12px] text-brand-text-secondary">
          {rows.length} project{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <DataTable<ProjectRow> columns={columns} data={rows} />
    </div>
  );
}

function FilterToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] transition-colors",
            value === o.value
              ? "bg-brand-primary text-white"
              : "text-brand-text-secondary hover:text-brand-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ──────────────── Contacts tab ────────────────
function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [addOpen, setAddOpen] = useState(false);

  const initials = (name: string) =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-brand-text">{contacts.length} contacts</h3>
        <Button
          size="sm"
          className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add contact
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {contacts.map((c) => (
          <article
            key={c.id}
            className="group relative rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
          >
            {/* Hover actions */}
            <div className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast("Edit contact")}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-status-danger hover:text-status-danger"
                onClick={() =>
                  setContacts((s) => s.filter((x) => x.id !== c.id))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-[13px] font-medium text-brand-primary">
                {initials(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[15px] font-medium text-brand-text">{c.name}</h4>
                  {c.isPrimary && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                </div>
                <p className="text-[13px] text-brand-text-secondary">{c.title}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-[13px]">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-brand-text-secondary" />
                <a href={`mailto:${c.email}`} className="truncate text-brand-primary hover:underline">
                  {c.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-brand-text-secondary" />
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-brand-primary hover:underline">
                  {c.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <a
                  href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  {c.phone} (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Linkedin className="h-3.5 w-3.5 shrink-0 text-[#0A66C2]" />
                <a
                  href={`https://${c.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-brand-primary hover:underline"
                >
                  {c.linkedin}
                </a>
              </li>
            </ul>

            {c.isPrimary && (
              <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-amber-600">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Primary contact
              </div>
            )}
          </article>
        ))}
      </div>

      <AddContactDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(c) => {
          setContacts((s) => {
            const next = c.isPrimary ? s.map((x) => ({ ...x, isPrimary: false })) : s;
            return [...next, { ...c, id: `c${Date.now()}` }];
          });
          setAddOpen(false);
          toast.success(`${c.name} added`);
        }}
      />
    </div>
  );
}

function AddContactDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (c: Omit<Contact, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const canSubmit = name.trim().length > 0;

  const reset = () => {
    setName(""); setTitle(""); setEmail(""); setPhone(""); setWhatsapp(""); setLinkedin(""); setIsPrimary(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Labeled label="Full name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </Labeled>
          <Labeled label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </Labeled>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
            </Labeled>
            <Labeled label="Phone">
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
            </Labeled>
            <Labeled label="WhatsApp">
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={40} />
            </Labeled>
            <Labeled label="LinkedIn URL">
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} maxLength={200} />
            </Labeled>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-brand-bg/60 px-3 py-2">
            <span className="text-[13px] text-brand-text">Set as primary contact</span>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!canSubmit}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
            onClick={() =>
              onCreate({ name: name.trim(), title, email, phone, whatsapp, linkedin, isPrimary })
            }
          >
            Add contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Labeled({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-brand-text">
        {label}
        {required && <span className="ml-0.5 text-status-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

// ──────────────── Notes tab ────────────────
function NotesTab() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [draft, setDraft] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const add = () => {
    const body = draft.trim();
    if (!body) return;
    setNotes((s) => [
      { id: `n${Date.now()}`, author: "You", date: "Just now", body, isPrivate },
      ...s,
    ]);
    setDraft("");
    setIsPrivate(false);
    toast.success("Note added");
  };

  const initials = (n: string) =>
    n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder="Add a note about this client…"
        />
        <div className="mt-3 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-[13px] text-brand-text-secondary">
            <Lock className="h-3.5 w-3.5" />
            Private note
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </label>
          <Button
            disabled={!draft.trim()}
            onClick={add}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            Add note
          </Button>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {notes.map((n) => (
          <li
            key={n.id}
            className={cn(
              "rounded-xl border border-border p-4",
              n.isSystem ? "bg-brand-bg" : "bg-card",
            )}
          >
            <header className="flex items-center gap-2">
              {n.isSystem ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam/40">
                  <Bot className="h-3.5 w-3.5 text-brand-primary" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-seafoam text-[11px] font-medium text-brand-primary">
                  {initials(n.author)}
                </div>
              )}
              <span className="text-sm font-medium text-brand-text">{n.author}</span>
              <span className="text-[12px] text-brand-text-secondary">· {n.date}</span>
              {n.isPrivate && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-brand-text-secondary">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
            </header>
            <p className="mt-2 text-[14px] leading-relaxed text-brand-text">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ──────────────── Regenerate dialog ────────────────
function RegenerateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Regenerate portal link?</AlertDialogTitle>
          <AlertDialogDescription>
            The existing link will stop working immediately. Anyone using the old URL will see a
            "Portal unavailable" message. You'll need to share the new link with your client.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-status-danger text-white hover:bg-status-danger/90"
            onClick={() => toast.success("Portal link regenerated")}
          >
            Regenerate link
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

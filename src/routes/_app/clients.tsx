import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  MoreHorizontal,
  Plus,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, StatusBadge } from "@/components/shared";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ──────────────── Mock data (shared with detail) ────────────────
export interface ClientRow {
  id: string;
  name: string;
  industry: string;
  status: "active" | "inactive";
  openProjects: number;
  placements: number;
  primaryContact: { name: string; title: string };
  lastActivity: string;
  lastActivityRank: number;
  portalToken: string;
}

export const CLIENTS: ClientRow[] = [
  {
    id: "indorama",
    name: "Indorama Ventures",
    industry: "Manufacturing / Petrochemicals",
    status: "active",
    openProjects: 3,
    placements: 7,
    primaryContact: { name: "Rajesh Kumar", title: "CHRO" },
    lastActivity: "2 days ago",
    lastActivityRank: 2,
    portalToken: "indorama-portal-2026",
  },
  {
    id: "oyo",
    name: "OYO Hotels",
    industry: "Hospitality",
    status: "active",
    openProjects: 2,
    placements: 3,
    primaryContact: { name: "Anita Desai", title: "VP People" },
    lastActivity: "1 week ago",
    lastActivityRank: 7,
    portalToken: "oyo-portal-2026",
  },
  {
    id: "kns",
    name: "KNS Group",
    industry: "Manufacturing",
    status: "active",
    openProjects: 1,
    placements: 2,
    primaryContact: { name: "Hendro Wijono", title: "CEO" },
    lastActivity: "5 days ago",
    lastActivityRank: 5,
    portalToken: "kns-portal-2026",
  },
  {
    id: "oasis",
    name: "Oasis Water International",
    industry: "Consumer Goods / FMCG",
    status: "active",
    openProjects: 1,
    placements: 1,
    primaryContact: { name: "Mark Stevens", title: "COO" },
    lastActivity: "2 weeks ago",
    lastActivityRank: 14,
    portalToken: "oasis-portal-2026",
  },
  {
    id: "stylo",
    name: "Stylo International",
    industry: "Fashion / Retail",
    status: "active",
    openProjects: 1,
    placements: 0,
    primaryContact: { name: "Diana Lim", title: "Head of HR" },
    lastActivity: "1 day ago",
    lastActivityRank: 1,
    portalToken: "stylo-portal-2026",
  },
];

const INDUSTRIES = [
  "Manufacturing",
  "Hospitality",
  "Technology",
  "Consumer Goods",
  "F&B",
  "Healthcare",
  "Finance",
  "Other",
] as const;

// ──────────────── Route ────────────────
export const Route = createFileRoute("/_app/clients")({
  head: () => ({ meta: [{ title: "Clients — HireSmart" }] }),
  component: ClientsListPage,
});

function ClientsListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return CLIENTS.filter((c) => {
      if (q && !`${c.name} ${c.industry}`.toLowerCase().includes(q)) return false;
      if (industry !== "all" && !c.industry.toLowerCase().includes(industry.toLowerCase()))
        return false;
      if (status === "active" && c.openProjects === 0) return false;
      if (status === "inactive" && c.openProjects > 0) return false;
      return true;
    });
  }, [query, industry, status]);

  const filtersActive = (query ? 1 : 0) + (industry !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0);

  const columns: DataTableColumn<ClientRow>[] = [
    {
      key: "company",
      header: "Company",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Building2 className="h-4 w-4 shrink-0 text-brand-text-secondary" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-brand-text">{r.name}</div>
            <div className="text-[12px] text-brand-text-secondary">{r.industry}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (r) => r.status,
      className: "w-[100px]",
      render: (r) => (
        <StatusBadge
          status={r.openProjects > 0 ? "active" : "archived"}
          label={r.openProjects > 0 ? "Active" : "Inactive"}
        />
      ),
    },
    {
      key: "openProjects",
      header: "Open projects",
      sortable: true,
      accessor: (r) => r.openProjects,
      className: "w-[110px]",
      render: (r) => (
        <span className="text-sm tabular-nums text-brand-text">
          {r.openProjects > 0 ? `${r.openProjects} project${r.openProjects > 1 ? "s" : ""}` : "—"}
        </span>
      ),
    },
    {
      key: "placements",
      header: "Total placements",
      sortable: true,
      accessor: (r) => r.placements,
      className: "w-[110px]",
      render: (r) => (
        <span className="text-sm tabular-nums text-brand-text">{r.placements} placed</span>
      ),
    },
    {
      key: "contact",
      header: "Primary contact",
      sortable: true,
      accessor: (r) => r.primaryContact.name,
      className: "w-[170px]",
      render: (r) => (
        <div>
          <div className="text-[13px] text-brand-text">{r.primaryContact.name}</div>
          <div className="text-[12px] text-brand-text-secondary">{r.primaryContact.title}</div>
        </div>
      ),
    },
    {
      key: "lastActivity",
      header: "Last activity",
      sortable: true,
      accessor: (r) => -r.lastActivityRank,
      className: "w-[120px]",
      render: (r) => (
        <span className="text-[13px] text-brand-text-secondary">{r.lastActivity}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[40px]",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate({ to: "/clients/$id", params: { id: r.id } })}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Edit client (coming soon)")}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(`hire.hiresmart.com/portal/${r.portalToken}`)
                    .catch(() => {});
                  toast.success(`Portal link copied: hire.hiresmart.com/portal/${r.portalToken}`);
                }}
              >
                Portal link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("Client archived")}>
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-status-danger focus:text-status-danger"
                onClick={() => toast.error("Delete is irreversible — confirm in dialog")}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Wrap DataTable rows with row-click navigation by rendering a clickable overlay column.
  // The shared DataTable has no row click handler, so we mirror its rendering with row links via the company cell.
  // Simpler: provide a navigate handler in the Company cell.
  const columnsWithClick: DataTableColumn<ClientRow>[] = columns.map((col, i) =>
    i === 0
      ? {
          ...col,
          render: (r) => (
            <button
              type="button"
              onClick={() => navigate({ to: "/clients/$id", params: { id: r.id } })}
              className="-m-2 flex items-center gap-2.5 rounded-md p-2 text-left hover:bg-transparent"
            >
              <Building2 className="h-4 w-4 shrink-0 text-brand-text-secondary" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-brand-text hover:text-brand-primary">
                  {r.name}
                </div>
                <div className="text-[12px] text-brand-text-secondary">{r.industry}</div>
              </div>
            </button>
          ),
        }
      : col,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clients"
        subtitle={`${CLIENTS.length} companies`}
        actions={
          <Button
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative w-full max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name or industry..."
            className="pl-9"
          />
        </div>

        <FilterSelect
          label="Industry"
          value={industry}
          onChange={setIndustry}
          options={[
            { value: "all", label: "All industries" },
            ...INDUSTRIES.map((v) => ({ value: v.toLowerCase(), label: v })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        {filtersActive > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIndustry("all");
              setStatus("all");
            }}
            className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <DataTable<ClientRow> columns={columnsWithClick} data={filtered} />

      <AddClientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(id) => {
          setAddOpen(false);
          navigate({ to: "/clients/$id", params: { id } });
        }}
      />
    </div>
  );
}

// ──────────────── Filter select ────────────────
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
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-brand-text-secondary">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-w-[140px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ──────────────── Add client dialog ────────────────
function AddClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [hq, setHq] = useState("");
  const [size, setSize] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [notes, setNotes] = useState("");

  const [contactOpen, setContactOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cTitle, setCTitle] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cWa, setCWa] = useState("");
  const [cLi, setCLi] = useState("");

  const canSubmit = name.trim().length > 0 && (!contactOpen || cName.trim().length > 0);

  const reset = () => {
    setName(""); setIndustry(""); setWebsite(""); setHq(""); setSize("");
    setTags([]); setTagDraft(""); setNotes("");
    setContactOpen(false);
    setCName(""); setCTitle(""); setCEmail(""); setCPhone(""); setCWa(""); setCLi("");
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setTagDraft("");
  };

  const submit = () => {
    if (!canSubmit) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-client";
    toast.success(`${name.trim()} added`);
    reset();
    onCreated(id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>
            Create a new client record. You can add more contacts and notes later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Company name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Indorama Ventures"
              maxLength={140}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry">
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Company size">
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["1-50","51-200","201-1000","1001-5000","5000+"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Website">
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                maxLength={200}
              />
            </Field>
            <Field label="HQ location">
              <Input
                value={hq}
                onChange={(e) => setHq(e.target.value)}
                placeholder="Jakarta, Indonesia"
                maxLength={120}
              />
            </Field>
          </div>

          <Field label="Tags">
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-seafoam/40 px-2 py-0.5 text-[11px] text-brand-primary"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags((s) => s.filter((x) => x !== t))}
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder={tags.length ? "" : "Add tag…"}
                className="min-w-[80px] flex-1 bg-transparent text-sm outline-none"
                maxLength={40}
              />
            </div>
          </Field>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder="Internal notes about this client…"
            />
          </Field>

          {/* Primary contact (collapsible) */}
          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setContactOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-brand-text"
            >
              <span>{contactOpen ? "Primary contact" : "Add primary contact"}</span>
              {contactOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {contactOpen && (
              <div className="space-y-3 border-t border-border p-3">
                <Field label="Full name" required>
                  <Input value={cName} onChange={(e) => setCName(e.target.value)} maxLength={120} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title">
                    <Input value={cTitle} onChange={(e) => setCTitle(e.target.value)} maxLength={120} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} maxLength={160} />
                  </Field>
                  <Field label="Phone">
                    <Input type="tel" value={cPhone} onChange={(e) => setCPhone(e.target.value)} maxLength={40} />
                  </Field>
                  <Field label="WhatsApp">
                    <Input value={cWa} onChange={(e) => setCWa(e.target.value)} maxLength={40} />
                  </Field>
                </div>
                <Field label="LinkedIn URL">
                  <Input value={cLi} onChange={(e) => setCLi(e.target.value)} placeholder="linkedin.com/in/…" maxLength={200} />
                </Field>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!canSubmit}
            onClick={submit}
            className={cn("bg-brand-primary text-white hover:bg-brand-primary/90", !canSubmit && "opacity-50")}
          >
            Add client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-brand-text">
        {label}
        {required && <span className="ml-0.5 text-status-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

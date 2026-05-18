import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  User,
  Users,
  Palette,
  Link as LinkIcon,
  CreditCard,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Upload,
  Download,
  Chrome,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — HireSmart" }] }),
  component: SettingsPage,
});

// ---------- Types & mock data ----------
type Role = "Owner" | "Admin" | "Recruiter" | "Sourcer";
type TabId = "profile" | "team" | "workspace" | "integrations" | "billing" | "extension";

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof User;
  access: Role[];
}

const TABS: TabDef[] = [
  { id: "profile", label: "Profile", icon: User, access: ["Owner", "Admin", "Recruiter", "Sourcer"] },
  { id: "team", label: "Team", icon: Users, access: ["Owner", "Admin"] },
  { id: "workspace", label: "Workspace", icon: Palette, access: ["Owner", "Admin"] },
  { id: "integrations", label: "Integrations", icon: LinkIcon, access: ["Owner", "Admin"] },
  { id: "billing", label: "Billing", icon: CreditCard, access: ["Owner"] },
  { id: "extension", label: "Chrome Extension", icon: Chrome, access: ["Owner", "Admin", "Recruiter", "Sourcer"] },
];

// Current user — mock as Owner for prototype
const CURRENT_ROLE: Role = "Owner";

function SettingsPage() {
  const allowedTabs = TABS.filter((t) => t.access.includes(CURRENT_ROLE));
  const defaultTab: TabId =
    CURRENT_ROLE === "Recruiter" || CURRENT_ROLE === "Sourcer" ? "profile" : "team";
  const [active, setActive] = useState<TabId>(defaultTab);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your workspace, team, and integrations"
      />

      {/* Mobile horizontal pill nav */}
      <div className="mb-6 -mx-6 overflow-x-auto px-6 lg:hidden">
        <div className="flex gap-2">
          {allowedTabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm",
                  isActive
                    ? "border-brand-primary bg-brand-seafoam/30 text-brand-primary font-medium"
                    : "border-gray-200 text-brand-text-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Left vertical nav */}
        <aside className="hidden lg:col-span-1 lg:block">
          <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
            Settings
          </p>
          <nav className="flex flex-col gap-1">
            {allowedTabs.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-brand-seafoam/20 text-brand-primary font-medium"
                      : "text-brand-text-secondary hover:bg-brand-bg",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right content */}
        <main className="lg:col-span-3">
          {active === "profile" && <ProfileTab />}
          {active === "team" && <TeamTab />}
          {active === "workspace" && <WorkspaceTab />}
          {active === "integrations" && <IntegrationsTab />}
          {active === "billing" && <BillingTab />}
          {active === "extension" && <ExtensionTab />}
        </main>
      </div>
    </div>
  );
}

// ---------- Reusable card ----------
function SCard({
  title,
  divided,
  children,
}: {
  title?: string;
  divided?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6">
      {title && (
        <h2
          className={cn(
            "text-[16px] font-medium text-brand-text",
            divided ? "mb-4 border-b border-gray-100 pb-4" : "mb-4",
          )}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-brand-text">{label}</Label>
      {children}
    </div>
  );
}

// ---------- Profile tab ----------
function ProfileTab() {
  const [linkedinConnected] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <SCard title="Personal information" divided>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input defaultValue="Amarsh Jain" />
          </Field>
          <Field label="Email">
            <Input defaultValue="amarsh@hiresmart.com" disabled />
          </Field>
          <Field label="Role">
            <div className="flex h-10 items-center">
              <span className="inline-flex items-center rounded-full bg-brand-magenta/15 px-2.5 py-0.5 text-xs font-medium text-brand-magenta">
                Owner
              </span>
            </div>
          </Field>
          <Field label="Phone">
            <Input defaultValue="+62 819 4421 0355" />
          </Field>
          <Field label="Timezone">
            <Select defaultValue="jakarta">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jakarta">Asia/Jakarta (GMT+7)</SelectItem>
                <SelectItem value="singapore">Asia/Singapore (GMT+8)</SelectItem>
                <SelectItem value="london">Europe/London (GMT+0)</SelectItem>
                <SelectItem value="ny">America/New_York (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => toast.success("Profile updated")}>Save changes</Button>
        </div>
      </SCard>

      <SCard title="Password" divided>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Current password">
            <Input type="password" />
          </Field>
          <Field label="New password">
            <Input type="password" />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" />
          </Field>
        </div>
        <p className="mt-2 text-xs text-brand-text-secondary">
          Minimum 8 characters, one uppercase, one number
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => toast.success("Password updated")}>Update password</Button>
        </div>
      </SCard>

      <SCard title="Notifications" divided>
        <div className="flex flex-col gap-4">
          {[
            { l: "New inbox replies", d: "Get notified when candidates reply to outreach" },
            { l: "Match results ready", d: "Get notified when AI matching completes" },
            { l: "Inbound applications", d: "Get notified when candidates apply via the portal" },
            { l: "Client portal submissions", d: "Get notified when clients submit new roles" },
            { l: "Weekly digest", d: "Receive a weekly summary of activity" },
          ].map((n) => (
            <div key={n.l} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-text">{n.l}</p>
                <p className="text-xs text-brand-text-secondary">{n.d}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </SCard>

      <SCard title="LinkedIn connection status" divided>
        {linkedinConnected ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-status-success" />
              <div>
                <p className="text-sm font-medium text-brand-text">LinkedIn connected</p>
                <p className="text-[13px] text-brand-text-secondary">
                  Amarsh Jain — 1,247 connections
                </p>
                <p className="text-xs text-brand-text-secondary">
                  Connected via Unipile on Mar 1, 2026
                </p>
              </div>
            </div>
            <button className="text-sm font-medium text-status-danger hover:underline">
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-status-warning" />
              <div>
                <p className="text-sm font-medium text-brand-text">LinkedIn not connected</p>
                <p className="text-[13px] text-brand-text-secondary">
                  Connect your LinkedIn account to send outreach messages.
                </p>
              </div>
            </div>
            <Button>Connect LinkedIn</Button>
          </div>
        )}
      </SCard>
    </div>
  );
}

// ---------- Team tab ----------
interface TeamMember {
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Deactivated";
  linkedin: boolean;
  lastActive: string;
}

const MOCK_TEAM: TeamMember[] = [
  { name: "Amarsh Jain", email: "amarsh@hiresmart.com", role: "Owner", status: "Active", linkedin: true, lastActive: "2 hours ago" },
  { name: "Dewi Putri", email: "dewi@hiresmart.com", role: "Recruiter", status: "Active", linkedin: true, lastActive: "5 hours ago" },
  { name: "Rahul Mehta", email: "rahul@hiresmart.com", role: "Recruiter", status: "Active", linkedin: false, lastActive: "Yesterday" },
];

const ROLE_COLOR: Record<Role, string> = {
  Owner: "bg-brand-magenta/15 text-brand-magenta",
  Admin: "bg-status-info/15 text-status-info",
  Recruiter: "bg-status-success/15 text-status-success",
  Sourcer: "bg-status-neutral/15 text-status-neutral",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function TeamTab() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<TeamMember | null>(null);
  const [permOpen, setPermOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <SCard>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-brand-text">Team members</h2>
            <p className="text-[13px] text-brand-text-secondary">3 of 3 seats used</p>
          </div>
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite member
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-brand-text-secondary">
                <th className="py-2 pr-4 font-medium">Member</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">LinkedIn</th>
                <th className="py-2 pr-4 font-medium">Last active</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAM.map((m) => (
                <tr key={m.email} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-seafoam/40 text-xs font-semibold text-brand-primary">
                        {initials(m.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-text">{m.name}</p>
                        <p className="text-xs text-brand-text-secondary">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", ROLE_COLOR[m.role])}>
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          m.status === "Active" ? "bg-status-success" : "bg-gray-300",
                        )}
                      />
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {m.linkedin ? (
                      <CheckCircle className="h-4 w-4 text-status-success" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-brand-text-secondary">{m.lastActive}</td>
                  <td className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Change role</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeactivateTarget(m)}>
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-status-danger">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-[13px] text-brand-text-secondary">
          <span>3 of 3 seats used. Additional seats: $25/seat/month.</span>
          <button className="font-medium text-brand-primary hover:underline">Add seat</button>
        </div>
      </SCard>

      <SCard>
        <button
          onClick={() => setPermOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-[16px] font-medium text-brand-text">Role permissions</span>
          {permOpen ? (
            <ChevronDown className="h-4 w-4 text-brand-text-secondary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-brand-text-secondary" />
          )}
        </button>
        {permOpen && <PermissionsTable />}
      </SCard>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to the workspace. Their data (notes, scorecards, outreach
              history) will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-status-danger text-white hover:bg-status-danger/90"
              onClick={() => {
                toast.success(`${deactivateTarget?.name} deactivated`);
                setDeactivateTarget(null);
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PermissionsTable() {
  const rows: Array<[string, string, string, string, string]> = [
    ["Billing & plans", "✅", "❌", "❌", "❌"],
    ["User management", "✅", "✅", "❌", "❌"],
    ["Workspace settings", "✅", "✅", "❌", "❌"],
    ["Projects", "✅", "✅", "✅", "👁"],
    ["Candidates", "✅", "✅", "✅", "✅"],
    ["Outreach", "✅", "✅", "✅", "❌"],
    ["Inbox", "✅", "✅", "✅", "❌"],
    ["Pipeline", "✅", "✅", "✅", "👁"],
    ["Analytics", "✅", "✅", "👁", "❌"],
    ["Client management", "✅", "✅", "✅", "❌"],
  ];
  const cell = (v: string) => {
    if (v === "👁") return <Eye className="mx-auto h-3 w-3 text-brand-text-secondary" />;
    return <span className="text-xs">{v}</span>;
  };
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-brand-text-secondary">
            <th className="py-1.5 text-left font-medium">Permission</th>
            <th className="py-1.5 text-center font-medium">Owner</th>
            <th className="py-1.5 text-center font-medium">Admin</th>
            <th className="py-1.5 text-center font-medium">Recruiter</th>
            <th className="py-1.5 text-center font-medium">Sourcer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[0]} className={cn("h-7", i % 2 === 1 && "bg-brand-bg/50")}>
              <td className="px-2">{r[0]}</td>
              <td className="text-center">{cell(r[1])}</td>
              <td className="text-center">{cell(r[2])}</td>
              <td className="text-center">{cell(r[3])}</td>
              <td className="text-center">{cell(r[4])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-brand-text-secondary">
        ✅ full access · 👁 view only · ❌ no access
      </p>
    </div>
  );
}

function InviteMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("Recruiter");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Add a new member to your HireSmart workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field label="Email address *">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Full name *">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Role *">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Recruiter">Recruiter</SelectItem>
                <SelectItem value="Sourcer">Sourcer</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs text-brand-text-secondary">
            An invitation email will be sent from hello@hiresmart.com with instructions to join the
            workspace.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              toast.success(`Invitation sent to ${email || "new member"}`);
              onOpenChange(false);
              setEmail("");
              setName("");
            }}
          >
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Workspace tab ----------
const DEFAULT_PRIMARY = "#004C66";
const DEFAULT_ACCENT = "#004703";

function WorkspaceTab() {
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  // Apply colors live to actual CSS vars so users see the impact app-wide.
  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", primary);
    document.documentElement.style.setProperty("--brand-accent", accent);
  }, [primary, accent]);

  // Restore stylesheet defaults when leaving this tab.
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--brand-primary");
      document.documentElement.style.removeProperty("--brand-accent");
    };
  }, []);

  const resetBranding = () => {
    setPrimary(DEFAULT_PRIMARY);
    setAccent(DEFAULT_ACCENT);
    toast("Branding reset to defaults");
  };

  return (
    <div className="flex flex-col gap-6">
      <SCard title="Branding" divided>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Workspace name">
            <Input defaultValue="HireSmart" />
          </Field>
          <Field label="Logo">
            <UploadZone label="Upload logo (200×60px)" />
          </Field>
          <Field label="Primary color">
            <ColorField value={primary} onChange={setPrimary} />
          </Field>
          <Field label="Accent color">
            <ColorField value={accent} onChange={setAccent} />
          </Field>
          <Field label="Favicon">
            <UploadZone label="Upload favicon (32×32px)" />
          </Field>
        </div>

        {/* Live preview */}
        <div className="mt-6 rounded-lg border border-gray-100 bg-brand-bg/60 p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
            Live preview
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex w-44 flex-col gap-1 rounded-md bg-white p-2 shadow-sm">
              <div className="rounded px-2 py-1.5 text-xs text-brand-text-secondary">Dashboard</div>
              <div
                className="rounded px-2 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: primary }}
              >
                Projects
              </div>
              <div className="rounded px-2 py-1.5 text-xs text-brand-text-secondary">Inbox</div>
            </div>
            <button
              className="rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: primary }}
            >
              Sample button
            </button>
            <span
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              Active
            </span>
          </div>
          <p className="mt-3 text-[11px] italic text-brand-text-secondary">
            Changes are reflected app-wide while previewing. Save to keep them.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={resetBranding}>Reset to defaults</Button>
          <Button onClick={() => toast.success("Branding saved")}>Save branding</Button>
        </div>
      </SCard>

      <SCard title="Domains" divided>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-brand-text-secondary">
              <th className="py-2 font-medium">Portal</th>
              <th className="py-2 font-medium">URL</th>
              <th className="py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Core app", "app.hiresmart.com"],
              ["Candidate portal", "jobs.hiresmart.com"],
              ["Employer portal", "hire.hiresmart.com"],
              ["Corporate website", "hiresmart.com"],
            ].map(([p, u]) => (
              <tr key={u} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5">{p}</td>
                <td className="py-2.5 text-brand-text-secondary">{u}</td>
                <td className="py-2.5 text-right">
                  <StatusBadge status="active" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-brand-text-secondary">
          Domain configuration requires technical setup. Contact support for changes.
        </p>
      </SCard>

      <SCard title="Email" divided>
        <dl className="grid gap-3 text-sm md:grid-cols-3">
          <div>
            <dt className="text-xs text-brand-text-secondary">Sender domain</dt>
            <dd className="mt-0.5">hiresmart.com</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-text-secondary">Sender address</dt>
            <dd className="mt-0.5">hello@hiresmart.com</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-text-secondary">Status</dt>
            <dd className="mt-0.5"><StatusBadge status="active" label="Verified" /></dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-brand-text-secondary">
          Email domain is configured via Resend. Contact support to change.
        </p>
      </SCard>
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-lg border border-gray-200"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
    </div>
  );
}

function UploadZone({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 text-sm text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary"
    >
      <Upload className="h-4 w-4" />
      {label}
    </button>
  );
}

// ---------- Integrations tab ----------
interface Integration {
  name: string;
  initial: string;
  color: string;
  description: string;
  detail: string;
  status: "Connected" | "Active";
}

const INTEGRATIONS: Integration[] = [
  { name: "Unipile", initial: "U", color: "#0a66c2", description: "LinkedIn outreach & inbox sync", detail: "2 accounts connected · $10/account/month", status: "Connected" },
  { name: "Proxycurl", initial: "P", color: "#7c3aed", description: "LinkedIn profile enrichment", detail: "Pay-as-you-go · ~$0.01/lookup", status: "Connected" },
  { name: "Resend", initial: "R", color: "#000000", description: "Transactional email", detail: "Domain verified · 847 emails sent this month", status: "Connected" },
  { name: "Anthropic", initial: "A", color: "#d97706", description: "AI — parsing, matching, drafting", detail: "Claude Sonnet 4.6 + Haiku 4.5 · $23.40 this month", status: "Active" },
  { name: "OpenAI", initial: "O", color: "#10a37f", description: "Text embeddings", detail: "text-embedding-3-small · $0.12 this month", status: "Active" },
];

function IntegrationsTab() {
  const aiRows: Array<[string, string, string]> = [
    ["JD parsing", "12 parses", "$0.25"],
    ["CV parsing", "47 parses", "$1.13"],
    ["Match explanations", "180 candidates", "$2.52"],
    ["Outreach drafts", "85 messages", "$0.94"],
    ["Reply classification", "34 replies", "$0.27"],
    ["Embeddings", "59 documents", "$0.001"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {INTEGRATIONS.map((i) => (
          <div key={i.name} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: i.color }}
              >
                {i.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-brand-text">{i.name}</p>
                    <p className="mt-0.5 text-[13px] text-brand-text-secondary">{i.description}</p>
                  </div>
                  <StatusBadge status="active" label={i.status} />
                </div>
                <p className="mt-1 text-[13px] text-brand-text-secondary">{i.detail}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">Manage</Button>
                  <Button variant="ghost" size="sm" className="text-status-danger hover:text-status-danger">
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-brand-seafoam/10 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-primary" />
          <h2 className="text-[16px] font-medium text-brand-text">AI usage this month</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-wide text-brand-text-secondary">
              <th className="py-2 font-medium">Operation</th>
              <th className="py-2 font-medium">Count</th>
              <th className="py-2 text-right font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {aiRows.map((r) => (
              <tr key={r[0]} className="border-b border-gray-100/60">
                <td className="py-2">{r[0]}</td>
                <td className="py-2 text-brand-text-secondary">{r[1]}</td>
                <td className="py-2 text-right font-mono text-xs">{r[2]}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-medium">Total</td>
              <td />
              <td className="py-2 text-right font-mono text-sm font-medium">$5.09</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-brand-text-secondary">
            <span>Budget: $5.09 of $50.00 used (10%)</span>
          </div>
          <Progress value={10} className="h-2" />
          <p className="mt-2 text-xs text-brand-text-secondary">
            Budget alerts are sent at 80% and 100%.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Billing tab ----------
function BillingTab() {
  return (
    <div className="flex flex-col gap-6">
      <SCard>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-brand-text">HireSmart Professional</h2>
            <p className="mt-1 text-sm text-brand-text-secondary">
              $600 / month · Billed quarterly ($1,800)
            </p>
            <p className="text-xs text-brand-text-secondary">Next invoice: July 1, 2026</p>
          </div>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {[
              "3 recruiter seats (3 of 3 used)",
              "All platform features",
              "Priority bug fixes",
              "AI model upgrades",
              "1 major version upgrade per year",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-status-success" />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-brand-text-secondary">Additional seats: $25/seat/month</p>
          <div>
            <Button variant="outline">Manage plan</Button>
          </div>
        </div>
      </SCard>

      <SCard title="Payment method" divided>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-12 items-center justify-center rounded-md bg-brand-text text-[10px] font-bold tracking-wider text-white">
              VISA
            </div>
            <div>
              <p className="text-sm">Visa ending in 4242</p>
              <p className="text-xs text-brand-text-secondary">Expires 12/2028</p>
            </div>
          </div>
          <button className="text-sm font-medium text-brand-primary hover:underline">
            Update payment method
          </button>
        </div>
      </SCard>

      <SCard title="Billing history" divided>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-brand-text-secondary">
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Amount</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {[
              ["Apr 1, 2026", "Quarterly service fee (Q2 2026)", "$1,800.00"],
              ["Jan 1, 2026", "Quarterly service fee (Q1 2026)", "$1,800.00"],
              ["Dec 15, 2025", "Build milestone M4 — Website & Launch", "$1,500.00"],
              ["Nov 1, 2025", "Build milestone M3 — Matching & Outreach", "$1,000.00"],
            ].map((r) => (
              <tr key={r[0] + r[1]} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-brand-text-secondary">{r[0]}</td>
                <td className="py-2.5">{r[1]}</td>
                <td className="py-2.5 text-right font-mono text-xs">{r[2]}</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-1 text-xs text-status-success">
                    <CheckCircle className="h-3.5 w-3.5" /> Paid
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
                    <Download className="h-3.5 w-3.5" /> Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SCard>

      <SCard title="Third-party costs (reference)" divided>
        <p className="text-[13px] text-brand-text-secondary">
          These are your direct costs to third-party providers. You manage these accounts.
        </p>
        <ul className="mt-3 grid gap-1.5 text-sm md:grid-cols-2">
          {[
            ["Unipile", "$20/mo"],
            ["Supabase", "$25/mo"],
            ["Anthropic", "~$5–10/mo"],
            ["Proxycurl", "~$5–20/mo"],
            ["Resend", "Free tier"],
          ].map(([n, c]) => (
            <li key={n} className="flex justify-between border-b border-gray-50 py-1.5 last:border-0">
              <span>{n}</span>
              <span className="text-brand-text-secondary">{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px]">Estimated total: $55–75/month at current usage</p>
        <p className="mt-1 text-xs italic text-brand-text-secondary">
          These costs are paid directly to each provider, not through HireSmart.
        </p>
      </SCard>
    </div>
  );
}

// ---------- Chrome Extension Tab ----------
function ExtensionTab() {
  const features = [
    "One-click save of LinkedIn profiles to your candidate database",
    "Duplicate detection prevents accidental re-imports",
    "Assign saved profiles directly to an active project",
    "Auto-enrichment via Proxycurl (email, phone, work history)",
  ];
  return (
    <div className="space-y-6">
      <SCard>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-seafoam/40 text-brand-primary">
              <Chrome className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-brand-text">Chrome Extension</h2>
              <p className="mt-1 max-w-md text-sm text-brand-text-secondary">
                Save LinkedIn profiles to your candidate database with one click.
              </p>
            </div>
          </div>
          <Button disabled className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Coming soon
          </Button>
        </div>
      </SCard>

      <SCard title="What it does">
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-brand-text">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </SCard>

      <SCard title="Preview">
        <div className="flex aspect-[16/9] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-brand-bg">
          <div className="text-center text-sm text-brand-text-secondary">
            <Chrome className="mx-auto mb-3 h-8 w-8 opacity-40" />
            Extension popup preview
          </div>
        </div>
      </SCard>

      <SCard title="Installation">
        <ol className="space-y-2 text-sm text-brand-text-secondary">
          <li>1. Download the extension once it becomes available.</li>
          <li>2. Open <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs">chrome://extensions</code> and enable Developer mode.</li>
          <li>3. Click "Load unpacked" and select the HireSmart extension folder.</li>
          <li>4. Sign in with your HireSmart workspace credentials.</li>
        </ol>
        <p className="mt-4 text-xs italic text-brand-text-secondary">
          Detailed installation instructions will appear here when the extension ships.
        </p>
      </SCard>
    </div>
  );
}

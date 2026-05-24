import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RefreshCcw,
  Clock,
  Check,
  X,
  Pencil,
  Linkedin,
  Inbox as InboxIcon,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/approvals")({
  head: () => ({
    meta: [
      { title: "Approval Queue — Norvex" },
      { name: "description", content: "Review and approve outbound LinkedIn messages before they send." },
    ],
  }),
  component: ApprovalQueuePage,
});

/* ============================================================
 * Types & mock data
 * ============================================================ */

type StepId = "connection" | "fu1" | "fu2";

interface SendingAccount {
  id: string;
  name: string;
  initials: string;
  usedToday: number;
  capToday: number;
  warmupDay?: number; // 1-7 if in warmup
}

interface CampaignRef {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
}

interface PendingMessage {
  id: string;
  recipient: {
    name: string;
    title: string;
    company: string;
    location: string;
    initials: string;
  };
  campaignId: string;
  accountId: string;
  step: StepId;
  body: string;
  scheduledFor: string; // ISO-ish display
  outsideWindow?: boolean;
}

const ACCOUNTS: SendingAccount[] = [
  { id: "a1", name: "Daniel Suharto", initials: "DS", usedToday: 7, capToday: 15 },
  { id: "a2", name: "Priya Nair", initials: "PN", usedToday: 14, capToday: 15 },
  { id: "a3", name: "Amarsh Kapoor", initials: "AK", usedToday: 3, capToday: 5, warmupDay: 2 },
];

const CAMPAIGNS: CampaignRef[] = [
  { id: "c1", name: "CFO outreach — Wave 2", jobId: "j6", jobTitle: "Group CFO · Indorama Ventures" },
  { id: "c2", name: "Plant Director — Surabaya", jobId: "j4", jobTitle: "Plant Director · Mayora" },
  { id: "c3", name: "Head of Trade Marketing", jobId: "j2", jobTitle: "Head of Trade Marketing · Wings" },
];

const STEPS: Record<StepId, { label: string; short: string; maxLen?: number }> = {
  connection: { label: "Connection note", short: "Conn", maxLen: 300 },
  fu1: { label: "Follow-up 1", short: "FU1" },
  fu2: { label: "Follow-up 2", short: "FU2" },
};

const INITIAL_MESSAGES: PendingMessage[] = [
  {
    id: "m1",
    recipient: {
      name: "Rina Wijaya", title: "CFO", company: "PT Telkom Indonesia",
      location: "Jakarta, ID", initials: "RW",
    },
    campaignId: "c1", accountId: "a1", step: "connection",
    body: "Hi Rina — we're running a confidential Group CFO search for an Indonesian listed group, the brief leans heavily on M&A and IFRS depth. Would value 15 minutes if open to a conversation.",
    scheduledFor: "Today · 10:20 WIB",
  },
  {
    id: "m2",
    recipient: {
      name: "Priya Nair", title: "Group CFO", company: "Tata Motors",
      location: "Mumbai, IN", initials: "PN",
    },
    campaignId: "c1", accountId: "a1", step: "fu1",
    body: "Hi Priya, following up on my note last week. Happy to share the search brief discreetly — even if not for you, a referral would mean a lot.",
    scheduledFor: "Today · 14:00 IST",
  },
  {
    id: "m3",
    recipient: {
      name: "Hiroshi Tanaka", title: "Group CFO", company: "Sony Music",
      location: "Tokyo, JP", initials: "HT",
    },
    campaignId: "c1", accountId: "a2", step: "connection",
    body: "Hi Hiroshi — your IPO leadership at {company} caught our eye. We're working on a listed-group CFO mandate in SEA that may be of interest.",
    scheduledFor: "Tomorrow · 09:00 JST",
  },
  {
    id: "m4",
    recipient: {
      name: "Carlos Mendez", title: "CFO", company: "Mercado Libre",
      location: "São Paulo, BR", initials: "CM",
    },
    campaignId: "c1", accountId: "a2", step: "fu2",
    body: "Hi Carlos, last note from me on this — if timing isn't right, no problem. Always glad to keep in touch.",
    scheduledFor: "Sat · postponed (weekend off)",
    outsideWindow: true,
  },
  {
    id: "m5",
    recipient: {
      name: "Budi Santoso", title: "VP Finance", company: "Astra International",
      location: "Jakarta, ID", initials: "BS",
    },
    campaignId: "c2", accountId: "a3", step: "connection",
    body: "Hi Budi — we're supporting a Plant Director search in Surabaya for a leading F&B group. Your operations background fits well; happy to share more confidentially.",
    scheduledFor: "Today · 11:10 WIB",
  },
  {
    id: "m6",
    recipient: {
      name: "Aisha Rahman", title: "Head of Finance", company: "Grab",
      location: "Singapore, SG", initials: "AR",
    },
    campaignId: "c1", accountId: "a1", step: "fu1",
    body: "Hi Aisha, circling back — would love your perspective on the mandate even if exploratory.",
    scheduledFor: "Today · 15:30 SGT",
  },
  {
    id: "m7",
    recipient: {
      name: "Linh Nguyen", title: "Finance Director", company: "VinGroup",
      location: "Hanoi, VN", initials: "LN",
    },
    campaignId: "c1", accountId: "a2", step: "connection",
    body: "Hi Linh — building a shortlist for a Group CFO role in Jakarta. Your treasury-led background stood out.",
    scheduledFor: "Today · 13:00 ICT",
  },
  {
    id: "m8",
    recipient: {
      name: "James Chen", title: "Finance Director", company: "Wilmar",
      location: "Singapore, SG", initials: "JC",
    },
    campaignId: "c1", accountId: "a2", step: "fu1",
    body: "Hi James, gentle follow-up. Glad to share the brief if useful.",
    scheduledFor: "Tomorrow · 09:30 SGT",
  },
  {
    id: "m9",
    recipient: {
      name: "Mei Tan", title: "CFO", company: "Singtel",
      location: "Singapore, SG", initials: "MT",
    },
    campaignId: "c3", accountId: "a3", step: "connection",
    body: "Hi Mei — we're running a Head of Trade Marketing search; saw your commercial leadership and would value a quick exchange.",
    scheduledFor: "Today · 16:00 SGT",
  },
  {
    id: "m10",
    recipient: {
      name: "Arjun Mehta", title: "VP Finance", company: "Reliance",
      location: "Mumbai, IN", initials: "AM",
    },
    campaignId: "c1", accountId: "a1", step: "fu2",
    body: "Hi Arjun, last touch — if not now, glad to stay connected.",
    scheduledFor: "Today · 17:00 IST",
  },
  {
    id: "m11",
    recipient: {
      name: "Amara Osei", title: "CFO", company: "Fonterra SEA",
      location: "Jakarta, ID", initials: "AO",
    },
    campaignId: "c2", accountId: "a3", step: "fu1",
    body: "Hi Amara, following up. Happy to share the brief whenever convenient.",
    scheduledFor: "Today · 12:30 WIB",
  },
  {
    id: "m12",
    recipient: {
      name: "Patrick O'Brien", title: "Group Treasurer", company: "BHP",
      location: "Melbourne, AU", initials: "PO",
    },
    campaignId: "c1", accountId: "a1", step: "connection",
    body: "Hi Patrick — exploring treasury-led CFO profiles for a SEA listed group. Would value 10 minutes.",
    scheduledFor: "Today · 09:00 AEST",
  },
];

const TOKEN_RE = /\{[a-zA-Z_]+\}/g;

/* ============================================================
 * Page
 * ============================================================ */

function ApprovalQueuePage() {
  const [messages, setMessages] = useState<PendingMessage[]>(INITIAL_MESSAGES);
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [stepFilter, setStepFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusIdx, setFocusIdx] = useState(0);
  const [confirmBulk, setConfirmBulk] = useState<null | { ids: string[]; sendsNow: number; deferred: number }>(null);

  const accounts = ACCOUNTS;

  const filtered = useMemo(() => {
    return messages.filter((m) =>
      (campaignFilter === "all" || m.campaignId === campaignFilter) &&
      (accountFilter === "all" || m.accountId === accountFilter) &&
      (stepFilter === "all" || m.step === stepFilter),
    );
  }, [messages, campaignFilter, accountFilter, stepFilter]);

  // Remaining-capacity tracker (mock real-time)
  const remainingCapacity = useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach((a) => { map[a.id] = Math.max(0, a.capToday - a.usedToday); });
    return map;
  }, [accounts]);

  const approve = useCallback((id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    const tokens = msg.body.match(TOKEN_RE);
    if (tokens) {
      toast.error(`Unfilled tokens: ${tokens.join(", ")}`);
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    const acct = accounts.find((a) => a.id === msg.accountId);
    const willSendNow = (remainingCapacity[msg.accountId] ?? 0) > 0;
    toast.success(
      willSendNow
        ? `Sent via ${acct?.name}`
        : `Queued — ${acct?.name} at daily cap, will send tomorrow`,
    );
  }, [messages, accounts, remainingCapacity]);

  const skip = (id: string) => toast(`Left in queue · review later`);
  const remove = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast(`Removed from campaign`);
  };

  const editBody = (id: string, body: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, body } : m)));
  };

  const regenerate = (id: string, tone: "warm" | "direct" | "executive") => {
    const draftLib = {
      warm: "Hi {name} — your work at {company} stood out. Would you be open to a confidential conversation about a senior search we're running this quarter?",
      direct: "Hi {name}, brief and to the point: we're running a senior search in your space and your profile is a strong fit. Open to 15 minutes?",
      executive: "Dear {name}, on behalf of our client we are conducting a discreet executive search and your background aligns with the brief. Would value a confidential exchange.",
    };
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    const filled = draftLib[tone]
      .replace("{name}", msg.recipient.name.split(" ")[0])
      .replace("{company}", msg.recipient.company);
    editBody(id, filled);
    toast.success("Draft regenerated");
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const allVisibleSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const toggleAllVisible = () => {
    if (allVisibleSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((m) => m.id)));
  };

  const computeBulk = (ids: string[]) => {
    const remaining = { ...remainingCapacity };
    let sendsNow = 0;
    let deferred = 0;
    ids.forEach((id) => {
      const m = messages.find((x) => x.id === id);
      if (!m) return;
      if ((remaining[m.accountId] ?? 0) > 0) {
        remaining[m.accountId]!--;
        sendsNow++;
      } else {
        deferred++;
      }
    });
    return { sendsNow, deferred };
  };

  const openBulkApproveSelected = () => {
    const ids = filtered.filter((m) => selected.has(m.id)).map((m) => m.id);
    if (ids.length === 0) return toast("Select messages to approve");
    const { sendsNow, deferred } = computeBulk(ids);
    setConfirmBulk({ ids, sendsNow, deferred });
  };

  const openBulkApproveAllVisible = () => {
    const ids = filtered.map((m) => m.id);
    if (ids.length === 0) return;
    const { sendsNow, deferred } = computeBulk(ids);
    setConfirmBulk({ ids, sendsNow, deferred });
  };

  const confirmBulkApprove = () => {
    if (!confirmBulk) return;
    const blocked: string[] = [];
    confirmBulk.ids.forEach((id) => {
      const m = messages.find((x) => x.id === id);
      if (m?.body.match(TOKEN_RE)) blocked.push(id);
    });
    const toRemove = confirmBulk.ids.filter((id) => !blocked.includes(id));
    setMessages((prev) => prev.filter((m) => !toRemove.includes(m.id)));
    setSelected(new Set());
    toast.success(
      `${toRemove.length} approved · ${confirmBulk.sendsNow} send now, ${confirmBulk.deferred} tomorrow${
        blocked.length ? ` · ${blocked.length} blocked (unfilled tokens)` : ""
      }`,
    );
    setConfirmBulk(null);
  };

  // Keyboard shortcuts: A = approve focused, S = skip, J/K = nav, X = select
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("textarea, input, [contenteditable]")) return;
      if (e.key === "j") setFocusIdx((i) => Math.min(filtered.length - 1, i + 1));
      else if (e.key === "k") setFocusIdx((i) => Math.max(0, i - 1));
      else if (e.key === "a") { const m = filtered[focusIdx]; if (m) approve(m.id); }
      else if (e.key === "s") { const m = filtered[focusIdx]; if (m) skip(m.id); }
      else if (e.key === "x") { const m = filtered[focusIdx]; if (m) toggleSelect(m.id); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, focusIdx, approve]);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Approval Queue</h1>
          <p className="text-[13px] text-brand-text-secondary">
            {messages.length} messages awaiting your approval
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-brand-mint/20 px-2.5 py-1 text-[11px] font-medium text-brand-primary ring-1 ring-brand-mint">
            <ShieldCheck className="h-3.5 w-3.5" />
            AI drafts. You approve and send. Nothing goes out without your click.
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-brand-text-secondary">
          <Keyboard className="h-3.5 w-3.5" />
          <span><kbd className="rounded border border-border bg-card px-1">J</kbd>/<kbd className="rounded border border-border bg-card px-1">K</kbd> nav · <kbd className="rounded border border-border bg-card px-1">A</kbd> approve · <kbd className="rounded border border-border bg-card px-1">S</kbd> skip · <kbd className="rounded border border-border bg-card px-1">X</kbd> select</span>
        </div>
      </div>

      {/* ACCOUNT HEALTH STRIP */}
      <div className="flex flex-wrap items-center gap-2">
        {accounts.map((a) => {
          const pct = a.capToday === 0 ? 0 : a.usedToday / a.capToday;
          const atCap = a.usedToday >= a.capToday;
          const near = !atCap && pct >= 0.8;
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px]",
                atCap
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : near
                  ? "border-amber-200 bg-amber-50/60 text-amber-800"
                  : "border-border bg-card text-brand-text",
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-seafoam text-[10px] font-semibold text-brand-primary">
                {a.initials}
              </div>
              <div className="leading-tight">
                <div className="font-medium">{a.name.split(" ")[0]} · {a.usedToday}/{a.capToday}</div>
                <div className="text-[10px] uppercase tracking-wide opacity-75">
                  {atCap ? "At cap · queues defer to tomorrow"
                    : a.warmupDay ? `Warmup day ${a.warmupDay}/7`
                    : "Healthy"}
                </div>
              </div>
              {(atCap || near || a.warmupDay) && (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* FILTERS + BULK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Checkbox
            checked={allVisibleSelected}
            onCheckedChange={toggleAllVisible}
            aria-label="Select all visible"
          />
          <span className="text-[12px] text-brand-text-secondary">
            {selected.size > 0 ? `${selected.size} selected` : "Select"}
          </span>
          <div className="mx-1 h-5 w-px bg-border" />
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {CAMPAIGNS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stepFilter} onValueChange={setStepFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All steps</SelectItem>
              {Object.entries(STEPS).map(([id, def]) => (
                <SelectItem key={id} value={id}>{def.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={selected.size === 0}
            onClick={openBulkApproveSelected}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Approve selected ({selected.size})
          </Button>
          <Button
            size="sm"
            className="h-8"
            disabled={filtered.length === 0}
            onClick={openBulkApproveAllVisible}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Approve all visible
          </Button>
        </div>
      </div>

      {/* QUEUE */}
      {filtered.length === 0 ? (
        <EmptyQueue />
      ) : (
        <ul className="space-y-3">
          {filtered.map((m, idx) => {
            const account = accounts.find((a) => a.id === m.accountId)!;
            const campaign = CAMPAIGNS.find((c) => c.id === m.campaignId)!;
            const stepDef = STEPS[m.step];
            const tokens = m.body.match(TOKEN_RE);
            const atCap = (remainingCapacity[m.accountId] ?? 0) <= 0;
            const blocked = !!tokens;
            const focused = idx === focusIdx;
            return (
              <QueueCard
                key={m.id}
                msg={m}
                account={account}
                campaign={campaign}
                stepLabel={stepDef.label}
                maxLen={stepDef.maxLen}
                tokens={tokens ?? null}
                blocked={blocked}
                atCap={atCap}
                focused={focused}
                checked={selected.has(m.id)}
                onFocus={() => setFocusIdx(idx)}
                onToggleSelect={() => toggleSelect(m.id)}
                onEdit={(body) => editBody(m.id, body)}
                onApprove={() => approve(m.id)}
                onSkip={() => skip(m.id)}
                onRemove={() => remove(m.id)}
                onRegenerate={(tone) => regenerate(m.id, tone)}
              />
            );
          })}
        </ul>
      )}

      {/* BULK CONFIRM DIALOG */}
      <Dialog open={!!confirmBulk} onOpenChange={(o) => !o && setConfirmBulk(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Approve {confirmBulk?.ids.length} message{(confirmBulk?.ids.length ?? 0) === 1 ? "" : "s"}?</DialogTitle>
            <DialogDescription>
              Respecting daily caps and warmup limits across your connected accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-border bg-brand-bg/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-brand-text-secondary">Will send today</span>
              <span className="font-semibold text-brand-primary tabular-nums">{confirmBulk?.sendsNow}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-text-secondary">Will roll to tomorrow</span>
              <span className="font-semibold text-amber-700 tabular-nums">{confirmBulk?.deferred}</span>
            </div>
          </div>
          <p className="text-[12px] text-brand-text-secondary">
            Stop-on-reply is always on. Any message containing unfilled tokens will be blocked.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBulk(null)}>Cancel</Button>
            <Button onClick={confirmBulkApprove}>Approve & send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================
 * Queue card
 * ============================================================ */

function QueueCard({
  msg, account, campaign, stepLabel, maxLen, tokens, blocked, atCap, focused,
  checked, onFocus, onToggleSelect, onEdit, onApprove, onSkip, onRemove, onRegenerate,
}: {
  msg: PendingMessage;
  account: SendingAccount;
  campaign: CampaignRef;
  stepLabel: string;
  maxLen?: number;
  tokens: RegExpMatchArray | null;
  blocked: boolean;
  atCap: boolean;
  focused: boolean;
  checked: boolean;
  onFocus: () => void;
  onToggleSelect: () => void;
  onEdit: (body: string) => void;
  onApprove: () => void;
  onSkip: () => void;
  onRemove: () => void;
  onRegenerate: (tone: "warm" | "direct" | "executive") => void;
}) {
  const overLimit = maxLen ? msg.body.length > maxLen : false;
  return (
    <li
      onClick={onFocus}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-all",
        focused ? "border-brand-primary ring-1 ring-brand-primary/30" : "border-border hover:border-brand-mint",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggleSelect}
          className="mt-1"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Recipient */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-[12px] font-semibold text-brand-primary">
          {msg.recipient.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[14px] font-semibold text-brand-text">{msg.recipient.name}</div>
            <Linkedin className="h-3.5 w-3.5 text-brand-text-secondary" />
            <span className="text-[12px] text-brand-text-secondary">
              {msg.recipient.title} @ {msg.recipient.company} · {msg.recipient.location}
            </span>
          </div>

          {/* Context strip */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-text-secondary">
            <Link
              to="/outreach/$id"
              params={{ id: campaign.id }}
              className="rounded bg-brand-bg px-1.5 py-0.5 text-brand-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {campaign.name}
            </Link>
            <span>·</span>
            <Link
              to="/jobs/$id"
              params={{ id: campaign.jobId }}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {campaign.jobTitle}
            </Link>
            <span>·</span>
            <span className="rounded bg-brand-mint/20 px-1.5 py-0.5 font-medium text-brand-primary">
              {stepLabel}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-bg text-[9px] font-semibold text-brand-text">
                {account.initials}
              </span>
              {account.name.split(" ")[0]}
            </span>
          </div>

          {/* Message body */}
          <div className="mt-3 rounded-lg border border-border bg-brand-bg/30 p-2.5">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 text-brand-text-secondary">
                <Sparkles className="h-3 w-3 text-brand-primary" />
                AI draft · editable
              </span>
              <div className="flex items-center gap-1.5">
                <ToneRegenerate onPick={onRegenerate} />
              </div>
            </div>
            <Textarea
              value={msg.body}
              onChange={(e) => onEdit(e.target.value)}
              className={cn(
                "min-h-[68px] resize-y bg-card text-[13px] leading-relaxed",
                overLimit && "border-red-400 focus-visible:ring-red-400",
              )}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                {tokens && (
                  <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-700 ring-1 ring-red-200">
                    <AlertTriangle className="h-3 w-3" />
                    Unfilled tokens: {tokens.join(", ")}
                  </span>
                )}
              </div>
              {maxLen && (
                <span className={cn(
                  "tabular-nums text-brand-text-secondary",
                  overLimit && "font-semibold text-red-600",
                )}>
                  {msg.body.length}/{maxLen}
                </span>
              )}
            </div>
          </div>

          {/* Scheduled / footer */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px]",
              (msg.outsideWindow || atCap) ? "text-amber-700" : "text-brand-text-secondary",
            )}>
              <Clock className="h-3 w-3" />
              {atCap
                ? `${account.name.split(" ")[0]} at daily cap · will send tomorrow`
                : msg.outsideWindow
                ? `Outside 08:00–18:00 window · will send at next valid window`
                : `Scheduled ${msg.scheduledFor}`}
            </span>

            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-7 text-brand-text-secondary"
                onClick={(e) => { e.stopPropagation(); onSkip(); }}>
                Skip
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7"
                    onClick={(e) => e.stopPropagation()}>
                    <Pencil className="mr-1 h-3 w-3" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast("Inline editor focused")}>
                    Edit message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-status-danger" onClick={onRemove}>
                    <X className="mr-2 h-3.5 w-3.5" />
                    Remove from campaign
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                className="h-7"
                disabled={blocked || overLimit}
                onClick={(e) => { e.stopPropagation(); onApprove(); }}
                title={blocked ? "Resolve unfilled tokens first" : "Approve & send"}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Approve & send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function ToneRegenerate({ onPick }: { onPick: (tone: "warm" | "direct" | "executive") => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text"
          onClick={(e) => e.stopPropagation()}
        >
          <RefreshCcw className="h-3 w-3" />
          Regenerate
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        <div className="px-2 pb-1 pt-1 text-[10px] uppercase tracking-wide text-brand-text-secondary">
          Tone
        </div>
        <DropdownMenuItem onClick={() => onPick("warm")}>Warm</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPick("direct")}>Direct</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPick("executive")}>Executive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================
 * Empty state
 * ============================================================ */

function EmptyQueue() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint/30 text-brand-primary">
        <InboxIcon className="h-6 w-6" />
      </div>
      <div className="text-base font-semibold text-brand-text">Nothing awaiting approval</div>
      <p className="mx-auto mt-1 max-w-md text-[13px] text-brand-text-secondary">
        After the first 50 sends per account, sending continues automatically within
        your safety caps — stop-on-reply stays on, always.
      </p>
    </div>
  );
}

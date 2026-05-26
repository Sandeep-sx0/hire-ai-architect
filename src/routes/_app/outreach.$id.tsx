import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar,
  Linkedin,
  MailOpen,
  MessageSquare,
  Send,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, StatusBadge, DataTable } from "@/components/shared";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { campaigns, projects } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/outreach/$id")({
  head: () => ({ meta: [{ title: "Campaign — Syndie Recruit" }] }),
  component: CampaignDetail,
});

interface Prospect {
  id: string;
  name: string;
  score: number;
  step: number;
  status: "pending" | "sent" | "replied" | "completed";
  lastAction: string;
}

const PROSPECTS: Prospect[] = [
  { id: "p1", name: "Rajeev Menon", score: 92, step: 3, status: "replied", lastAction: "2d ago" },
  { id: "p2", name: "Hiroshi Yamamoto", score: 87, step: 2, status: "sent", lastAction: "1d ago" },
  { id: "p3", name: "Mei Wong", score: 74, step: 3, status: "replied", lastAction: "3d ago" },
  { id: "p4", name: "Siti Nurhaliza", score: 88, step: 1, status: "sent", lastAction: "5h ago" },
  { id: "p5", name: "James Tan Wei Ming", score: 85, step: 2, status: "completed", lastAction: "1w ago" },
  { id: "p6", name: "Lakshmi Iyer", score: 90, step: 1, status: "pending", lastAction: "—" },
  { id: "p7", name: "Arjun Krishnamurthy", score: 81, step: 2, status: "sent", lastAction: "4h ago" },
  { id: "p8", name: "Priscilla Lim", score: 83, step: 3, status: "completed", lastAction: "6d ago" },
];

const SEQUENCE = [
  {
    step: 1,
    label: "Connection note",
    wait: "Day 0",
    body: "Hi {{first_name}}, I'm working on a confidential CFO mandate with a leading petrochemical group in Bangkok. Your background at {{company}} caught my eye — happy to share more if you're open?",
  },
  {
    step: 2,
    label: "Follow-up #1",
    wait: "Wait 3 days",
    body: "Hi {{first_name}} — circling back on my note. The mandate is a Group CFO role reporting to the CEO, with significant M&A activity across SEA. Worth a 20-min confidential chat?",
  },
  {
    step: 3,
    label: "Follow-up #2",
    wait: "Wait 5 days",
    body: "Last one from me, {{first_name}}. Closing the shortlist next week — let me know if you'd like to learn more, otherwise I'll close the loop here.",
  },
];

function CampaignDetail() {
  const { id } = Route.useParams();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const project = projects.find((p) => p.id === campaign.projectId);
  const [tab, setTab] = useState<"prospects" | "sequence" | "settings">("prospects");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const openedPct = campaign.sent ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
  const repliedPct = campaign.sent ? Math.round((campaign.replied / campaign.sent) * 100) : 0;
  const interestedPct = campaign.sent
    ? Math.round((campaign.interested / campaign.sent) * 100)
    : 0;

  const columns: DataTableColumn<Prospect>[] = [
    {
      key: "name",
      header: "Candidate",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <Link
          to="/candidates/$id"
          params={{ id: r.id }}
          className="font-medium text-brand-primary hover:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      accessor: (r) => r.score,
      render: (r) => <span className="tabular-nums font-medium">{r.score}</span>,
    },
    {
      key: "step",
      header: "Step",
      render: (r) => <span className="text-sm">{r.step} / 3</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status === "pending" ? "draft" : r.status === "sent" ? "in_progress" : r.status} label={r.status[0].toUpperCase() + r.status.slice(1)} />,
    },
    {
      key: "lastAction",
      header: "Last action",
      render: (r) => (
        <span className="text-sm text-brand-text-secondary">{r.lastAction}</span>
      ),
    },
  ];

  const filteredProspects =
    statusFilter === "all"
      ? PROSPECTS
      : PROSPECTS.filter((p) => p.status === statusFilter);

  return (
    <div>
      <PageHeader
        title={campaign.name}
        subtitle={project ? `${project.title} · LinkedIn: Amarsh Singh · Started ${campaign.startedAt}` : undefined}
        actions={<StatusBadge status={campaign.status} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sent" value={campaign.sent} icon={Send} />
        <StatCard
          label="Opened"
          value={`${campaign.opened} (${openedPct}%)`}
          icon={MailOpen}
        />
        <StatCard
          label="Replied"
          value={`${campaign.replied} (${repliedPct}%)`}
          icon={MessageSquare}
        />
        <StatCard
          label="Interested"
          value={`${campaign.interested} (${interestedPct}%)`}
          icon={ThumbsUp}
        />
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        {(["prospects", "sequence", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "border-b-2 border-transparent text-brand-text-secondary hover:text-brand-text",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "prospects" && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-brand-text-secondary">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DataTable<Prospect> columns={columns} data={filteredProspects} />
          </div>
        )}

        {tab === "sequence" && (
          <div className="space-y-3">
            {SEQUENCE.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mint/40 text-sm font-semibold text-brand-primary">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-brand-text">
                        {s.label}
                      </h3>
                      <p className="text-xs text-brand-text-secondary">{s.wait}</p>
                    </div>
                  </div>
                  <Linkedin className="h-4 w-4 text-brand-text-secondary" />
                </div>
                <p className="mt-3 whitespace-pre-wrap rounded-md bg-brand-bg/60 p-3 text-sm text-brand-text">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <SettingRow label="Tone" value="Professional, warm" />
            <SettingRow label="Send window" value="9:00 AM – 5:00 PM (GMT+7, Bangkok)" />
            <SettingRow label="Daily cap" value="20 messages per account per day" />
            <SettingRow label="Weekend sending" value="Disabled" />
            <SettingRow label="Manual approval" value="Required for step 1" />
            <SettingRow label="AI personalization" value="Enabled (Claude Sonnet 4.6)" icon={Sparkles} />
            <SettingRow label="LinkedIn account" value="Amarsh Singh (warmed up)" icon={Linkedin} />
            <SettingRow label="Started" value={campaign.startedAt} icon={Calendar} />
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast("Edit settings — coming soon")}
              >
                Edit settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <dt className="flex items-center gap-2 text-sm text-brand-text-secondary">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </dt>
      <dd className="text-sm font-medium text-brand-text">{value}</dd>
    </div>
  );
}

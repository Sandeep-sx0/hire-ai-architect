import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, MoreHorizontal, Pause, Play, Copy, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FilterBar, DataTable, StatusBadge } from "@/components/shared";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
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
import { campaigns, projects } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/outreach")({
  head: () => ({ meta: [{ title: "Outreach — HireSmart" }] }),
  component: OutreachListPage,
});

interface CampaignRow {
  id: string;
  name: string;
  projectId: string;
  projectTitle: string;
  status: string;
  sent: number;
  opened: number;
  replied: number;
  interested: number;
  account: string;
  startedAt: string;
}

const ACCOUNTS = ["Amarsh Singh", "Dewi Anggraini", "Priya Sharma"];

function OutreachListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [account, setAccount] = useState("all");

  const rows = useMemo<CampaignRow[]>(
    () =>
      campaigns.map((c, i) => ({
        id: c.id,
        name: c.name,
        projectId: c.projectId,
        projectTitle:
          projects.find((p) => p.id === c.projectId)?.title ?? c.projectId,
        status: c.status,
        sent: c.sent,
        opened: c.opened,
        replied: c.replied,
        interested: c.interested,
        account: ACCOUNTS[i % ACCOUNTS.length],
        startedAt: c.startedAt,
      })),
    [],
  );

  const filtered = rows.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (projectFilter !== "all" && r.projectId !== projectFilter) return false;
    if (account !== "all" && r.account !== account) return false;
    const q = search.trim().toLowerCase();
    if (q && !r.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const columns: DataTableColumn<CampaignRow>[] = [
    {
      key: "name",
      header: "Campaign",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <Link
          to="/campaigns/$id"
          params={{ id: r.id }}
          className="font-medium text-brand-primary hover:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (r) => (
        <Link
          to="/projects/$id"
          params={{ id: r.projectId }}
          className="text-sm text-brand-text-secondary hover:text-brand-text hover:underline"
        >
          {r.projectTitle}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "sent",
      header: "Sent",
      sortable: true,
      accessor: (r) => r.sent,
      render: (r) => <span className="tabular-nums">{r.sent}</span>,
    },
    {
      key: "opened",
      header: "Opened",
      sortable: true,
      accessor: (r) => r.opened,
      render: (r) => <span className="tabular-nums">{r.opened}</span>,
    },
    {
      key: "replied",
      header: "Replied",
      sortable: true,
      accessor: (r) => r.replied,
      render: (r) => <span className="tabular-nums">{r.replied}</span>,
    },
    {
      key: "interested",
      header: "Interested",
      sortable: true,
      accessor: (r) => r.interested,
      render: (r) => (
        <span className="font-medium tabular-nums text-status-success">
          {r.interested}
        </span>
      ),
    },
    {
      key: "account",
      header: "Account",
      render: (r) => <span className="text-sm">{r.account}</span>,
    },
    {
      key: "startedAt",
      header: "Started",
      sortable: true,
      accessor: (r) => r.startedAt,
      render: (r) => (
        <span className="text-sm text-brand-text-secondary">{r.startedAt}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast("Edit campaign")}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast(r.status === "active" ? "Campaign paused" : "Campaign resumed")
              }
            >
              {r.status === "active" ? (
                <>
                  <Pause className="mr-2 h-3.5 w-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-3.5 w-3.5" /> Resume
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Campaign duplicated")}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-status-danger"
              onClick={() => toast.error("Campaign deleted")}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Outreach"
        subtitle={`${campaigns.length} campaigns`}
        actions={
          <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary/90">
            <Link to="/outreach/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New campaign
            </Link>
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search campaigns..."
        searchValue={search}
        onSearch={setSearch}
      >
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {ACCOUNTS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable<CampaignRow> columns={columns} data={filtered} />
    </div>
  );
}

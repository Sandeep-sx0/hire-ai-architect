import { Bell, ChevronRight, Menu, PanelLeft, Search } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/mock-data";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  candidates: "Candidates",
  clients: "Clients",
  outreach: "Outreach",
  inbox: "Inbox",
  analytics: "Analytics",
  settings: "Settings",
  new: "New",
  parse: "Parse JD",
};

function prettify(seg: string) {
  return labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

interface AppTopbarProps {
  onToggleSidebar: () => void;
}

export function AppTopbar({ onToggleSidebar }: AppTopbarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden lg:flex">
          <PanelLeft className="h-4 w-4" />
        </Button>
        <nav className="flex min-w-0 items-center gap-1 text-sm text-brand-text-secondary">
          {segments.map((seg, idx) => {
            const path = "/" + segments.slice(0, idx + 1).join("/");
            const isLast = idx === segments.length - 1;
            return (
              <div key={path} className="flex min-w-0 items-center gap-1">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-brand-text-secondary/50" />}
                {isLast ? (
                  <span className="truncate font-medium text-brand-text">{prettify(seg)}</span>
                ) : (
                  <Link to={path} className="truncate hover:text-brand-text">
                    {prettify(seg)}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-magenta" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-seafoam text-xs font-semibold text-brand-primary">
              {currentUser.initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{currentUser.name}</div>
              <div className="text-xs font-normal text-brand-text-secondary">{currentUser.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Workspace settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

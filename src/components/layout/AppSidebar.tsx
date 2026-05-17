import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Send,
  Inbox,
  BarChart3,
  Settings,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { currentUser, unreadInboxCount } from "@/lib/mock-data";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/outreach", label: "Outreach", icon: Send },
  { to: "/inbox", label: "Inbox", icon: Inbox, badge: unreadInboxCount },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface AppSidebarProps {
  collapsed: boolean;
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-14 items-center border-b border-border", collapsed ? "justify-center px-2" : "px-5")}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-white">
            <span className="text-sm font-bold">H</span>
          </div>
          {!collapsed && (
            <span className="text-base text-brand-primary">
              <span className="font-normal">Hire</span>
              <span className="font-semibold">Smart</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
            Workspace
          </div>
        )}
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-2" : "px-3",
                    active
                      ? "bg-brand-mint/25 text-brand-primary"
                      : "text-brand-text hover:bg-brand-mint/10",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-brand-primary" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && "badge" in item && item.badge && item.badge > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-magenta px-1.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Settings + user */}
      <div className="border-t border-border p-2">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
            collapsed ? "justify-center px-2" : "px-3",
            isActive("/settings")
              ? "bg-brand-mint/25 text-brand-primary"
              : "text-brand-text hover:bg-brand-mint/10",
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-[18px] w-[18px]" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div className={cn("mt-2 flex items-center gap-3 rounded-md px-3 py-2", collapsed && "justify-center px-2")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-seafoam text-xs font-semibold text-brand-primary">
            {currentUser.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-brand-text">{currentUser.name}</div>
              <div className="truncate text-[11px] capitalize text-brand-text-secondary">
                {currentUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

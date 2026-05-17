import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-brand-bg">
      <AppSidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

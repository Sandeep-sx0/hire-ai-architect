import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HireSmart" }, { name: "description", content: "Recruitment operations overview." }] }),
  component: () => (
    <UnderConstruction
      title="Dashboard"
      subtitle="Your recruitment operations overview — live KPIs, active searches, and team activity."
      icon={LayoutDashboard}
    />
  ),
});

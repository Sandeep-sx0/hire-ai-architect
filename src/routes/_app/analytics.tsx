import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="Analytics"
      subtitle="Funnel performance, time-to-fill, source-of-hire, and team productivity."
      icon={BarChart3}
    />
  ),
});

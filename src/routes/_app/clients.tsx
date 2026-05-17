import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/clients")({
  head: () => ({ meta: [{ title: "Clients — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="Clients"
      subtitle="Every employer relationship — past, present, and prospective."
      icon={Building2}
    />
  ),
});

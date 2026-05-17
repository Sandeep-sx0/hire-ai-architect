import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/outreach/new")({
  head: () => ({ meta: [{ title: "New Campaign — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="New campaign"
      subtitle="Wizard: select project, audience, channel, message, schedule."
      icon={Sparkles}
    />
  ),
});

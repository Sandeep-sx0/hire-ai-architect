import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/outreach")({
  head: () => ({ meta: [{ title: "Outreach — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="Outreach"
      subtitle="AI-personalized email and InMail campaigns, sequenced and tracked."
      icon={Send}
    />
  ),
});

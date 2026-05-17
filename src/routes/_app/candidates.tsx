import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/candidates")({
  head: () => ({ meta: [{ title: "Candidates — HireSmart" }, { name: "description", content: "Your full candidate database." }] }),
  component: () => (
    <UnderConstruction
      title="Candidates"
      subtitle="Your full talent database — from inbound CVs to LinkedIn imports."
      icon={Users}
    />
  ),
});

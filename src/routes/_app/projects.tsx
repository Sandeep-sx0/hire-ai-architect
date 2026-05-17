import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — HireSmart" }, { name: "description", content: "All active and historical search projects." }] }),
  component: () => (
    <UnderConstruction
      title="Projects"
      subtitle="Every search mandate — open, sourcing, shortlisted, and placed."
      icon={Briefcase}
    />
  ),
});

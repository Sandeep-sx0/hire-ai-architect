import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/projects/$id/parse")({
  head: () => ({ meta: [{ title: "Parse JD — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="Parse job description"
      subtitle="AI-extracted requirements, must-haves, and nice-to-haves — review before publishing."
      icon={FileText}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="Settings"
      subtitle="Team · Workspace · Integrations · Billing"
      icon={SettingsIcon}
    />
  ),
});

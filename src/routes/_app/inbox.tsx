import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { UnderConstruction } from "@/components/shared";

export const Route = createFileRoute("/_app/inbox")({
  head: () => ({ meta: [{ title: "Inbox — HireSmart" }] }),
  component: () => (
    <UnderConstruction
      title="Inbox"
      subtitle="Unified replies from every channel — classified, prioritized, ready to action."
      icon={Inbox}
    />
  ),
});

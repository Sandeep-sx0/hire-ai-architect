import type { LucideIcon } from "lucide-react";
import { Hammer } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";

interface UnderConstructionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  message?: string;
}

export function UnderConstruction({
  title,
  subtitle,
  icon = Hammer,
  message = "This module is part of the HireSmart roadmap and will be built next. The scaffold, design system, and routing are in place.",
}: UnderConstructionProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <EmptyState icon={icon} title="Under construction" description={message} />
    </div>
  );
}

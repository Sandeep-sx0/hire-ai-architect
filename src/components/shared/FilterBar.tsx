import type { ReactNode } from "react";
import { Search, LayoutGrid, List, Columns3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "kanban" | "grid";

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  viewToggle?: ViewMode;
  onViewToggleChange?: (value: ViewMode) => void;
  children?: ReactNode;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearch,
  viewToggle,
  onViewToggleChange,
  children,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3",
        className,
      )}
    >
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
        <Input
          value={searchValue ?? ""}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">{children}</div>

      {viewToggle && onViewToggleChange && (
        <ToggleGroup
          type="single"
          value={viewToggle}
          onValueChange={(v) => v && onViewToggleChange(v as ViewMode)}
          className="ml-auto"
        >
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            <Columns3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
}

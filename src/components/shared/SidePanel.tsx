import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "md" | "lg";
}

export function SidePanel({ isOpen, onClose, title, children, width = "md" }: SidePanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-none"
        style={{ width: width === "lg" ? 640 : 480, maxWidth: "100vw" }}
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-base font-semibold text-brand-text">{title}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-6 py-5" style={{ height: "calc(100vh - 65px)" }}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

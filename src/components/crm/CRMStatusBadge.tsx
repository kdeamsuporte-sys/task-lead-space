import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneMap: Record<BadgeTone, string> = {
  neutral: "border-border bg-secondary/60 text-foreground/80",
  primary: "border-primary/40 bg-primary/12 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-border bg-card/70 text-foreground/85",
};

export function CRMStatusBadge({
  tone = "neutral",
  icon: Icon,
  children,
  className,
  size = "sm",
}: {
  tone?: BadgeTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        toneMap[tone],
        className,
      )}
    >
      {Icon && <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />}
      {children}
    </span>
  );
}

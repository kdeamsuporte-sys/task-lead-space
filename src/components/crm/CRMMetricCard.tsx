import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MetricTone = "primary" | "warning" | "danger" | "success" | "info";

const toneMap: Record<MetricTone, { ring: string; bg: string; text: string; glow: string }> = {
  primary: { ring: "ring-primary/30", bg: "bg-primary/12", text: "text-primary", glow: "from-primary/20" },
  warning: { ring: "ring-warning/30", bg: "bg-warning/12", text: "text-warning", glow: "from-warning/20" },
  danger: { ring: "ring-destructive/30", bg: "bg-destructive/12", text: "text-destructive", glow: "from-destructive/20" },
  success: { ring: "ring-success/30", bg: "bg-success/12", text: "text-success", glow: "from-success/20" },
  info: { ring: "ring-border", bg: "bg-secondary", text: "text-foreground", glow: "from-foreground/10" },
};

export function CRMMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  tone = "primary",
  onClick,
  active,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  delta?: string;
  tone?: MetricTone;
  onClick?: () => void;
  active?: boolean;
}) {
  const t = toneMap[tone];
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card shine ring-premium group relative overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5",
        active ? "border-primary/50 shadow-[0_18px_50px_-16px_oklch(0.72_0.205_38_/_0.45)]" : "hover:border-primary/30",
      )}
    >
      <div className={cn("pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-50 blur-2xl transition group-hover:opacity-90", t.glow)} />
      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", t.bg, t.ring, t.text)}>
          <Icon className="h-4 w-4" />
        </div>
        {delta && (
          <span className="inline-flex items-center gap-0.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
            <ArrowUpRight className="h-2.5 w-2.5" /> {delta}
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <div className="text-3xl font-black tracking-tight tabular-nums">{value}</div>
        <div className="mt-0.5 text-[13px] font-semibold text-foreground/90">{label}</div>
      </div>
      {hint && <div className="relative mt-1.5 text-[11px] leading-snug text-muted-foreground">{hint}</div>}
    </button>
  );
}

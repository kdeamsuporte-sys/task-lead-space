import { TrendingUp, AlertTriangle, Clock, Flame, Coins } from "lucide-react";
import { kpis } from "./data";
import { cn } from "@/lib/utils";

const iconMap = { leads: TrendingUp, orc: Clock, ret: AlertTriangle, hot: Flame, pot: Coins };
const toneMap = {
  primary: "text-primary bg-primary/10 border-primary/30",
  warning: "text-warning bg-warning/10 border-warning/30",
  danger: "text-destructive bg-destructive/10 border-destructive/30",
  success: "text-success bg-success/10 border-success/30",
  info: "text-foreground bg-secondary border-border",
};

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((k) => {
        const Icon = iconMap[k.id as keyof typeof iconMap];
        return (
          <button
            key={k.id}
            className="glass-card group relative overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", toneMap[k.tone])}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {k.delta}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight">{k.value}</div>
              <div className="mt-0.5 text-sm font-medium text-foreground/90">{k.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.hint}</div>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
}

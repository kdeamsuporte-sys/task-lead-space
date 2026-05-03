import { TrendingUp, AlertTriangle, Clock, Flame, Coins, ArrowUpRight } from "lucide-react";
import { kpis } from "./data";
import { cn } from "@/lib/utils";

const iconMap = { leads: TrendingUp, orc: Clock, ret: AlertTriangle, hot: Flame, pot: Coins };
const toneMap = {
  primary: { ring: "ring-primary/30", bg: "bg-primary/12", text: "text-primary", glow: "from-primary/20" },
  warning: { ring: "ring-warning/30", bg: "bg-warning/12", text: "text-warning", glow: "from-warning/20" },
  danger: { ring: "ring-destructive/30", bg: "bg-destructive/12", text: "text-destructive", glow: "from-destructive/20" },
  success: { ring: "ring-success/30", bg: "bg-success/12", text: "text-success", glow: "from-success/20" },
  info: { ring: "ring-border", bg: "bg-secondary", text: "text-foreground", glow: "from-foreground/10" },
};

const sparks: Record<string, number[]> = {
  leads: [3, 4, 2, 5, 4, 6, 7],
  orc: [1, 2, 2, 3, 2, 3, 4],
  ret: [0, 1, 1, 2, 1, 2, 2],
  hot: [2, 2, 3, 3, 4, 4, 5],
  pot: [2, 3, 3, 4, 3, 5, 6],
};

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const w = 84;
  const h = 28;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <polygon points={area} className={color} fillOpacity={0.14} />
      <polyline points={pts} fill="none" strokeWidth={1.5} className={color} stroke="currentColor" />
      <circle cx={w} cy={h - (data[data.length - 1] / max) * h} r={2.5} className={color} fill="currentColor" />
    </svg>
  );
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((k) => {
        const Icon = iconMap[k.id as keyof typeof iconMap];
        const tone = toneMap[k.tone];
        return (
          <button
            key={k.id}
            className="glass-card shine ring-premium group relative overflow-hidden rounded-2xl p-3 sm:p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-50 blur-2xl transition group-hover:opacity-90",
                tone.glow,
              )}
            />
            <div className="relative flex items-start justify-between">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", tone.bg, tone.ring, tone.text)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                <ArrowUpRight className="h-2.5 w-2.5" /> {k.delta}
              </span>
            </div>
            <div className="relative mt-4 sm:mt-5 flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums">{k.value}</div>
                <div className="mt-0.5 text-[12px] sm:text-[13px] font-semibold text-foreground/90">{k.label}</div>
              </div>
              <div className={cn("hidden sm:block", tone.text)}>
                <Spark data={sparks[k.id] ?? [1, 2, 3]} color={tone.text} />
              </div>
            </div>
            <div className="relative mt-2 text-[10px] sm:text-[11px] leading-snug text-muted-foreground line-clamp-2">{k.hint}</div>
          </button>
        );
      })}
    </div>
  );
}

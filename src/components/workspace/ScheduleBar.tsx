import { Calendar, Phone, MessageSquare, FileText, MapPin, Star, Wallet, ChevronRight, Clock } from "lucide-react";
import { schedule } from "./data";
import { cn } from "@/lib/utils";

const iconMap = { phone: Phone, message: MessageSquare, file: FileText, calendar: Calendar, map: MapPin, star: Star, wallet: Wallet };

const hours = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];

// Convert "HH:MM" to fractional position 0..1 across 08:00–18:00 window
function hourPos(t: string) {
  const [h, m] = t.split(":").map(Number);
  return Math.max(0, Math.min(1, (h + m / 60 - 8) / 10));
}

export function ScheduleBar() {
  const nowPos = hourPos("11:20");

  return (
    <section className="glass-elevated relative overflow-hidden rounded-3xl p-4 sm:p-5">
      {/* radial accent */}
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "var(--gradient-radial-primary)" }} />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">Hoje no comercial</span>
                <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> ao vivo
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">28 de Março · sexta-feira</h2>
              <div className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{schedule.length} ações</span> programadas ·{" "}
                <span className="text-warning">2 críticas</span> · <span className="text-foreground/70">próxima em 14 min</span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground md:inline-flex">
              <Clock className="h-3 w-3" /> 11:20
            </div>
            <button className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.72_0.205_38_/_0.7)] hover:bg-primary/90">
              Ver agenda completa <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline (desktop) */}
        <div className="mt-6 hidden md:block">
          <div className="relative h-[112px] rounded-2xl border border-border-soft bg-background/40 px-4">
            {/* hour ticks */}
            <div className="absolute inset-x-4 top-3 flex justify-between text-[10px] font-mono text-muted-foreground">
              {hours.map((h) => (
                <span key={h} className="flex flex-col items-center gap-1">
                  <span>{h}:00</span>
                  <span className="h-1 w-px bg-border" />
                </span>
              ))}
            </div>

            {/* baseline */}
            <div className="absolute inset-x-4 top-[34px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* now line */}
            <div
              className="absolute top-2 bottom-2 w-px bg-primary/70"
              style={{ left: `calc(1rem + ${nowPos * 100}% - ${nowPos * 2}rem)` }}
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_4px_oklch(0.72_0.205_38_/_0.2)]" />
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                AGORA
              </span>
            </div>

            {/* events */}
            <div className="absolute inset-x-4 top-12 bottom-3">
              {schedule.map((s, i) => {
                const Icon = iconMap[s.icon as keyof typeof iconMap];
                const left = hourPos(s.time);
                const tone =
                  s.urgency === "critico"
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : s.urgency === "atencao"
                    ? "border-warning/35 bg-warning/10 text-warning"
                    : "border-border bg-card/80 text-foreground/80";
                return (
                  <button
                    key={i}
                    className={cn(
                      "group absolute -translate-x-1/2 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm transition hover:-translate-y-[3px] hover:translate-x-[-50%]",
                      tone,
                    )}
                    style={{ left: `${left * 100}%`, top: i % 2 === 0 ? 0 : 26 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3" />
                      <span className="font-mono opacity-80">{s.time}</span>
                      <span className="text-foreground/90">{s.type}</span>
                    </span>
                    <span className="mt-0.5 block text-left text-[10px] text-foreground/60">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: vertical list */}
        <div className="mt-4 md:hidden">
          <div className="mb-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>08:00 — 18:00</span>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" /> AGORA 11:20
            </span>
          </div>
          <ul className="space-y-2">
            {schedule.map((s, i) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap];
              const tone =
                s.urgency === "critico"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : s.urgency === "atencao"
                  ? "border-warning/35 bg-warning/10 text-warning"
                  : "border-border bg-card/70 text-foreground/80";
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2 backdrop-blur-sm",
                    tone,
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/60">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[11px] font-bold tabular-nums">{s.time}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-foreground/90">{s.type}</div>
                    <div className="truncate text-[11px] text-foreground/60">{s.name}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

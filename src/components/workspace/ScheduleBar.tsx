import { Calendar, Phone, MessageSquare, FileText, MapPin, Star, Wallet, ChevronRight } from "lucide-react";
import { schedule } from "./data";
import { cn } from "@/lib/utils";

const iconMap = { phone: Phone, message: MessageSquare, file: FileText, calendar: Calendar, map: MapPin, star: Star, wallet: Wallet };

export function ScheduleBar() {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 p-1.5 pl-2 backdrop-blur-md">
      <div className="flex shrink-0 items-center gap-2 rounded-full bg-background/60 px-4 py-2">
        <Calendar className="h-4 w-4 text-primary" />
        <div className="leading-tight">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Hoje no Comercial</div>
          <div className="text-sm font-semibold">28 de Março · 7 ações</div>
        </div>
      </div>
      <div className="scroll-x-soft flex flex-1 items-center gap-2 overflow-x-auto pr-1">
        {schedule.map((s, i) => {
          const Icon = iconMap[s.icon as keyof typeof iconMap];
          const tone =
            s.urgency === "critico"
              ? "bg-primary/15 border-primary/40 text-primary"
              : s.urgency === "atencao"
              ? "bg-warning/10 border-warning/30 text-warning"
              : "bg-secondary border-border text-foreground/80";
          return (
            <button
              key={i}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:translate-y-[-1px]",
                tone,
              )}
            >
              <span className="font-mono text-[11px] opacity-80">{s.time}</span>
              <Icon className="h-3.5 w-3.5" />
              <span className="text-foreground/90">{s.type}</span>
              <span className="text-foreground/60">·</span>
              <span className="text-foreground/80">{s.name}</span>
            </button>
          );
        })}
      </div>
      <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

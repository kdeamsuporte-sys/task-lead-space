import { ArrowUpRight, MessageCircle, FileText, Search, SlidersHorizontal, Flame, MapPin, Tag } from "lucide-react";
import { leads, type Temperature } from "./data";
import { cn } from "@/lib/utils";

const tempMap: Record<Temperature, { label: string; cls: string; dots: number; icon?: any }> = {
  quente: { label: "Quente", cls: "text-primary bg-primary/15 border-primary/35", dots: 5, icon: Flame },
  morno: { label: "Morno", cls: "text-warning bg-warning/12 border-warning/30", dots: 3 },
  frio: { label: "Frio", cls: "text-muted-foreground bg-secondary border-border", dots: 2 },
};

const filters = ["Todos", "Hot Client", "Grande interesse", "Médio interesse", "Baixo interesse"];

export function LeadsRow({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">Inbox comercial</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Novos Leads</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{leads.length}</span> aguardando primeiro toque
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Search className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="ml-1 hidden gap-1.5 md:flex">
            {filters.map((f, i) => (
              <button
                key={f}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  i === 0
                    ? "border-primary/40 bg-primary/12 text-primary shadow-[0_4px_16px_-6px_oklch(0.72_0.205_38_/_0.5)]"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {i === 1 && <Flame className="-ml-0.5 mr-1 inline h-3 w-3" />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="scroll-x-soft -mx-1 flex gap-4 overflow-x-auto px-1 pb-3">
        {leads.map((l) => {
          const t = tempMap[l.temperature];
          const TIcon = t.icon;
          return (
            <article
              key={l.id}
              onClick={() => onSelect(l.id)}
              className="glass-card shine ring-premium group relative flex w-[290px] shrink-0 cursor-pointer flex-col gap-3 rounded-2xl p-4 transition hover:-translate-y-1 hover:border-primary/40"
            >
              {/* top-right action */}
              <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3 pr-10">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black text-primary ring-1 ring-primary/30">
                  {l.initials}
                  {l.temperature === "quente" && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                      <Flame className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold leading-tight">{l.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Tag className="h-3 w-3" /> <span className="truncate">{l.service}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border-soft bg-background/40 px-2.5 py-2">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Origem</div>
                  <div className="mt-0.5 truncate font-semibold">{l.origin}</div>
                </div>
                <div className="rounded-xl border border-border-soft bg-background/40 px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" /> Bairro
                  </div>
                  <div className="mt-0.5 truncate font-semibold">{l.district}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold", t.cls)}>
                  {TIcon && <TIcon className="h-3 w-3" />}
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={cn("h-1 w-1 rounded-full", i < t.dots ? "bg-current" : "bg-current/25")} />
                    ))}
                  </span>
                  {t.label}
                </span>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Potencial</div>
                  <div className="text-xs font-bold text-foreground">{l.estimate}</div>
                </div>
              </div>

              <div className="divider-soft" />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">Último toque · <span className="text-foreground/80">{l.lastTouch}</span></span>
                <div className="flex gap-1.5">
                  <button className="flex items-center justify-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30 hover:bg-success/25">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-border bg-background/60 p-1.5 text-foreground hover:bg-background">
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

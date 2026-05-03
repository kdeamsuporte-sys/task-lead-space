import { ArrowUpRight, MessageCircle, FileText, Search, SlidersHorizontal, Flame } from "lucide-react";
import { leads, type Temperature } from "./data";
import { cn } from "@/lib/utils";

const tempMap: Record<Temperature, { label: string; cls: string; dots: number }> = {
  quente: { label: "Quente", cls: "text-primary bg-primary/15 border-primary/30", dots: 5 },
  morno: { label: "Morno", cls: "text-warning bg-warning/10 border-warning/30", dots: 3 },
  frio: { label: "Frio", cls: "text-muted-foreground bg-secondary border-border", dots: 2 },
};

const filters = ["Todos", "Hot Client", "Grande interesse", "Médio interesse", "Baixo interesse"];

export function LeadsRow({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold tracking-tight">Novos Leads</h2>
          <span className="text-sm text-muted-foreground underline-offset-4">
            <span className="font-semibold text-foreground">{leads.length}</span> leads novos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-card/80">
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-card/80">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="ml-1 hidden gap-1.5 md:flex">
            {filters.map((f, i) => (
              <button
                key={f}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  i === 0
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {i === 1 && <Flame className="-ml-0.5 mr-1 inline h-3 w-3" />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="scroll-x-soft -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {leads.map((l) => {
          const t = tempMap[l.temperature];
          return (
            <article
              key={l.id}
              onClick={() => onSelect(l.id)}
              className="glass-card group relative flex w-[280px] shrink-0 cursor-pointer flex-col gap-3 rounded-2xl p-4 transition hover:border-primary/40"
            >
              <button className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition group-hover:text-primary">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/30">
                  {l.initials}
                </div>
                <div>
                  <div className="font-semibold leading-tight">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.service}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border bg-background/40 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Origem</div>
                  <div className="font-medium">{l.origin}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/40 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bairro</div>
                  <div className="font-medium">{l.district}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", t.cls)}>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < t.dots ? "bg-current" : "bg-current/20")} />
                    ))}
                  </span>
                  {t.label}
                </span>
                <span className="text-[11px] text-muted-foreground">Toque: {l.lastTouch}</span>
              </div>

              <div className="mt-1 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-2 text-xs font-semibold text-success ring-1 ring-success/30 hover:bg-success/25">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-background">
                  <FileText className="h-3.5 w-3.5" /> Orçamento
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

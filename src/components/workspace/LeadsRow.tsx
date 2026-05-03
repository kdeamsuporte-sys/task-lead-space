import { useState, useMemo } from "react";
import { ArrowUpRight, MessageCircle, FileText, Search, Flame, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { usePipeline } from "@/hooks/use-crm";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const tempMap: Record<string, { label: string; cls: string; dots: number }> = {
  quente: { label: "Quente", cls: "text-primary bg-primary/15 border-primary/35", dots: 5 },
  morno: { label: "Morno", cls: "text-warning bg-warning/12 border-warning/30", dots: 3 },
  frio: { label: "Frio", cls: "text-muted-foreground bg-secondary border-border", dots: 2 },
};

const filters = ["Todos", "Quente", "Morno", "Frio"] as const;
type Filter = typeof filters[number];

export function LeadsRow({ onSelect, selected }: { onSelect: (id: string) => void; selected?: string | null }) {
  const { data: all = [] } = usePipeline();
  const [filter, setFilter] = useState<Filter>("Todos");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let l = all.filter((c) => c.stage === "novo_lead" || c.stage === "aguardando_info");
    if (filter !== "Todos") l = l.filter((c) => c.temperature === filter.toLowerCase());
    if (q.trim()) {
      const s = q.toLowerCase();
      l = l.filter((c) => c.name.toLowerCase().includes(s) || (c.service ?? "").toLowerCase().includes(s));
    }
    return l;
  }, [all, filter, q]);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">Inbox comercial</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Novos Leads</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{list.length}</span> aguardando primeiro toque
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="h-9 rounded-full border border-border bg-card/60 pl-8 pr-3 text-xs outline-none focus:border-primary w-44" />
          </div>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", filter === f ? "border-primary/40 bg-primary/12 text-primary" : "border-border bg-card/60 text-muted-foreground hover:text-foreground")}>
                {f === "Quente" && <Flame className="-ml-0.5 mr-1 inline h-3 w-3" />}{f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">Nenhum lead aguardando.</div>
      ) : (
        <div className="scroll-x-soft -mx-1 flex gap-4 overflow-x-auto px-1 pb-3">
          {list.map((l) => {
            const t = tempMap[l.temperature] ?? tempMap.morno;
            const onWa = (e: React.MouseEvent) => {
              e.stopPropagation();
              const link = whatsappLink(l.phone, `Olá ${l.name.split(" ")[0]}, tudo bem?`);
              if (!link) return toast.error("Sem telefone");
              window.open(link, "_blank");
            };
            const isSel = selected === l.id;
            return (
              <article
                key={l.id}
                onClick={() => onSelect(l.id)}
                className={cn("glass-card shine ring-premium group relative flex w-[290px] shrink-0 cursor-pointer flex-col gap-3 rounded-2xl p-4 transition hover:-translate-y-1 hover:border-primary/40", isSel && "border-primary/60 ring-2 ring-primary/30")}
              >
                <button onClick={(e) => { e.stopPropagation(); onSelect(l.id); }} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-3 pr-10">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black text-primary ring-1 ring-primary/30">
                    {initials(l.name)}
                    {l.temperature === "quente" && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                        <Flame className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold leading-tight">{l.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Tag className="h-3 w-3" /> <span className="truncate">{l.service ?? "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-border-soft bg-background/40 px-2.5 py-2">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Origem</div>
                    <div className="mt-0.5 truncate font-semibold">{l.source ?? "—"}</div>
                  </div>
                  <div className="rounded-xl border border-border-soft bg-background/40 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" /> Bairro
                    </div>
                    <div className="mt-0.5 truncate font-semibold">{l.neighborhood ?? "—"}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold", t.cls)}>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={cn("h-1 w-1 rounded-full", i < t.dots ? "bg-current" : "bg-current/25")} />
                      ))}
                    </span>
                    {t.label}
                  </span>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Potencial</div>
                    <div className="text-xs font-bold text-foreground">{fmtMoney(l.potential_value)}</div>
                  </div>
                </div>
                <div className="divider-soft" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground truncate">{l.last_contact_at ? `Último · ${new Date(l.last_contact_at).toLocaleDateString("pt-BR")}` : "Sem contato"}</span>
                  <div className="flex gap-1.5">
                    <button onClick={onWa} className="flex items-center justify-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30 hover:bg-success/25">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onSelect(l.id); }} className="flex items-center justify-center rounded-lg border border-border bg-background/60 p-1.5 text-foreground hover:bg-background">
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

import { Bell, ArrowUpRight, MessageCircle, Send, Phone, Camera, Wallet, Star, RotateCcw, Calendar, FileText } from "lucide-react";
import { tasks, type Task } from "./data";
import { cn } from "@/lib/utils";

const typeMeta: Record<Task["type"], { icon: any; primary: string }> = {
  follow: { icon: RotateCcw, primary: "Abrir WhatsApp" },
  orcamento: { icon: FileText, primary: "Enviar proposta" },
  agenda: { icon: Calendar, primary: "Confirmar" },
  sinal: { icon: Wallet, primary: "Cobrar sinal" },
  fotos: { icon: Camera, primary: "Pedir fotos" },
  posvenda: { icon: Star, primary: "Mensagem" },
  review: { icon: Star, primary: "Pedir avaliação" },
};

const priorityMap = {
  alta: "border-l-primary",
  media: "border-l-warning",
  baixa: "border-l-border",
};

const filters = ["Todas", "Hot", "Hoje", "Atrasadas", "Concluídas"];

export function TasksRow() {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold tracking-tight">Tarefas de Hoje</h2>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{tasks.length}</span> tarefas
          </span>
        </div>
        <div className="hidden gap-1.5 md:flex">
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
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((t) => {
          const meta = typeMeta[t.type];
          const Icon = meta.icon;
          return (
            <article
              key={t.id}
              className={cn(
                "glass-card group relative rounded-2xl border-l-[3px] p-3 sm:p-4 transition hover:-translate-y-0.5",
                priorityMap[t.priority],
                t.highlight && "glow-orange",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">{t.client} · {t.service}</div>
                    <div className="text-sm sm:text-base font-semibold leading-tight">{t.title}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground">
                    <Bell className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {t.meta && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs text-foreground/80">
                  {t.meta}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 min-h-[40px]">
                  <Send className="h-3.5 w-3.5" /> {meta.primary}
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-background min-h-[40px]">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground hover:text-foreground">
                  <Phone className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { useState } from "react";
import { MessageCircle, Send, Calendar, FileText, CheckCircle2, Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/use-crm";
import { TaskDialog } from "@/components/crm/TaskDialog";
import { cn } from "@/lib/utils";

const filters = ["todas", "hoje", "atrasadas", "concluidas"] as const;
const labels: Record<typeof filters[number], string> = { todas: "Todas", hoje: "Hoje", atrasadas: "Atrasadas", concluidas: "Concluídas" };

const priorityMap: Record<string, string> = {
  alta: "border-l-primary",
  media: "border-l-warning",
  baixa: "border-l-border",
};

export function TasksRow({ onSelect }: { onSelect?: (id: string) => void }) {
  const [filter, setFilter] = useState<typeof filters[number]>("todas");
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });
  const { data: list = [] } = useTasks(filter);
  const toggle = useToggleTask();
  const del = useDeleteTask();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold tracking-tight">Tarefas</h2>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{list.length}</span> tarefas
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", filter === f ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
                {labels[f]}
              </button>
            ))}
          </div>
          <button onClick={() => setDlg({ open: true, initial: null })} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Plus className="h-3.5 w-3.5" /> Nova
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">Nenhuma tarefa.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t: any) => {
            const overdue = t.due_at && new Date(t.due_at) < new Date() && t.status === "pendente";
            return (
              <article key={t.id} className={cn("glass-card group relative rounded-2xl border-l-[3px] p-3 sm:p-4 transition hover:-translate-y-0.5", priorityMap[t.priority] ?? "border-l-border", t.status === "concluida" && "opacity-60")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggle.mutate({ id: t.id, status: t.status === "concluida" ? "pendente" : "concluida" })}
                      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition", t.status === "concluida" ? "bg-success/15 text-success ring-success/30" : "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => t.contact_id && onSelect?.(t.contact_id)}>
                      {t.contact && <div className="truncate text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">{t.contact.name}</div>}
                      <div className={cn("text-sm sm:text-base font-semibold leading-tight", t.status === "concluida" && "line-through")}>{t.title}</div>
                      {t.description && <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{t.description}</div>}
                    </div>
                  </div>
                  <button onClick={async () => { if (confirm("Excluir?")) { try { await del.mutateAsync(t.id); toast.success("Removida"); } catch(e:any){toast.error(e?.message);} } }} className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {t.due_at && (
                  <div className={cn("mt-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs", overdue ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-background/40 text-foreground/80")}>
                    <Clock className="h-3 w-3" />{new Date(t.due_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => setDlg({ open: true, initial: t })} className="flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 min-h-[40px]">
                    <FileText className="h-3.5 w-3.5" /> Editar
                  </button>
                  {t.contact_id && (
                    <button onClick={() => onSelect?.(t.contact_id)} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground min-h-[40px]">
                      <MessageCircle className="h-3.5 w-3.5" /> Abrir
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <TaskDialog open={dlg.open} onOpenChange={(v) => setDlg({ open: v, initial: null })} initial={dlg.initial} />
    </section>
  );
}

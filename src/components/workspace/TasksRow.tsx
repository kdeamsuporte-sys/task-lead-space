import { useState, useMemo } from "react";
import { MessageCircle, FileText, CheckCircle2, Trash2, Plus, Clock, MoreHorizontal, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/use-crm";
import { TaskDialog } from "@/components/crm/TaskDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const filters = ["todas", "hoje", "atrasadas", "concluidas"] as const;
const labels: Record<typeof filters[number], string> = { todas: "Todas", hoje: "Hoje", atrasadas: "Atrasadas", concluidas: "Concluídas" };

const priorityMap: Record<string, string> = {
  alta: "border-l-primary",
  media: "border-l-warning",
  baixa: "border-l-border",
};

type Group = "atrasadas" | "hoje" | "proximas" | "concluidas";
const groupLabels: Record<Group, string> = { atrasadas: "Atrasadas", hoje: "Hoje", proximas: "Próximas", concluidas: "Concluídas" };

function bucketOf(t: any): Group {
  if (t.status === "concluida") return "concluidas";
  if (!t.due_at) return "proximas";
  const now = new Date();
  const due = new Date(t.due_at);
  if (due < now) return "atrasadas";
  const sameDay = due.toDateString() === now.toDateString();
  return sameDay ? "hoje" : "proximas";
}

export function TasksRow({ onSelect }: { onSelect?: (id: string) => void }) {
  const [filter, setFilter] = useState<typeof filters[number]>("todas");
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });
  const [collapsed, setCollapsed] = useState<Record<Group, boolean>>({ atrasadas: false, hoje: false, proximas: false, concluidas: true });
  const { data: list = [] } = useTasks(filter);
  const toggle = useToggleTask();
  const del = useDeleteTask();

  const grouped = useMemo(() => {
    const g: Record<Group, any[]> = { atrasadas: [], hoje: [], proximas: [], concluidas: [] };
    for (const t of list) g[bucketOf(t)].push(t);
    return g;
  }, [list]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir tarefa?")) return;
    try { await del.mutateAsync(id); toast.success("Removida"); } catch (e: any) { toast.error(e?.message); }
  };

  const renderRow = (t: any) => {
    const overdue = t.due_at && new Date(t.due_at) < new Date() && t.status === "pendente";
    return (
      <article
        key={t.id}
        className={cn(
          "glass-card group relative flex items-center gap-2.5 rounded-xl border-l-[3px] px-2.5 py-2 sm:px-3 sm:py-2.5 transition",
          priorityMap[t.priority] ?? "border-l-border",
          t.status === "concluida" && "opacity-60"
        )}
      >
        <button
          onClick={(e) => { e.stopPropagation(); toggle.mutate({ id: t.id, status: t.status === "concluida" ? "pendente" : "concluida" }); }}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition",
            t.status === "concluida" ? "bg-success/15 text-success ring-success/30" : "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20"
          )}
          aria-label="Alternar conclusão"
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => (t.contact_id ? onSelect?.(t.contact_id) : setDlg({ open: true, initial: t }))}
          className="min-w-0 flex-1 text-left"
        >
          <div className={cn("truncate text-sm font-semibold leading-tight", t.status === "concluida" && "line-through")}>{t.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {t.contact?.name && <span className="truncate max-w-[40%]">{t.contact.name}</span>}
            {t.contact?.name && t.due_at && <span className="opacity-50">·</span>}
            {t.due_at && (
              <span className={cn("inline-flex items-center gap-1 truncate", overdue && "text-destructive font-semibold")}>
                <Clock className="h-3 w-3 shrink-0" />
                {new Date(t.due_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {overdue && <span className="ml-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />}
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Mais ações">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => setDlg({ open: true, initial: t })}>
              <FileText className="mr-2 h-3.5 w-3.5" /> Editar
            </DropdownMenuItem>
            {t.contact_id && (
              <DropdownMenuItem onSelect={() => onSelect?.(t.contact_id)}>
                <MessageCircle className="mr-2 h-3.5 w-3.5" /> Abrir contato
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleDelete(t.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </article>
    );
  };

  const showGroups = filter === "todas";
  const order: Group[] = ["atrasadas", "hoje", "proximas", "concluidas"];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">Tarefas</h2>
          <span className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{list.length}</span>
          </span>
        </div>
        <button onClick={() => setDlg({ open: true, initial: null })} className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-3.5 w-3.5" /> Nova
        </button>
      </div>

      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hide">
        {filters.map((f) => {
          const count = f === "todas" ? list.length : grouped[f === "concluidas" ? "concluidas" : f === "hoje" ? "hoje" : "atrasadas"]?.length;
          return (
            <button key={f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition", filter === f ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
              {labels[f]}{f !== "todas" && count !== undefined ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">Nenhuma tarefa.</div>
      ) : showGroups ? (
        <div className="space-y-3">
          {order.map((g) => {
            const items = grouped[g];
            if (!items.length) return null;
            const isCollapsed = collapsed[g];
            return (
              <div key={g}>
                <button onClick={() => setCollapsed((c) => ({ ...c, [g]: !c[g] }))} className="mb-1.5 flex w-full items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isCollapsed && "-rotate-90")} />
                  <span className={cn(g === "atrasadas" && "text-destructive")}>{groupLabels[g]}</span>
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground/70">{items.length}</span>
                </button>
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                    {items.map(renderRow)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
          {list.map(renderRow)}
        </div>
      )}

      <TaskDialog open={dlg.open} onOpenChange={(v) => setDlg({ open: v, initial: null })} initial={dlg.initial} />
    </section>
  );
}

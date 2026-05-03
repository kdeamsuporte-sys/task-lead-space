import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePipeline, useTasks, useAppointments, useToggleTask } from "@/hooks/use-crm";
import { ContactPanel } from "@/components/workspace/ContactPanel";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { TaskDialog } from "@/components/crm/TaskDialog";
import { AppointmentDialog } from "@/components/crm/AppointmentDialog";
import { FollowupDialog } from "@/components/crm/FollowupDialog";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, STAGE_LABEL } from "@/lib/format";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import {
  X, Users, ListTodo, CalendarDays, IdCard, Plus, MessageCircle,
  RotateCcw, CheckCircle2, Search, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "leads" | "tarefas" | "agenda" | "ficha";

export function CRMMobileDrawer({
  open, onClose, initialTab = "leads", initialContactId = null,
}: {
  open: boolean; onClose: () => void; initialTab?: Tab; initialContactId?: string | null;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [contactId, setContactId] = useState<string | null>(initialContactId);
  const [createOpen, setCreateOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);

  const { data: contacts = [] } = usePipeline();
  const { data: tasks = [] } = useTasks("todas");
  const { data: appts = [] } = useAppointments("semana");
  const toggleTask = useToggleTask();

  const filteredLeads = contacts
    .filter((c) => !["servico_realizado", "pos_venda", "perdido"].includes(c.stage))
    .filter((c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone ?? "").includes(search));

  const current = contacts.find((c) => c.id === contactId) ?? null;

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "leads", label: "Leads", icon: Users, count: contacts.filter((c) => !["servico_realizado", "pos_venda", "perdido"].includes(c.stage)).length },
    { id: "tarefas", label: "Tarefas", icon: ListTodo, count: tasks.filter((t: any) => t.status !== "concluida").length },
    { id: "agenda", label: "Agenda", icon: CalendarDays, count: appts.length },
    { id: "ficha", label: "Ficha 360º", icon: IdCard },
  ];

  const openWa = (c: any) => {
    const link = whatsappLink(c.phone, `Olá ${c.name.split(" ")[0]}`);
    if (!link) return toast.error("Sem telefone válido");
    window.open(link, "_blank");
  };

  const QuickActions = (
    <div className="grid grid-cols-4 gap-2 px-3 pt-3">
      {[
        { icon: Plus, label: "Lead", onClick: () => setCreateOpen(true), accent: true },
        { icon: ListTodo, label: "Tarefa", onClick: () => setTaskOpen(true) },
        { icon: CalendarDays, label: "Agendar", onClick: () => setApptOpen(true) },
        { icon: RotateCcw, label: "Retorno", onClick: () => setFollowOpen(true) },
      ].map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={cn(
            "flex flex-col items-center gap-1 rounded-2xl p-2.5 text-[10px] font-bold transition active:scale-95",
            a.accent ? "text-primary-foreground glow-soft" : "glass text-foreground",
          )}
          style={a.accent ? { background: "var(--gradient-primary)" } : undefined}
        >
          <a.icon className="h-4 w-4" />
          {a.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div
        className={cn("lg:hidden fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-3xl glass-strong flex flex-col transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Grabber */}
        <div className="pt-2 pb-1 flex justify-center"><div className="h-1.5 w-10 rounded-full bg-border" /></div>

        {/* Header */}
        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl grid place-items-center text-primary-foreground font-black glow-soft" style={{ background: "var(--gradient-primary)" }}>A</div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CRM ALTUM</div>
            <div className="text-sm font-bold truncate">{tabs.find((t) => t.id === tab)?.label}</div>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full glass" aria-label="Fechar"><X className="h-4 w-4" /></button>
        </div>

        {QuickActions}

        {/* Tabs */}
        <div className="px-3 pt-3">
          <div className="grid grid-cols-4 gap-1 rounded-2xl glass p-1">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-bold transition",
                    active ? "bg-primary/15 text-primary glow-soft" : "text-muted-foreground",
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="leading-none">{t.label}</span>
                  {!!t.count && (
                    <span className={cn("absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] grid place-items-center", active ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}>{t.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="mt-3 flex-1 overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),16px)]">
          {tab === "leads" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lead…" className="flex-1 bg-transparent text-xs outline-none" />
              </div>
              {filteredLeads.length === 0 ? (
                <CRMEmptyState icon={Users} title="Sem leads" description="Crie um novo contato para começar." />
              ) : filteredLeads.slice(0, 50).map((c) => (
                <article key={c.id} className="glass rounded-2xl p-3 flex gap-2.5 items-center">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center text-[11px] font-black text-primary">{initials(c.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm truncate">{c.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CRMStatusBadge tone="info">{STAGE_LABEL[c.stage]}</CRMStatusBadge>
                      <CRMStatusBadge tone={c.temperature === "quente" ? "primary" : c.temperature === "morno" ? "warning" : "neutral"}>{c.temperature}</CRMStatusBadge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openWa(c)} className="h-9 w-9 grid place-items-center rounded-full bg-success/15 text-success ring-1 ring-success/30"><MessageCircle className="h-4 w-4" /></button>
                    <button onClick={() => { setContactId(c.id); setTab("ficha"); }} className="h-9 w-9 grid place-items-center rounded-full glass text-primary"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === "tarefas" && (
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <CRMEmptyState icon={ListTodo} title="Sem tarefas" description="Adicione tarefas do dia." />
              ) : tasks.map((t: any) => {
                const done = t.status === "concluida";
                return (
                  <div key={t.id} className={cn("glass rounded-2xl p-3 flex items-center gap-3", done && "opacity-60")}>
                    <button
                      onClick={() => toggleTask.mutate({ id: t.id, status: done ? "pendente" : "concluida" })}
                      className={cn("h-7 w-7 grid place-items-center rounded-full border", done ? "bg-success border-success text-success-foreground glow-soft" : "border-border")}
                    >
                      {done && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={cn("font-bold text-sm", done && "line-through")}>{t.title}</div>
                      {t.contact?.name && <div className="text-[11px] text-muted-foreground truncate">{t.contact.name}</div>}
                    </div>
                    {t.due_at && <div className="text-[10px] text-muted-foreground">{new Date(t.due_at).toLocaleDateString("pt-BR")}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "agenda" && (
            <div className="space-y-2">
              {appts.length === 0 ? (
                <CRMEmptyState icon={CalendarDays} title="Sem agendamentos" description="Crie um novo agendamento." />
              ) : appts.map((a: any) => (
                <div key={a.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl glass-strong grid place-items-center glow-soft">
                    <div className="text-center">
                      <div className="text-[9px] uppercase font-bold text-muted-foreground">{new Date(a.scheduled_at).toLocaleDateString("pt-BR", { month: "short" })}</div>
                      <div className="text-base font-black leading-none text-primary">{new Date(a.scheduled_at).getDate()}</div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm truncate">{a.contact?.name ?? "Sem contato"}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(a.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {a.title || "Agendamento"}</div>
                  </div>
                  <CRMStatusBadge tone={a.status === "confirmado" ? "success" : a.status === "cancelado" ? "danger" : "warning"}>{a.status}</CRMStatusBadge>
                </div>
              ))}
            </div>
          )}

          {tab === "ficha" && (
            current ? (
              <ContactPanel contactId={current.id} onDeleted={() => { setContactId(null); setTab("leads"); }} />
            ) : (
              <CRMEmptyState icon={IdCard} title="Selecione um lead" description="Toque em um lead na aba Leads para abrir a Ficha 360º." />
            )
          )}
        </div>
      </aside>

      <ContactFormDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={(id) => { setContactId(id); setTab("ficha"); }} />
      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <AppointmentDialog open={apptOpen} onOpenChange={setApptOpen} />
      <FollowupDialog open={followOpen} onOpenChange={setFollowOpen} defaultContactId={contactId} />
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { useDashboard, useQuotes, useTasks, useToggleTask } from "@/hooks/use-crm";
import { useContacts } from "@/hooks/use-contacts";
import { fmtMoney, fmtDate, STAGE_LABEL } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { QuoteDialog } from "@/components/crm/QuoteDialog";
import { TaskDialog } from "@/components/crm/TaskDialog";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { Loader2, Plus, MessageCircle, Send, Coins, Award, TrendingUp, FileText, CheckCircle2, Circle, Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/comercial")({
  head: () => ({ meta: [{ title: "Comercial — ALTUM Portal" }, { name: "description", content: "Cards de leads, ações rápidas e tarefas do dia." }] }),
  component: Page,
});

function Page() {
  const { data: dash, isLoading: l1 } = useDashboard();
  const { data: contacts = [], isLoading: l2 } = useContacts();
  const { data: tasks = [], isLoading: l3 } = useTasks("hoje");
  const { data: quotes = [] } = useQuotes("todos");
  const toggle = useToggleTask();

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [defaultContact, setDefaultContact] = useState<string | null>(null);

  const hot = contacts.filter((c) => c.temperature === "quente" && !["perdido", "servico_realizado"].includes(c.stage)).slice(0, 6);

  const onWhats = (c: any) => {
    const link = whatsappLink(c.phone, `Olá ${c.name.split(" ")[0]}, tudo bem?`);
    if (!link) return toast.error("Sem telefone válido");
    window.open(link, "_blank");
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Comercial"
          title="Operação comercial"
          description="Cards de leads, ações rápidas e tarefas do dia conectadas ao banco."
          actions={
            <>
              <button onClick={() => { setDefaultContact(null); setContactOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-bold"><Plus className="h-3.5 w-3.5" /> Novo contato</button>
              <button onClick={() => { setDefaultContact(null); setQuoteOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><FileText className="h-3.5 w-3.5" /> Novo orçamento</button>
              <button onClick={() => { setDefaultContact(null); setTaskOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-bold text-primary"><Plus className="h-3.5 w-3.5" /> Nova tarefa</button>
            </>
          }
        />

        {l1 || !dash ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <CRMMetricCard icon={Send} label="Orçamentos parados" value={dash.orcParados} hint="Aguardando" tone="warning" />
            <CRMMetricCard icon={Coins} label="Em aberto" value={fmtMoney(dash.valorAberto)} tone="primary" />
            <CRMMetricCard icon={Award} label="Vendido" value={fmtMoney(dash.valorVendido)} hint={`${dash.closeRate}% close`} tone="success" />
            <CRMMetricCard icon={TrendingUp} label="Quentes" value={dash.quentes} hint="Ativos" tone="danger" />
          </div>
        )}

        <section className="glass-card rounded-3xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Leads quentes</div>
              <h3 className="mt-1 text-base font-bold">Para acionar agora</h3>
            </div>
          </div>
          {l2 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Carregando…</div>
          ) : hot.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Nenhum lead quente no momento.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {hot.map((c) => (
                <article key={c.id} className="rounded-2xl border border-border-soft bg-background/40 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black text-primary ring-1 ring-primary/30">
                      {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate text-sm font-bold">{c.name} <Flame className="h-3 w-3 text-primary" /></div>
                      <div className="truncate text-[11px] text-muted-foreground">{c.service ?? "—"} · {STAGE_LABEL[c.stage]}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-bold tabular-nums">{c.potential_value != null ? fmtMoney(c.potential_value) : "—"}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => onWhats(c)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-success/15 px-2 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30"><MessageCircle className="h-3 w-3" /> WhatsApp</button>
                    <button onClick={() => { setDefaultContact(c.id); setQuoteOpen(true); }} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/8 px-2 py-1.5 text-[11px] font-bold text-primary"><FileText className="h-3 w-3" /> Orçar</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Tarefas</div>
                <h3 className="mt-1 text-base font-bold">Hoje</h3>
              </div>
              <button onClick={() => { setDefaultContact(null); setTaskOpen(true); }} className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-bold"><Plus className="inline h-3 w-3" /> Nova</button>
            </div>
            {l3 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Carregando…</div>
            ) : tasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Sem tarefas para hoje.</div>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t: any) => {
                  const done = t.status === "concluida";
                  return (
                    <li key={t.id} className="flex items-start gap-3 rounded-xl border border-border-soft bg-background/40 p-3">
                      <button onClick={() => toggle.mutate({ id: t.id, status: done ? "pendente" : "concluida" })} className="mt-0.5 text-primary">
                        {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-bold ${done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                        <div className="text-[11px] text-muted-foreground">{t.contact?.name ? `${t.contact.name} · ` : ""}{fmtDate(t.due_at)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Orçamentos recentes</div>
              <h3 className="mt-1 text-base font-bold">Últimos lançamentos</h3>
            </div>
            {quotes.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Nenhum orçamento ainda.</div>
            ) : (
              <ul className="space-y-2">
                {quotes.slice(0, 6).map((q: any) => (
                  <li key={q.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-background/40 px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{q.service}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{q.contact?.name ?? "—"} · {q.status}</div>
                    </div>
                    <div className="text-sm font-bold tabular-nums">{fmtMoney(q.amount)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} defaultContactId={defaultContact} />
      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} defaultContactId={defaultContact} />
      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </CRMLayout>
  );
}

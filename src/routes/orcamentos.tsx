import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { QuoteDialog } from "@/components/crm/QuoteDialog";
import { useQuotes, useUpdateQuoteStatus, useDeleteQuote, useDashboard } from "@/hooks/use-crm";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, fmtMoney, fmtDate, QUOTE_STATUS_LABEL } from "@/lib/format";
import { Send, Clock, Check, X, AlertTriangle, FileText, MessageCircle, Calendar, RefreshCw, Plus, Coins, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({ meta: [{ title: "Orçamentos — ALTUM CRM" }, { name: "description", content: "Propostas comerciais." }] }),
  component: OrcamentosPage,
});

const filters = ["Todos", "Rascunho", "Enviado", "Visualizado", "Aguardando", "Aceito", "Recusado", "Expirado"];
const statusMap: Record<string, string> = { Todos: "todos", Rascunho: "rascunho", Enviado: "enviado", Visualizado: "visualizado", Aguardando: "aguardando", Aceito: "aceito", Recusado: "recusado", Expirado: "expirado" };

function OrcamentosPage() {
  const [f, setF] = useState("Todos");
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });
  const { data: list = [], isLoading } = useQuotes(statusMap[f]);
  const { data: dash } = useDashboard();
  const updateStatus = useUpdateQuoteStatus();
  const del = useDeleteQuote();

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Onde está o dinheiro"
          title="Orçamentos"
          description="Status, valor em aberto e ações comerciais."
          actions={
            <button onClick={() => setDlg({ open: true, initial: null })} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Novo orçamento
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <CRMMetricCard icon={Send} label="Enviados" value={dash?.quotesEnviados ?? 0} hint="Ag. ação cliente" tone="info" />
          <CRMMetricCard icon={Clock} label="Aguardando" value={dash?.quotesAguardando ?? 0} hint="Sem resposta" tone="warning" />
          <CRMMetricCard icon={Check} label="Aceitos" value={dash?.quotesAceitos ?? 0} hint="Total" tone="success" />
          <CRMMetricCard icon={Coins} label="Valor em aberto" value={fmtMoney(dash?.valorAberto ?? 0)} hint="Pendentes" tone="primary" />
          <CRMMetricCard icon={AlertTriangle} label="Expirados" value={dash?.quotesExpirados ?? 0} hint="Reativar" tone="danger" />
        </div>

        <CRMFilterChips options={filters} value={f} onChange={setF} />

        {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : list.length === 0 ? (
          <CRMEmptyState icon={FileText} title="Nenhum orçamento" description="Crie seu primeiro orçamento para começar a fechar negócios." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((q: any) => {
              const c = q.contact;
              const st = QUOTE_STATUS_LABEL[q.status] ?? { tone: "neutral", label: q.status };
              const onWa = () => {
                const link = whatsappLink(c?.phone, `Olá ${(c?.name ?? "").split(" ")[0]}, segue nosso orçamento de ${q.service}: ${fmtMoney(q.amount)}.`);
                if (!link) return toast.error("Sem telefone válido");
                window.open(link, "_blank");
              };
              return (
                <article key={q.id} className="glass-card ring-premium relative overflow-hidden rounded-2xl p-3 sm:p-4">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black text-primary ring-1 ring-primary/30">{initials(c?.name)}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{c?.name ?? "—"}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{q.service}</div>
                      </div>
                    </div>
                    <CRMStatusBadge tone={st.tone} size="xs">{st.label}</CRMStatusBadge>
                  </div>

                  <div className="relative mt-3 flex items-end justify-between gap-2 border-y border-border-soft py-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</div>
                      <div className="text-xl sm:text-2xl font-black text-primary tabular-nums">{fmtMoney(q.amount)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Validade</div>
                      <div className="text-xs font-bold">{q.valid_until ?? "—"}</div>
                    </div>
                  </div>

                  <div className="relative mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {fmtDate(q.created_at)}
                  </div>

                  <div className="relative mt-4 flex flex-wrap gap-2">
                    <button onClick={onWa} className="flex flex-1 min-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[40px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                    <button onClick={() => setDlg({ open: true, initial: q })} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[40px]"><Pencil className="h-3.5 w-3.5" /></button>
                    {q.status !== "aceito" && q.status !== "recusado" && (
                      <>
                        {q.status === "rascunho" && (
                          <button onClick={async () => { try { await updateStatus.mutateAsync({ id: q.id, status: "enviado" }); toast.success("Enviado"); } catch(e:any){toast.error(e?.message);} }} className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground min-h-[40px]"><Send className="h-3.5 w-3.5" /></button>
                        )}
                        <button onClick={async () => { try { await updateStatus.mutateAsync({ id: q.id, status: "aceito" }); toast.success("Aceito"); } catch(e:any){toast.error(e?.message);} }} title="Marcar aceito" className="flex items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[40px]"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={async () => { try { await updateStatus.mutateAsync({ id: q.id, status: "recusado" }); toast.success("Recusado"); } catch(e:any){toast.error(e?.message);} }} title="Recusado" className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-2 text-xs font-bold text-destructive ring-1 ring-destructive/30 min-h-[40px]"><X className="h-3.5 w-3.5" /></button>
                      </>
                    )}
                    <button onClick={async () => { if (confirm("Excluir orçamento?")) { try { await del.mutateAsync(q.id); toast.success("Excluído"); } catch(e:any){ toast.error(e?.message); } } }} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold text-destructive min-h-[40px]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <QuoteDialog open={dlg.open} onOpenChange={(v) => setDlg({ open: v, initial: null })} initial={dlg.initial} />
    </CRMLayout>
  );
}

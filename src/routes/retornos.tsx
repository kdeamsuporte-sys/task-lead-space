import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { FollowupDialog } from "@/components/crm/FollowupDialog";
import { useFollowups, useCompleteFollowup, useDeleteFollowup } from "@/hooks/use-crm";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, fmtDate } from "@/lib/format";
import { MessageCircle, RotateCcw, Check, Calendar, AlertTriangle, Clock, CalendarClock, Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/retornos")({
  head: () => ({ meta: [{ title: "Retornos — ALTUM CRM" }, { name: "description", content: "Acompanhe retornos pendentes." }] }),
  component: RetornosPage,
});

const filters = ["Todos", "Hoje", "Atrasados", "Próximos 7 dias", "Sem data", "Concluídos"];
const map: Record<string, any> = { Todos: "todos", Hoje: "hoje", Atrasados: "atrasado", "Próximos 7 dias": "futuro", "Sem data": "sem_data", Concluídos: "concluido" };

function RetornosPage() {
  const [f, setF] = useState("Hoje");
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });
  const { data: list = [], isLoading } = useFollowups(map[f]);
  const { data: hojeData = [] } = useFollowups("hoje");
  const { data: atrasadoData = [] } = useFollowups("atrasado");
  const { data: futuroData = [] } = useFollowups("futuro");
  const { data: concluidoData = [] } = useFollowups("concluido");

  const complete = useCompleteFollowup();
  const del = useDeleteFollowup();

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Não esqueça ninguém"
          title="Retornos"
          description="Pendentes, atrasados e reagendamentos. WhatsApp em 1 clique."
          actions={
            <button onClick={() => setDlg({ open: true, initial: null })} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Novo retorno
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CRMMetricCard icon={Clock} label="Hoje" value={hojeData.length} hint="Para hoje" tone="primary" />
          <CRMMetricCard icon={AlertTriangle} label="Atrasados" value={atrasadoData.length} hint="Precisam de ação" tone="danger" />
          <CRMMetricCard icon={CalendarClock} label="Próximos 7 dias" value={futuroData.length} hint="Programados" tone="info" />
          <CRMMetricCard icon={Check} label="Concluídos" value={concluidoData.length} hint="Total" tone="success" />
        </div>

        <CRMFilterChips options={filters} value={f} onChange={setF} />

        {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : list.length === 0 ? (
          <CRMEmptyState icon={Check} title="Você está em dia." description="Nenhum retorno nessa categoria." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((r: any) => {
              const c = r.contact;
              const phone = c?.phone;
              const onWa = () => {
                const link = whatsappLink(phone, c?.name ? `Olá ${c.name.split(" ")[0]}, tudo bem?` : "");
                if (!link) return toast.error("Sem telefone válido");
                window.open(link, "_blank");
              };
              const tone = !r.scheduled_at ? "info" : new Date(r.scheduled_at) < new Date() && r.status === "pendente" ? "danger" : r.status === "concluido" ? "success" : "primary";
              return (
                <article key={r.id} className="glass-card ring-premium rounded-2xl p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black text-primary ring-1 ring-primary/30">{initials(c?.name)}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold leading-tight">{c?.name ?? "Sem contato"}</div>
                        <div className="text-[11px] text-muted-foreground">{phone ?? ""}</div>
                      </div>
                    </div>
                    <CRMStatusBadge tone={tone}>{r.status === "concluido" ? "Concluído" : r.status === "cancelado" ? "Cancelado" : "Pendente"}</CRMStatusBadge>
                  </div>

                  {r.reason && (
                    <div className="mt-3 rounded-xl border border-border-soft bg-background/40 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Motivo</div>
                      <div className="mt-0.5 text-xs font-semibold">{r.reason}</div>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <CRMStatusBadge tone="info" icon={Calendar}>{fmtDate(r.scheduled_at)}</CRMStatusBadge>
                    <CRMStatusBadge tone={r.priority === "alta" || r.priority === "urgente" ? "danger" : r.priority === "media" ? "warning" : "neutral"}>
                      {r.priority}
                    </CRMStatusBadge>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={onWa} className="flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 hover:bg-success/25 min-h-[40px]">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                    {r.status !== "concluido" && (
                      <button onClick={async () => { try { await complete.mutateAsync(r.id); toast.success("Concluído"); } catch (e:any) { toast.error(e?.message); } }} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[40px]"><Check className="h-3.5 w-3.5" /> Concluir</button>
                    )}
                    <button onClick={() => setDlg({ open: true, initial: r })} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[40px]"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={async () => { if (confirm("Remover este retorno?")) { try { await del.mutateAsync(r.id); toast.success("Removido"); } catch(e:any){ toast.error(e?.message); } } }} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold text-destructive min-h-[40px]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <FollowupDialog open={dlg.open} onOpenChange={(v) => setDlg({ open: v, initial: null })} initial={dlg.initial} />
    </CRMLayout>
  );
}

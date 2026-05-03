import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { retornos, leads } from "@/components/workspace/data";
import { MessageCircle, RotateCcw, Check, Calendar, AlertTriangle, Clock, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/retornos")({
  head: () => ({
    meta: [
      { title: "Retornos — ALTUM CRM" },
      { name: "description", content: "Acompanhe retornos pendentes, atrasados e reagendamentos." },
    ],
  }),
  component: RetornosPage,
});

const filters = ["Hoje", "Atrasados", "Próximos 7 dias", "Sem data", "Concluídos"];

function RetornosPage() {
  const [f, setF] = useState("Hoje");

  const map: Record<string, string> = { Hoje: "hoje", Atrasados: "atrasado", "Próximos 7 dias": "futuro", "Sem data": "sem-data", Concluídos: "concluido" };
  const list = retornos.filter((r) => r.status === map[f]);

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Não esqueça ninguém"
          title="Retornos"
          description="Acompanhe retornos pendentes, atrasados e reagendamentos. WhatsApp em 1 clique."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CRMMetricCard icon={Clock} label="Hoje" value={retornos.filter((r) => r.status === "hoje").length} hint="Para hoje" tone="primary" />
          <CRMMetricCard icon={AlertTriangle} label="Atrasados" value={retornos.filter((r) => r.status === "atrasado").length} hint="Precisam de ação" tone="danger" />
          <CRMMetricCard icon={CalendarClock} label="Próximos 7 dias" value={retornos.filter((r) => r.status === "futuro").length} hint="Programados" tone="info" />
          <CRMMetricCard icon={Check} label="Concluídos" value={12} hint="Esta semana" tone="success" />
        </div>

        <CRMFilterChips options={filters} value={f} onChange={setF} />

        {list.length === 0 ? (
          <CRMEmptyState icon={Check} title="Você está em dia." description="Nenhum retorno nessa categoria. Aproveite para fazer follow-up ativo dos seus quentes." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((r) => {
              const lead = leads.find((l) => l.id === r.leadId)!;
              const tone = r.status === "atrasado" ? "danger" : r.status === "hoje" ? "primary" : r.status === "concluido" ? "success" : "info";
              return (
                <article key={r.id} className="glass-card ring-premium rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black text-primary ring-1 ring-primary/30">{lead.initials}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold leading-tight">{lead.name}</div>
                        <div className="text-[11px] text-muted-foreground">{lead.phone}</div>
                      </div>
                    </div>
                    <CRMStatusBadge tone={tone}>{f}</CRMStatusBadge>
                  </div>

                  <div className="mt-3 rounded-xl border border-border-soft bg-background/40 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Motivo</div>
                    <div className="mt-0.5 text-xs font-semibold">{r.reason}</div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <CRMStatusBadge tone="info" icon={Calendar}>{r.due}</CRMStatusBadge>
                    <CRMStatusBadge tone={r.priority === "alta" ? "danger" : r.priority === "media" ? "warning" : "neutral"}>
                      {r.priority === "alta" ? "Alta prioridade" : r.priority === "media" ? "Média" : "Baixa"}
                    </CRMStatusBadge>
                    <CRMStatusBadge tone="neutral">{lead.stage}</CRMStatusBadge>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 hover:bg-success/25 min-h-[44px]">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                    <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[44px]"><Check className="h-3.5 w-3.5" /> Concluir</button>
                    <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[44px]"><RotateCcw className="h-3.5 w-3.5" /> Reagendar</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}

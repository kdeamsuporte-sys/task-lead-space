import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { leads } from "@/components/workspace/data";
import { Send, Eye, Clock, Check, X, AlertTriangle, FileText, MessageCircle, Calendar, RefreshCw, Plus, Coins } from "lucide-react";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos — ALTUM CRM" },
      { name: "description", content: "Acompanhe propostas comerciais por status, valor e validade." },
    ],
  }),
  component: OrcamentosPage,
});

const filters = ["Todos", "Rascunho", "Enviado", "Visualizado", "Aguardando", "Aceito", "Recusado", "Expirado"];

const statusMap: Record<string, { tone: any; label: string }> = {
  rascunho: { tone: "neutral", label: "Rascunho" },
  enviado: { tone: "info", label: "Enviado" },
  visualizado: { tone: "primary", label: "Visualizado" },
  aguardando: { tone: "warning", label: "Aguardando resposta" },
  aceito: { tone: "success", label: "Aceito" },
  recusado: { tone: "danger", label: "Recusado" },
  expirado: { tone: "danger", label: "Expirado" },
};

function OrcamentosPage() {
  const [f, setF] = useState("Todos");
  const list = leads.filter((l) => l.budgetStatus && (f === "Todos" || statusMap[l.budgetStatus].label.startsWith(f)));

  const totalOpen = leads.filter((l) => l.budgetStatus && ["enviado", "aguardando", "visualizado"].includes(l.budgetStatus)).reduce((s, l) => s + l.estimateValue, 0);

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Onde está o dinheiro"
          title="Orçamentos"
          description="Controle de propostas: status, valor em aberto, validade e ações comerciais."
          actions={
            <button className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Novo orçamento
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <CRMMetricCard icon={Send} label="Enviados" value={4} hint="Aguardando ação do cliente" tone="info" />
          <CRMMetricCard icon={Clock} label="Aguardando" value={2} hint="Sem resposta há +24h" tone="warning" />
          <CRMMetricCard icon={Check} label="Aceitos" value={6} hint="Esta semana" tone="success" delta="+2" />
          <CRMMetricCard icon={Coins} label="Valor em aberto" value={`R$ ${totalOpen.toLocaleString("pt-BR")}`} hint="Soma dos pendentes" tone="primary" />
          <CRMMetricCard icon={AlertTriangle} label="Expirados" value={1} hint="Reativar para fechar" tone="danger" />
        </div>

        <CRMFilterChips options={filters} value={f} onChange={setF} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((l) => {
            const st = statusMap[l.budgetStatus!];
            return (
              <article key={l.id} className="glass-card ring-premium relative overflow-hidden rounded-2xl p-3 sm:p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black text-primary ring-1 ring-primary/30">{l.initials}</div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{l.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{l.service}</div>
                    </div>
                  </div>
                  <CRMStatusBadge tone={st.tone} size="xs">{st.label}</CRMStatusBadge>
                </div>

                <div className="relative mt-3 sm:mt-4 flex items-end justify-between gap-2 border-y border-border-soft py-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</div>
                    <div className="text-xl sm:text-2xl font-black text-primary tabular-nums">{l.estimate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Validade</div>
                    <div className="text-xs font-bold">7 dias</div>
                  </div>
                </div>

                <div className="relative mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Enviado · 26.03 <span>·</span> {l.origin}
                </div>

                <div className="relative mt-4 flex flex-wrap gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 min-h-[44px]"><FileText className="h-3.5 w-3.5" /> Ver</button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[44px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[44px]"><RefreshCw className="h-3.5 w-3.5" /></button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </CRMLayout>
  );
}

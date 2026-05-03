import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { lost } from "@/components/workspace/data";
import { XCircle, Coins, Repeat, AlertTriangle, MessageCircle, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/perdidos")({
  head: () => ({
    meta: [
      { title: "Perdidos — ALTUM CRM" },
      { name: "description", content: "Analise oportunidades perdidas e recupere vendas." },
    ],
  }),
  component: PerdidosPage,
});

const filters = ["Todos", "Sem resposta", "Preço alto", "Fora da região", "Fechou com outro", "Sem interesse", "Outro"];

function PerdidosPage() {
  const [f, setF] = useState("Todos");
  const list = f === "Todos" ? lost : lost.filter((p) => p.reason === f);
  const total = lost.reduce((s, l) => s + l.value, 0);

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Recuperação"
          title="Perdidos"
          description="Cada lead perdido carrega aprendizado — e oportunidade de recuperação."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CRMMetricCard icon={XCircle} label="Total perdido" value={lost.length} hint="Últimos 30 dias" tone="danger" />
          <CRMMetricCard icon={Coins} label="Valor perdido" value={`R$ ${total.toLocaleString("pt-BR")}`} hint="Em propostas perdidas" tone="warning" />
          <CRMMetricCard icon={AlertTriangle} label="Principal motivo" value="Preço alto" hint="38% das perdas" tone="info" />
          <CRMMetricCard icon={Repeat} label="Recuperáveis" value={3} hint="Vale tentar de novo" tone="primary" />
        </div>

        <CRMFilterChips options={filters} value={f} onChange={setF} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((l) => (
            <article key={l.id} className="glass-card ring-premium rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 text-xs font-black text-destructive ring-1 ring-destructive/30">{l.initials}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{l.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{l.service}</div>
                  </div>
                </div>
                <CRMStatusBadge tone="danger">{l.reason}</CRMStatusBadge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border-soft bg-background/40 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor perdido</div>
                  <div className="mt-0.5 text-lg font-black text-destructive tabular-nums">R$ {l.value}</div>
                </div>
                <div className="rounded-xl border border-border-soft bg-background/40 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</div>
                  <div className="mt-0.5 text-sm font-bold">{l.date}</div>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-muted-foreground">Última: {l.lastInteraction}</div>

              <div className="mt-4 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 min-h-[44px]"><RefreshCcw className="h-3.5 w-3.5" /> Reativar lead</button>
                <button className="flex items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[44px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}

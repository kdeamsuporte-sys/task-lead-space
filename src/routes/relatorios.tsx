import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { useReports } from "@/hooks/use-crm";
import { fmtMoney } from "@/lib/format";
import { TrendingUp, Send, Award, Coins, XCircle, Flame } from "lucide-react";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — ALTUM CRM" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { data, isLoading } = useReports();
  if (isLoading || !data) return <CRMLayout><div className="p-4 text-sm text-muted-foreground">Carregando…</div></CRMLayout>;
  const t = data.totals;

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Performance" title="Relatórios" description="Como sua operação está performando." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CRMMetricCard icon={TrendingUp} label="Leads" value={t.leads} hint="Total" tone="primary" />
          <CRMMetricCard icon={Send} label="Orçamentos" value={t.orcEnviados} hint="Enviados" tone="info" />
          <CRMMetricCard icon={Award} label="Aceitos" value={t.aceitos} hint={`${t.closeRate}% close`} tone="success" />
          <CRMMetricCard icon={Coins} label="Vendido" value={fmtMoney(t.valorVendido)} hint="Valor" tone="primary" />
          <CRMMetricCard icon={XCircle} label="Perdido" value={fmtMoney(t.valorPerdido)} hint="Valor" tone="danger" />
          <CRMMetricCard icon={Flame} label="Quentes" value={t.quentes} hint="Ativos" tone="warning" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Funil</div>
              <h3 className="mt-1 text-base font-bold">Conversão por etapa</h3>
            </div>
            <div className="space-y-2">
              {data.funnel.map((f: any, i: number) => (
                <div key={f.stage} className="relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-primary/20 px-3 py-2.5"
                  style={{ width: `${100 - i * 4}%`, background: `linear-gradient(90deg, oklch(0.72 0.205 38 / ${0.18 - i * 0.025}), oklch(0.72 0.205 38 / 0.05))` }}>
                  <span className="truncate text-xs font-bold">{f.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums">{f.value}</span>
                    <span className="rounded-full bg-background/50 px-2 py-0.5 text-[10px] font-bold text-primary">{f.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Origens</div>
              <h3 className="mt-1 text-base font-bold">Canais</h3>
            </div>
            <div className="space-y-3">
              {data.origins.length === 0 && <div className="text-xs text-muted-foreground">Sem dados</div>}
              {data.origins.map((o: any) => (
                <div key={o.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{o.label}</span>
                    <span className="text-muted-foreground"><span className="font-bold text-foreground">{o.value}</span> · {o.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Motivos de perda</div>
              <h3 className="mt-1 text-base font-bold">O que está fazendo perder vendas</h3>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {data.lostReasons.length === 0 && <div className="text-xs text-muted-foreground">Sem dados</div>}
              {data.lostReasons.map((r: any) => (
                <div key={r.label} className="rounded-xl border border-border-soft bg-background/40 p-3">
                  <div className="flex justify-between text-xs"><span className="font-bold truncate">{r.label}</span><span className="text-destructive font-bold">{r.pct}%</span></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CRMLayout>
  );
}

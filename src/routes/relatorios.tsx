import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { reports } from "@/components/workspace/data";
import { TrendingUp, MessageCircle, Send, Award, Coins, XCircle, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — ALTUM CRM" },
      { name: "description", content: "Performance comercial: leads, conversão, valor vendido e funil." },
    ],
  }),
  component: RelatoriosPage,
});

const iconMap: any = { leads_recv: TrendingUp, resp_rate: MessageCircle, budgets_sent: Send, close_rate: Award, sold: Coins, lost_value: XCircle, avg_resp: Clock, top_channel: Sparkles };

function RelatoriosPage() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Performance comercial"
          title="Relatórios"
          description="Como sua operação comercial está performando, com clareza."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {reports.metrics.map((m) => (
            <CRMMetricCard key={m.id} icon={iconMap[m.id]} label={m.label} value={m.value} delta={m.delta} hint="Últimos 30 dias" tone={m.tone as any} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Funnel */}
          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Funil comercial</div>
              <h3 className="mt-1 text-base sm:text-lg font-bold">Conversão por etapa</h3>
            </div>
            <div className="space-y-2">
              {reports.funnel.map((f, i) => (
                <div key={f.stage} className="relative">
                  <div
                    className="relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-primary/20 px-3 sm:px-4 py-2.5 sm:py-3"
                    style={{
                      width: `${100 - i * 4}%`,
                      background: `linear-gradient(90deg, oklch(0.72 0.205 38 / ${0.18 - i * 0.025}), oklch(0.72 0.205 38 / ${0.05}))`,
                    }}
                  >
                    <span className="truncate text-xs sm:text-sm font-bold">{f.stage}</span>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                      <span className="text-xs font-bold tabular-nums text-foreground/80">{f.value}</span>
                      <span className="rounded-full bg-background/50 px-2 py-0.5 text-[10px] font-bold text-primary">{f.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Origins */}
          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Origem dos leads</div>
              <h3 className="mt-1 text-base sm:text-lg font-bold">Canal que mais converte</h3>
            </div>
            <div className="space-y-3">
              {reports.origins.map((o) => (
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

          {/* Lost reasons */}
          <section className="glass-card rounded-3xl p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Motivos de perda</div>
                <h3 className="mt-1 text-base sm:text-lg font-bold">Por que estamos perdendo?</h3>
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground">% das oportunidades perdidas</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {reports.lostReasons.map((r) => (
                <div key={r.label} className="rounded-2xl border border-border-soft bg-background/40 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.label}</div>
                  <div className={cn("mt-1 text-xl sm:text-2xl font-black tabular-nums", r.pct >= 30 ? "text-destructive" : r.pct >= 15 ? "text-warning" : "text-foreground")}>{r.pct}%</div>
                  <div className="mt-2 h-1 rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full", r.pct >= 30 ? "bg-destructive" : r.pct >= 15 ? "bg-warning" : "bg-foreground/40")} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CRMLayout>
  );
}

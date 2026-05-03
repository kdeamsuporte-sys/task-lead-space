import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, MessageCircle, RotateCcw, Filter, TrendingUp, Calendar } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, AreaChart, Area } from "recharts";

export const Route = createFileRoute("/metricas")({
  head: () => ({ meta: [{ title: "Métricas — ALTUM Portal" }, { name: "description", content: "Dashboards de conversas, retornos e funil." }] }),
  component: Page,
});

type Range = "7d" | "30d" | "90d";
const RANGES: { value: Range; label: string; days: number }[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "90d", label: "90 dias", days: 90 },
];

function useMetrics(days: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["metrics", user?.id, days],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - days); since.setHours(0, 0, 0, 0);
      const sinceIso = since.toISOString();
      const [tl, fu, ct] = await Promise.all([
        supabase.from("crm_contact_timeline").select("event_type, created_at").gte("created_at", sinceIso),
        supabase.from("crm_followups").select("status, scheduled_at, completed_at, created_at").gte("created_at", sinceIso),
        supabase.from("crm_contacts").select("stage, created_at").gte("created_at", sinceIso),
      ]);
      const timeline = tl.data ?? [];
      const followups = fu.data ?? [];
      const contacts = ct.data ?? [];

      const buckets: { date: string; conversas: number; retornos: number; concluidos: number; leads: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        buckets.push({ date: key, conversas: 0, retornos: 0, concluidos: 0, leads: 0 });
      }
      const idx = new Map(buckets.map((b, i) => [b.date, i]));
      timeline.forEach((t: any) => {
        const k = t.created_at.slice(0, 10);
        if (idx.has(k)) buckets[idx.get(k)!].conversas++;
      });
      followups.forEach((f: any) => {
        const k = (f.created_at as string).slice(0, 10);
        if (idx.has(k)) buckets[idx.get(k)!].retornos++;
        if (f.status === "concluido" && f.completed_at) {
          const k2 = (f.completed_at as string).slice(0, 10);
          if (idx.has(k2)) buckets[idx.get(k2)!].concluidos++;
        }
      });
      contacts.forEach((c: any) => {
        const k = c.created_at.slice(0, 10);
        if (idx.has(k)) buckets[idx.get(k)!].leads++;
      });
      const series = buckets.map((b) => ({ ...b, label: b.date.slice(5) }));

      const stages = ["novo_lead", "aguardando_info", "orcamento_enviado", "followup", "agendado", "servico_realizado", "pos_venda", "perdido"];
      const stageLabel: Record<string, string> = { novo_lead: "Novo lead", aguardando_info: "Aguardando", orcamento_enviado: "Orçamento", followup: "Follow-up", agendado: "Agendado", servico_realizado: "Realizado", pos_venda: "Pós-venda", perdido: "Perdido" };
      const funnelMap = new Map(stages.map((s) => [s, 0]));
      contacts.forEach((c: any) => funnelMap.set(c.stage, (funnelMap.get(c.stage) ?? 0) + 1));
      const funnel = stages.map((s) => ({ stage: stageLabel[s], total: funnelMap.get(s) ?? 0 }));

      return {
        series,
        funnel,
        totals: {
          conversas: timeline.length,
          retornos: followups.length,
          concluidos: followups.filter((f: any) => f.status === "concluido").length,
          leads: contacts.length,
        },
      };
    },
  });
}

function Page() {
  const [range, setRange] = useState<Range>("30d");
  const days = RANGES.find((r) => r.value === range)!.days;
  const { data, isLoading } = useMetrics(days);

  const completionRate = useMemo(() => {
    if (!data?.totals.retornos) return 0;
    return Math.round((data.totals.concluidos / data.totals.retornos) * 100);
  }, [data]);

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Inteligência"
          title="Métricas"
          description="Dashboards consolidados de conversas, retornos e funil comercial."
          actions={
            <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1">
              <Filter className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
              {RANGES.map((r) => (
                <button key={r.value} onClick={() => setRange(r.value)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${range === r.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          }
        />

        {isLoading || !data ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <CRMMetricCard icon={MessageCircle} label="Eventos de conversa" value={data.totals.conversas} hint="Timeline" tone="primary" />
              <CRMMetricCard icon={RotateCcw} label="Retornos criados" value={data.totals.retornos} hint="Follow-ups" tone="info" />
              <CRMMetricCard icon={TrendingUp} label="Retornos concluídos" value={`${completionRate}%`} hint={`${data.totals.concluidos} de ${data.totals.retornos}`} tone="success" />
              <CRMMetricCard icon={Calendar} label="Novos leads" value={data.totals.leads} hint="No período" tone="warning" />
            </div>

            <section className="glass-card rounded-3xl p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Conversas</div>
                  <h3 className="mt-1 text-base font-bold">Atividade na timeline</h3>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series}>
                    <defs>
                      <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.72 0.205 38)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.72 0.205 38)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="conversas" stroke="oklch(0.72 0.205 38)" fill="url(#gConv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-card rounded-3xl p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Retornos</div>
                <h3 className="mt-1 text-base font-bold">Criados vs. concluídos</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="retornos" stroke="oklch(0.72 0.205 38)" strokeWidth={2} dot={false} name="Criados" />
                    <Line type="monotone" dataKey="concluidos" stroke="oklch(0.72 0.18 145)" strokeWidth={2} dot={false} name="Concluídos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-card rounded-3xl p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Funil</div>
                <h3 className="mt-1 text-base font-bold">Distribuição por etapa</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.funnel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="total" fill="oklch(0.72 0.205 38)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </div>
    </CRMLayout>
  );
}

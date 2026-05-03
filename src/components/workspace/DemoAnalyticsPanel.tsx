import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Bot, UserCog, Clock, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

function useDemoSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["demo-summary", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const start = startOfDay().toISOString();
      const [tlR, hoR, fuR, qR] = await Promise.all([
        supabase.from("crm_contact_timeline").select("event_type,metadata,created_at").gte("created_at", start),
        supabase.from("crm_handoffs").select("id,status,reason,created_at,resolved_at").order("created_at", { ascending: false }),
        supabase.from("crm_followups").select("id,status,scheduled_at,reason,priority").order("scheduled_at", { ascending: true }),
        supabase.from("crm_quotes").select("id,status,amount,service,sent_at,created_at").order("created_at", { ascending: false }),
      ]);
      const tl = tlR.data ?? [];
      const ho = hoR.data ?? [];
      const fu = fuR.data ?? [];
      const q = qR.data ?? [];

      const recebidas = tl.filter((e: any) => e.event_type === "mensagem_recebida").length;
      const enviadasIA = tl.filter((e: any) => e.event_type === "mensagem_enviada" && e.metadata?.author === "ia").length;
      const enviadasHumano = tl.filter((e: any) => e.event_type === "mensagem_enviada" && e.metadata?.author !== "ia").length;
      const handoffsHoje = tl.filter((e: any) => e.event_type === "handoff_ia_humano").length;
      const handoffsPendentes = ho.filter((h: any) => h.status === "pendente").length;
      const handoffsResolvidos = ho.filter((h: any) => h.status === "resolvido").length;

      const now = new Date();
      const fuHoje = fu.filter((f: any) => f.status === "pendente" && f.scheduled_at && startOfDay(new Date(f.scheduled_at)).getTime() === startOfDay(now).getTime()).length;
      const fuAtrasados = fu.filter((f: any) => f.status === "pendente" && f.scheduled_at && new Date(f.scheduled_at) < startOfDay(now)).length;
      const fuFuturos = fu.filter((f: any) => f.status === "pendente" && f.scheduled_at && new Date(f.scheduled_at) > now).length;

      const espera = q.filter((x: any) => ["enviado","aguardando","visualizado"].includes(x.status));
      const valorEspera = espera.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
      const aceitos = q.filter((x: any) => x.status === "aceito").length;
      const closeRate = q.length ? Math.round((aceitos / q.length) * 100) : 0;

      return { recebidas, enviadasIA, enviadasHumano, handoffsHoje, handoffsPendentes, handoffsResolvidos, fuHoje, fuAtrasados, fuFuturos, esperaCount: espera.length, valorEspera, closeRate };
    },
  });
}

function Bar({ value, total, tone }: { value: number; total: number; tone: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return <div className="h-1.5 w-full rounded-full bg-background/60 overflow-hidden"><div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} /></div>;
}

export function DemoAnalyticsPanel() {
  const { data, isLoading } = useDemoSummary();
  const navigate = useNavigate();
  if (isLoading || !data) return <div className="glass-card rounded-2xl p-4 text-xs text-muted-foreground">Carregando resumo…</div>;

  const totalMsg = data.recebidas + data.enviadasIA + data.enviadasHumano;

  return (
    <div className="glass-card ring-premium rounded-3xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/30">Resumo do dia</span>
          <span className="text-[10px] text-muted-foreground">dados de demonstração</span>
        </div>
        <button onClick={() => navigate({ to: "/relatorios" })} className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground">
          <TrendingUp className="h-3 w-3" /> Relatório completo
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {/* Atividade */}
        <div className="rounded-2xl bg-background/40 p-3 ring-1 ring-border-soft">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Atividade do dia</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums">{totalMsg}</span>
            <span className="text-[11px] text-muted-foreground">mensagens</span>
          </div>
          <ul className="mt-3 space-y-2 text-[11px]">
            <li className="flex items-center gap-2"><ArrowDownLeft className="h-3 w-3 text-primary" /><span className="flex-1">Recebidas</span><span className="font-bold tabular-nums">{data.recebidas}</span></li>
            <li className="flex items-center gap-2"><Bot className="h-3 w-3 text-success" /><span className="flex-1">Enviadas pela IA</span><span className="font-bold tabular-nums">{data.enviadasIA}</span></li>
            <li className="flex items-center gap-2"><ArrowUpRight className="h-3 w-3 text-warning" /><span className="flex-1">Enviadas pelo time</span><span className="font-bold tabular-nums">{data.enviadasHumano}</span></li>
            <li className="flex items-center gap-2 pt-1.5 border-t border-border-soft"><UserCog className="h-3 w-3 text-primary" /><span className="flex-1">Handoffs IA→humano</span><span className="font-bold tabular-nums">{data.handoffsPendentes} <span className="text-[9px] font-normal text-muted-foreground">pend.</span> · {data.handoffsResolvidos} <span className="text-[9px] font-normal text-muted-foreground">resol.</span></span></li>
          </ul>
        </div>

        {/* Follow-ups */}
        <button onClick={() => navigate({ to: "/retornos" })} className="rounded-2xl bg-background/40 p-3 text-left ring-1 ring-border-soft transition hover:ring-primary/40">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Follow-ups pendentes</div>
            {data.fuAtrasados > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums">{data.fuHoje + data.fuAtrasados + data.fuFuturos}</span>
            <span className="text-[11px] text-muted-foreground">na fila</span>
          </div>
          <div className="mt-3 space-y-2 text-[11px]">
            <div>
              <div className="flex items-center justify-between"><span className="text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Atrasados</span><span className="font-bold tabular-nums">{data.fuAtrasados}</span></div>
              <div className="mt-1"><Bar value={data.fuAtrasados} total={Math.max(1, data.fuHoje+data.fuAtrasados+data.fuFuturos)} tone="bg-destructive" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between"><span className="text-warning flex items-center gap-1"><Clock className="h-3 w-3" /> Hoje</span><span className="font-bold tabular-nums">{data.fuHoje}</span></div>
              <div className="mt-1"><Bar value={data.fuHoje} total={Math.max(1, data.fuHoje+data.fuAtrasados+data.fuFuturos)} tone="bg-warning" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Futuros</span><span className="font-bold tabular-nums">{data.fuFuturos}</span></div>
              <div className="mt-1"><Bar value={data.fuFuturos} total={Math.max(1, data.fuHoje+data.fuAtrasados+data.fuFuturos)} tone="bg-muted-foreground/40" /></div>
            </div>
          </div>
        </button>

        {/* Orçamentos */}
        <button onClick={() => navigate({ to: "/orcamentos" })} className="rounded-2xl bg-background/40 p-3 text-left ring-1 ring-border-soft transition hover:ring-primary/40">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Orçamentos em espera</div>
            <FileText className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums">{data.esperaCount}</span>
            <span className="text-[11px] text-muted-foreground">aguardando resposta</span>
          </div>
          <div className="mt-3 rounded-xl bg-background/60 p-2.5 ring-1 ring-border-soft">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor em jogo</div>
            <div className="mt-0.5 text-base font-black text-primary tabular-nums">{fmtMoney(data.valorEspera)}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Taxa de fechamento</span>
            <span className={cn("font-bold tabular-nums", data.closeRate >= 50 ? "text-success" : data.closeRate >= 25 ? "text-warning" : "text-destructive")}>{data.closeRate}%</span>
          </div>
        </button>
      </div>
    </div>
  );
}
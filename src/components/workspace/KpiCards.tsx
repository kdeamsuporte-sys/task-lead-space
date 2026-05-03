import { TrendingUp, AlertTriangle, Clock, Flame, Coins, ArrowUpRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useDashboard } from "@/hooks/use-crm";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const toneMap = {
  primary: { ring: "ring-primary/30", bg: "bg-primary/12", text: "text-primary", glow: "from-primary/20" },
  warning: { ring: "ring-warning/30", bg: "bg-warning/12", text: "text-warning", glow: "from-warning/20" },
  danger: { ring: "ring-destructive/30", bg: "bg-destructive/12", text: "text-destructive", glow: "from-destructive/20" },
  success: { ring: "ring-success/30", bg: "bg-success/12", text: "text-success", glow: "from-success/20" },
  info: { ring: "ring-border", bg: "bg-secondary", text: "text-foreground", glow: "from-foreground/10" },
} as const;

export function KpiCards() {
  const { data } = useDashboard();
  const navigate = useNavigate();
  const items = [
    { id: "leads", icon: TrendingUp, label: "Leads novos", value: data?.novosLeads ?? 0, hint: "Aguardando primeiro atendimento", tone: "primary" as const, to: "/inbox" },
    { id: "orc", icon: Clock, label: "Orçamentos parados", value: data?.orcParados ?? 0, hint: "Sem resposta do cliente", tone: "warning" as const, to: "/orcamentos" },
    { id: "ret", icon: AlertTriangle, label: "Retornos atrasados", value: data?.retornosAtrasados ?? 0, hint: "Precisam de ação hoje", tone: "danger" as const, to: "/retornos" },
    { id: "hot", icon: Flame, label: "Clientes quentes", value: data?.quentes ?? 0, hint: "Alta chance de fechar", tone: "success" as const, to: "/pipeline" },
    { id: "pot", icon: Coins, label: "Potencial aberto", value: fmtMoney(data?.pot ?? 0), hint: "Valor estimado no pipeline", tone: "info" as const, to: "/relatorios" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {items.map((k) => {
        const Icon = k.icon;
        const tone = toneMap[k.tone];
        return (
          <button
            key={k.id}
            onClick={() => navigate({ to: k.to })}
            className="glass-card shine ring-premium group relative overflow-hidden rounded-2xl p-3 sm:p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className={cn("pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-50 blur-2xl transition group-hover:opacity-90", tone.glow)} />
            <div className="relative flex items-start justify-between">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", tone.bg, tone.ring, tone.text)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <ArrowUpRight className="h-2.5 w-2.5" /> ver
              </span>
            </div>
            <div className="relative mt-4 sm:mt-5">
              <div className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums">{k.value}</div>
              <div className="mt-0.5 text-[12px] sm:text-[13px] font-semibold text-foreground/90">{k.label}</div>
            </div>
            <div className="relative mt-2 text-[10px] sm:text-[11px] leading-snug text-muted-foreground line-clamp-2">{k.hint}</div>
          </button>
        );
      })}
    </div>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid, MessageCircle, Users, RotateCcw, Calendar, KanbanSquare, DollarSign,
  Megaphone, Sparkles, Bot, BookOpen, ArrowLeftRight, Zap, Instagram, BarChart3,
  Rocket, ScrollText, Settings, ChevronLeft, ChevronRight, Shield, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortal } from "@/lib/portal-context";
import { useAuth } from "@/lib/auth-context";

type Item = { to: string; icon: any; label: string; badge?: string; exact?: boolean };
type Group = { label: string; items: Item[] };

export const portalGroups: Group[] = [
  { label: "Operação", items: [
    { to: "/", icon: LayoutGrid, label: "Visão geral", exact: true },
  ]},
  { label: "Atendimento e vendas", items: [
    { to: "/conversas", icon: MessageCircle, label: "Conversas" },
    { to: "/inbox", icon: Inbox, label: "Inbox" },
    { to: "/contatos", icon: Users, label: "CRM" },
    { to: "/retornos", icon: RotateCcw, label: "Retornos" },
    { to: "/agenda", icon: Calendar, label: "Agenda" },
    { to: "/pipeline", icon: KanbanSquare, label: "Funil" },
    { to: "/comercial", icon: DollarSign, label: "Comercial" },
  ]},
  { label: "Crescimento", items: [
    { to: "/captacao", icon: Megaphone, label: "Captação" },
    { to: "/campanhas", icon: Sparkles, label: "Campanhas", badge: "novo" },
  ]},
  { label: "Inteligência", items: [
    { to: "/ia", icon: Bot, label: "IA" },
    { to: "/conhecimento", icon: BookOpen, label: "Conhecimento" },
    { to: "/transferencias", icon: ArrowLeftRight, label: "Transferências" },
    { to: "/automacoes", icon: Zap, label: "Automações" },
    { to: "/operacao-instagram", icon: Instagram, label: "Op. Instagram" },
    { to: "/metricas", icon: BarChart3, label: "Métricas" },
    { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
  ]},
  { label: "Governança", items: [
    { to: "/lancamento", icon: Rocket, label: "Lançamento" },
    { to: "/logs", icon: ScrollText, label: "Logs" },
    { to: "/configuracoes", icon: Settings, label: "Configurações" },
  ]},
];

function isActive(path: string, to: string, exact?: boolean) {
  if (exact) return path === to;
  return path === to || path.startsWith(to + "/");
}

export function PortalSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { sidebarCollapsed, setSidebarCollapsed } = usePortal();
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = sidebarCollapsed;
  const w = collapsed ? "w-[76px]" : "w-[260px]";
  const displayName = (user?.user_metadata as any)?.display_name || user?.email?.split("@")[0] || "Você";

  return (
    <aside className={cn("group/side flex shrink-0 flex-col border-r border-sidebar-border glass-strong transition-[width] duration-200 h-screen sticky top-0 z-30", w)}>
      {/* Brand */}
      <div className={cn("flex items-center gap-2 px-3 py-3 border-b border-sidebar-border", collapsed && "justify-center")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground font-black shrink-0 glow-soft" style={{ background: "var(--gradient-primary)" }}>A</div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-black tracking-[0.18em] uppercase">ALTUM</div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground truncate">Portal do cliente</div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-foreground/70 hover:text-foreground"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Account card */}
      {!collapsed && (
        <div className="mx-3 mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <span>Conta</span>
            <span className="flex items-center gap-1 text-success"><Shield className="h-3 w-3" /> ok</span>
          </div>
          <div className="mt-1 truncate text-sm font-bold">{displayName}</div>
          <div className="text-[10px] text-muted-foreground">Operação centralizada</div>
          <div className="mt-2 flex items-center justify-between rounded-lg border border-sidebar-border bg-background/40 px-2 py-1.5">
            <div className="min-w-0">
              <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Prontidão</div>
              <div className="truncate text-[11px] font-semibold">Estrutura em implantação</div>
            </div>
            <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">2 pend.</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scroll-x-soft">
        {portalGroups.map((g) => (
          <div key={g.label} className="mb-3">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{g.label}</div>
            )}
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = isActive(path, it.to, it.exact);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={onNavigate}
                    title={collapsed ? it.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition",
                      active ? "bg-primary/12 text-primary ring-1 ring-primary/30 glow-soft" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary glow-primary" />}
                    <it.icon className="h-[16px] w-[16px] shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                    {!collapsed && it.badge && (
                      <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold text-success">{it.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3">
            <div className="text-[10px] font-bold">Conta organizada</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">agency owner</div>
            <div className="mt-1.5 text-[10px] leading-snug text-muted-foreground">Conta isolada, canais dedicados e operação centralizada.</div>
          </div>
        </div>
      )}
    </aside>
  );
}
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid, Inbox, KanbanSquare, Users, RotateCcw, FileText, Calendar, XCircle,
  Zap, BarChart3, Settings, Sparkles, HelpCircle, Menu, X, Plus, MessageCircle, Bell, Search, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CRMMobileBottomNav } from "./CRMMobileBottomNav";

export const navItems = [
  { to: "/", icon: LayoutGrid, label: "Workspace", exact: true },
  { to: "/inbox", icon: Inbox, label: "Inbox", badge: 7 },
  { to: "/pipeline", icon: KanbanSquare, label: "Pipeline" },
  { to: "/contatos", icon: Users, label: "Contatos" },
  { to: "/retornos", icon: RotateCcw, label: "Retornos", badge: 3 },
  { to: "/orcamentos", icon: FileText, label: "Orçamentos" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/perdidos", icon: XCircle, label: "Perdidos" },
  { to: "/automacoes", icon: Zap, label: "Automações" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
] as const;

function useActivePath() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return path;
}

function isActive(path: string, to: string, exact?: boolean) {
  if (exact) return path === to;
  return path === to || path.startsWith(to + "/");
}

function DesktopSidebar() {
  const path = useActivePath();
  return (
    <aside className="hidden lg:flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar/80 py-5 backdrop-blur-xl sticky top-0 h-screen z-30">
      <Link to="/" className="relative mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground font-black shadow-[0_10px_30px_-10px_oklch(0.72_0.205_38_/_0.7)]" style={{ background: "var(--gradient-primary)" }}>
        A
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
      </Link>
      <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">altum</span>

      <nav className="flex flex-col gap-1.5 mt-1 overflow-y-auto scroll-x-soft">
        {navItems.map((it) => {
          const active = isActive(path, it.to, it.exact);
          return (
            <Link
              key={it.to}
              to={it.to}
              title={it.label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition",
                active
                  ? "bg-primary/12 text-primary ring-1 ring-primary/30"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              {active && <span className="absolute -left-[14px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_oklch(0.72_0.205_38_/_0.6)]" />}
              <it.icon className="h-[18px] w-[18px]" />
              {it.badge && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-sidebar bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {it.badge}
                </span>
              )}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium opacity-0 shadow-lg transition group-hover:opacity-100 z-50">
                {it.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5">
        <button className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground">
          <Sparkles className="h-[18px] w-[18px]" />
        </button>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground">
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useActivePath();
  return (
    <>
      <div
        className={cn("lg:hidden fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] border-r border-sidebar-border bg-sidebar p-4 transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>A</div>
            <div>
              <div className="text-sm font-black tracking-tight">ALTUM CRM</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Comercial</div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-6 space-y-1">
          {navItems.map((it) => {
            const active = isActive(path, it.to, it.exact);
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                    : "text-foreground/80 hover:bg-card",
                )}
              >
                <it.icon className="h-4 w-4" />
                <span className="flex-1">{it.label}</span>
                {it.badge && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{it.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function CRMTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex flex-wrap items-center gap-2.5">
      <button onClick={onOpenMenu} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70">
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 rounded-full border border-success/25 bg-success/8 px-3 py-1.5 text-[11px] font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
        <span className="hidden sm:inline">Online · sincronizado</span>
        <span className="sm:hidden">Online</span>
      </div>
      <div className="ml-1 hidden items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 backdrop-blur-md md:flex">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          placeholder="Buscar contato, telefone, orçamento…"
          className="w-72 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/12 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/20 md:inline-flex">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.205_38_/_0.7)] transition hover:brightness-110"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Novo contato</span><span className="sm:hidden">Novo</span>
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
        </button>
        <button className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>JV</div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}

export function CRMLayout({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      <DesktopSidebar />
      <MobileDrawer open={menu} onClose={() => setMenu(false)} />
      <main className="relative z-10 min-w-0 flex-1 px-4 py-4 md:px-6 lg:px-8 pb-24 lg:pb-8">
        <CRMTopBar onOpenMenu={() => setMenu(true)} />
        <div className="mt-6">{children}</div>
      </main>
      <CRMMobileBottomNav />
    </div>
  );
}

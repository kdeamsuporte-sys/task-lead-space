import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Sun, Moon, Layers, Sparkles, LifeBuoy, LogOut, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortal } from "@/lib/portal-context";
import { useAuth } from "@/lib/auth-context";
import { portalGroups } from "./PortalSidebar";

function findCurrent(path: string) {
  for (const g of portalGroups) {
    for (const it of g.items) {
      const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
      if (active) return { group: g.label, item: it.label };
    }
  }
  return { group: "Operação", item: "Visão geral" };
}

export function PortalTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate();
  const { uiMode, setUiMode, theme, setTheme } = usePortal();
  const { user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const cur = findCurrent(path);
  const [search, setSearch] = useState("");
  const displayName = (user?.user_metadata as any)?.display_name || user?.email?.split("@")[0] || "savio";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate({ to: "/contatos", search: undefined as any });
  };

  const Pill = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
        active ? "border border-primary/35 bg-primary/12 text-primary" : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-border-soft pb-3">
      <button onClick={onOpenMenu} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70">
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="font-bold tracking-[0.18em] uppercase text-foreground">ALTUM</span>
        <span className="rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Portal do cliente</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">{cur.item}</span>
        <span className="text-muted-foreground/60">· operação em tempo real</span>
      </div>

      <form onSubmit={onSearch} className="ml-auto hidden md:flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 min-w-[260px]">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar módulo, contato, proposta ou conversa"
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-background/60 px-1 text-[9px] font-mono text-muted-foreground">⌘ /</kbd>
      </form>

      <div className="flex items-center gap-1.5">
        <Pill active={uiMode === "essencial"} onClick={() => setUiMode("essencial")} icon={Sparkles} label="Essencial" />
        <Pill active={uiMode === "conforto"} onClick={() => setUiMode("conforto")} icon={Layers} label="Conforto" />
        <Pill active={theme === "light"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} icon={theme === "light" ? Moon : Sun} label="Modo claro" />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => navigate({ to: "/configuracoes" })}
          className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card/70 px-2 py-1"
          title="Conta"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Usuário</div>
            <div className="text-[11px] font-bold">{displayName}</div>
          </div>
        </button>
        <a href="https://docs.lovable.dev" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
          <LifeBuoy className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Suporte</span>
        </a>
        <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/20">
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      </div>
    </header>
  );
}
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

  const Pill = ({ active, onClick, icon: Icon, label, hideLabelMobile }: { active: boolean; onClick: () => void; icon: any; label: string; hideLabelMobile?: boolean }) => (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] font-semibold transition glass",
        active ? "border-primary/40 text-primary glow-soft" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className={cn(hideLabelMobile && "hidden sm:inline")}>{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-20 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 mb-1 flex flex-wrap items-center gap-2 border-b border-border-soft px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 glass">
      <button onClick={onOpenMenu} aria-label="Abrir menu" className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full glass">
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
        <span className="font-bold tracking-[0.18em] uppercase text-foreground">ALTUM</span>
        <span className="rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Portal do cliente</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground truncate">{cur.item}</span>
        <span className="text-muted-foreground/60 hidden xl:inline">· operação em tempo real</span>
      </div>
      {/* Mobile current section */}
      <div className="md:hidden flex items-center gap-1.5 text-[11px] min-w-0 flex-1">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary shrink-0">ALTUM</span>
        <span className="font-semibold text-foreground truncate">{cur.item}</span>
      </div>

      <form onSubmit={onSearch} className="ml-auto hidden md:flex items-center gap-1.5 rounded-full glass px-3 py-1.5 min-w-[240px]">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar módulo, contato, proposta ou conversa"
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-background/60 px-1 text-[9px] font-mono text-muted-foreground">⌘ /</kbd>
      </form>

      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto md:ml-0">
        <Pill hideLabelMobile active={uiMode === "essencial"} onClick={() => setUiMode("essencial")} icon={Sparkles} label="Essencial" />
        <Pill hideLabelMobile active={uiMode === "conforto"} onClick={() => setUiMode("conforto")} icon={Layers} label="Conforto" />
        <Pill hideLabelMobile active={theme === "light"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} icon={theme === "light" ? Moon : Sun} label={theme === "light" ? "Escuro" : "Claro"} />
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => navigate({ to: "/configuracoes" })}
          className="hidden md:flex items-center gap-2 rounded-full glass px-2 py-1"
          title="Conta"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-primary-foreground glow-soft" style={{ background: "var(--gradient-primary)" }}>
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Usuário</div>
            <div className="text-[11px] font-bold">{displayName}</div>
          </div>
        </button>
        <a href="https://docs.lovable.dev" target="_blank" rel="noreferrer" title="Suporte" className="inline-flex items-center gap-1.5 rounded-full glass px-2.5 sm:px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
          <LifeBuoy className="h-3.5 w-3.5" /> <span className="hidden lg:inline">Suporte</span>
        </a>
        <button onClick={() => signOut()} title="Sair" className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 sm:px-3 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/20 backdrop-blur-md">
          <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
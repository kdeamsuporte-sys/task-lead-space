import { LayoutGrid, Users, KanbanSquare, ListChecks, RotateCcw, XCircle, Calendar, Settings, BarChart3, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutGrid, label: "Workspace", active: true, badge: 12 },
  { icon: KanbanSquare, label: "Pipeline" },
  { icon: ListChecks, label: "Lista" },
  { icon: Users, label: "Contatos" },
  { icon: RotateCcw, label: "Retornos", badge: 3 },
  { icon: Calendar, label: "Agenda" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: XCircle, label: "Perdidos" },
];

export function WorkspaceSidebar() {
  return (
    <aside className="hidden lg:flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar/80 py-5 backdrop-blur-xl">
      <div className="relative mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground font-black shadow-[0_10px_30px_-10px_oklch(0.72_0.205_38_/_0.7)]" style={{ background: "var(--gradient-primary)" }}>
        A
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
      </div>
      <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">altum</span>

      <nav className="flex flex-col gap-1.5 mt-1">
        {items.map((it) => (
          <button
            key={it.label}
            title={it.label}
            className={cn(
              "group relative flex h-11 w-11 items-center justify-center rounded-xl transition",
              it.active
                ? "bg-primary/12 text-primary ring-1 ring-primary/30"
                : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {it.active && <span className="absolute -left-[14px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_oklch(0.72_0.205_38_/_0.6)]" />}
            <it.icon className="h-[18px] w-[18px]" />
            {it.badge && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-sidebar bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {it.badge}
              </span>
            )}
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium opacity-0 shadow-lg transition group-hover:opacity-100 z-50">
              {it.label}
            </span>
          </button>
        ))}
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

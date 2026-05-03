import { LayoutGrid, Users, KanbanSquare, ListChecks, RotateCcw, XCircle, Calendar, Settings, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutGrid, label: "Workspace", active: true },
  { icon: KanbanSquare, label: "Pipeline" },
  { icon: ListChecks, label: "Lista" },
  { icon: Users, label: "Contatos" },
  { icon: RotateCcw, label: "Retornos" },
  { icon: Calendar, label: "Agenda" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: XCircle, label: "Perdidos" },
];

export function WorkspaceSidebar() {
  return (
    <aside className="hidden lg:flex w-[68px] shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400 text-primary-foreground font-black shadow-[0_8px_24px_-8px_oklch(0.7_0.2_38_/_0.6)]">
        A
      </div>
      <nav className="flex flex-col gap-1 mt-2">
        {items.map((it) => (
          <button
            key={it.label}
            title={it.label}
            className={cn(
              "group relative flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/70 transition",
              it.active
                ? "bg-sidebar-accent text-primary"
                : "hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {it.active && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />}
            <it.icon className="h-[18px] w-[18px]" />
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <button className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-foreground">
          <Sparkles className="h-[18px] w-[18px]" />
        </button>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-foreground">
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  );
}

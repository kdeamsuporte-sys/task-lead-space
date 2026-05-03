import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Inbox, KanbanSquare, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; icon: any; label: string; exact?: boolean };
const items: Item[] = [
  { to: "/", icon: LayoutGrid, label: "Workspace", exact: true },
  { to: "/inbox", icon: Inbox, label: "Inbox" },
  { to: "/pipeline", icon: KanbanSquare, label: "Pipeline" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/contatos", icon: Users, label: "Contatos" },
];

export function CRMMobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        {items.map((it) => {
          const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold min-h-[44px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <it.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_oklch(0.72_0.205_38_/_0.6)]")} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

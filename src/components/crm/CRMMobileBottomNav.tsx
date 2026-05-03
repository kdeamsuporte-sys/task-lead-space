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
  const activeIndex = Math.max(
    0,
    items.findIndex((it) =>
      it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/"),
    ),
  );
  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 pointer-events-none">
      <div
        className="pointer-events-auto relative mx-auto flex max-w-md items-stretch justify-between overflow-hidden rounded-2xl border border-border/60 bg-background/85 px-2 py-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        {/* Spotlight glow follows the active item */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 h-full transition-all duration-500 ease-out"
          style={{
            width: `${100 / items.length}%`,
            left: `${(activeIndex * 100) / items.length}%`,
            background:
              "radial-gradient(closest-side, oklch(0.72 0.205 38 / 0.35), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px h-px transition-all duration-500 ease-out"
          style={{
            width: `${100 / items.length}%`,
            left: `${(activeIndex * 100) / items.length}%`,
            background:
              "linear-gradient(90deg, transparent, oklch(0.72 0.205 38), transparent)",
          }}
        />
        {items.map((it, index) => {
          const active = index === activeIndex;
          const distance = Math.abs(activeIndex - index);
          const dim = Math.max(0, 1 - distance * 0.45);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold min-h-[48px] transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <it.icon
                className="h-5 w-5 transition-all duration-300"
                style={{
                  filter: active
                    ? "drop-shadow(0 0 8px oklch(0.72 0.205 38 / 0.7))"
                    : `drop-shadow(0 0 ${dim * 4}px oklch(0.72 0.205 38 / ${dim * 0.3}))`,
                }}
              />
              <span className={cn("transition-opacity", !active && "opacity-70")}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

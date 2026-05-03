import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Inbox, KanbanSquare, Calendar, IdCard } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; icon: any; label: string; exact?: boolean };
const items: Item[] = [
  { to: "/", icon: LayoutGrid, label: "Visão", exact: true },
  { to: "/inbox", icon: Inbox, label: "Inbox" },
  // index 2 = CRM FAB (drawer trigger)
  { to: "/pipeline", icon: KanbanSquare, label: "Pipeline" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
];

export function CRMMobileBottomNav({ onOpenCRM }: { onOpenCRM?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const activeIndex = Math.max(
    0,
    items.findIndex((it) =>
      it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/"),
    ),
  );
  const slots = items.length + 1; // +1 for the central CRM FAB slot
  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 pointer-events-none">
      <div
        className="pointer-events-auto relative mx-auto flex max-w-md items-stretch justify-between rounded-2xl glass-strong px-2 py-1.5"
      >
        {/* Spotlight glow follows the active item (skip middle FAB slot) */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 h-full transition-all duration-500 ease-out"
          style={{
            width: `${100 / slots}%`,
            left: `${((activeIndex < 2 ? activeIndex : activeIndex + 1) * 100) / slots}%`,
            background:
              "radial-gradient(closest-side, oklch(0.72 0.205 38 / 0.35), transparent 70%)",
          }}
        />
        {items.slice(0, 2).map((it, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold min-h-[48px] transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <it.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_oklch(0.72_0.205_38/0.7)]")} />
              <span className={cn(!active && "opacity-70")}>{it.label}</span>
            </Link>
          );
        })}

        {/* Central CRM FAB → opens dedicated CRM drawer */}
        <button
          onClick={onOpenCRM}
          aria-label="Abrir CRM"
          className="relative z-10 flex flex-col items-center justify-center gap-0.5 px-2"
        >
          <span
            className="grid h-12 w-12 -mt-5 place-items-center rounded-2xl text-primary-foreground glow-primary active:scale-95 transition"
            style={{ background: "var(--gradient-primary)" }}
          >
            <IdCard className="h-5 w-5" />
          </span>
          <span className="text-[10px] font-bold text-primary">CRM</span>
        </button>

        {items.slice(2).map((it, i) => {
          const index = i + 2;
          const active = index === activeIndex;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold min-h-[48px] transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <it.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_oklch(0.72_0.205_38/0.7)]")} />
              <span className={cn(!active && "opacity-70")}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

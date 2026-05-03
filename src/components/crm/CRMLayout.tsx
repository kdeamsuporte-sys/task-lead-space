import { useState } from "react";
import { cn } from "@/lib/utils";
import { PortalSidebar, portalGroups } from "@/components/portal/PortalSidebar";
import { PortalTopBar } from "@/components/portal/PortalTopBar";
import { CRMMobileBottomNav } from "./CRMMobileBottomNav";
import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <div
        className={cn("lg:hidden fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto glass-strong p-4 transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>A</div>
            <div>
              <div className="text-[10px] font-black tracking-[0.18em] uppercase">ALTUM</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Portal do cliente</div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {portalGroups.map((g) => (
            <div key={g.label}>
              <div className="px-1 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{g.label}</div>
              <div className="flex flex-col gap-0.5">
                {g.items.map((it) => {
                  const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
                  return (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={onClose}
                      className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold",
                        active ? "bg-primary/12 text-primary ring-1 ring-primary/25" : "text-foreground/85 hover:bg-card")}
                    >
                      <it.icon className="h-4 w-4" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge && <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold text-success">{it.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export function CRMLayout({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      <div className="hidden lg:block"><PortalSidebar /></div>
      <MobileDrawer open={menu} onClose={() => setMenu(false)} />
      <main className="relative z-10 min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 pb-28 lg:pb-8">
        <PortalTopBar onOpenMenu={() => setMenu(true)} />
        <div className="mt-4 sm:mt-6">{children}</div>
      </main>
      <CRMMobileBottomNav />
    </div>
  );
}

// Compat export for existing imports
export { PortalTopBar as CRMTopBar };

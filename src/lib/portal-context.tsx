import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type UiMode = "essencial" | "conforto";
export type Theme = "dark" | "light";

type Ctx = {
  uiMode: UiMode;
  theme: Theme;
  sidebarCollapsed: boolean;
  setUiMode: (m: UiMode) => void;
  setTheme: (t: Theme) => void;
  setSidebarCollapsed: (v: boolean) => void;
};

const PortalContext = createContext<Ctx | undefined>(undefined);

const LS = "altum.portal.prefs";

function readLocal(): Partial<Ctx> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS) ?? "{}"); } catch { return {}; }
}
function writeLocal(p: Partial<Ctx>) {
  if (typeof window === "undefined") return;
  const cur = readLocal();
  localStorage.setItem(LS, JSON.stringify({ ...cur, ...p }));
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const initial = readLocal();
  const [uiMode, setUiModeS] = useState<UiMode>((initial.uiMode as UiMode) ?? "essencial");
  const [theme, setThemeS] = useState<Theme>((initial.theme as Theme) ?? "dark");
  const [sidebarCollapsed, setSidebarCollapsedS] = useState<boolean>(!!initial.sidebarCollapsed);

  // sync with backend prefs when user available
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data } = await supabase.from("crm_portal_prefs").select("*").eq("owner_id", user.id).maybeSingle();
      if (!alive) return;
      if (data) {
        setUiModeS((data.ui_mode as UiMode) ?? "essencial");
        setThemeS((data.theme as Theme) ?? "dark");
        setSidebarCollapsedS(!!data.sidebar_collapsed);
      } else {
        await supabase.from("crm_portal_prefs").insert({
          owner_id: user.id, ui_mode: uiMode, theme, sidebar_collapsed: sidebarCollapsed,
        });
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // apply classes to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("theme-light", theme === "light");
    root.classList.toggle("ui-essencial", uiMode === "essencial");
    root.classList.toggle("ui-conforto", uiMode === "conforto");
  }, [theme, uiMode]);

  const persist = async (patch: Partial<{ ui_mode: UiMode; theme: Theme; sidebar_collapsed: boolean }>) => {
    writeLocal({
      uiMode: patch.ui_mode ?? uiMode,
      theme: patch.theme ?? theme,
      sidebarCollapsed: patch.sidebar_collapsed ?? sidebarCollapsed,
    });
    if (!user) return;
    await supabase.from("crm_portal_prefs").upsert({
      owner_id: user.id,
      ui_mode: patch.ui_mode ?? uiMode,
      theme: patch.theme ?? theme,
      sidebar_collapsed: patch.sidebar_collapsed ?? sidebarCollapsed,
    }, { onConflict: "owner_id" });
  };

  const setUiMode = (m: UiMode) => { setUiModeS(m); persist({ ui_mode: m }); };
  const setTheme = (t: Theme) => { setThemeS(t); persist({ theme: t }); };
  const setSidebarCollapsed = (v: boolean) => { setSidebarCollapsedS(v); persist({ sidebar_collapsed: v }); };

  return (
    <PortalContext.Provider value={{ uiMode, theme, sidebarCollapsed, setUiMode, setTheme, setSidebarCollapsed }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const c = useContext(PortalContext);
  if (!c) throw new Error("usePortal must be used within PortalProvider");
  return c;
}
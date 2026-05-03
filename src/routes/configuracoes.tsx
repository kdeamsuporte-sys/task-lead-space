import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { usePortal } from "@/lib/portal-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Moon, Sun, LayoutGrid, Maximize2, PanelLeftClose, PanelLeftOpen, LogOut, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — ALTUM Portal" }, { name: "description", content: "Preferências do portal e ajustes da conta." }] }),
  component: Page,
});

function Toggle({ active, onClick, icon: Icon, label, desc }: { active: boolean; onClick: () => void; icon: any; label: string; desc: string }) {
  return (
    <button onClick={onClick} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/8 ring-1 ring-primary/30" : "border-border bg-card/50 hover:border-primary/30"}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-primary/15 text-primary" : "bg-secondary text-foreground/70"}`}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0">
        <div className="text-sm font-bold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}

function Page() {
  const { uiMode, theme, sidebarCollapsed, setUiMode, setTheme, setSidebarCollapsed } = usePortal();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoadingProfile(false); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      setDisplayName(data?.display_name ?? "");
      setLoadingProfile(false);
    })();
  }, [user?.id]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() || null }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Perfil atualizado");
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Governança" title="Configurações" description="Preferências do portal e ajustes da conta." />

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-base font-bold">Tema</h2>
          <p className="text-xs text-muted-foreground">Aplica a aparência geral do portal.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Toggle active={theme === "dark"} onClick={() => setTheme("dark")} icon={Moon} label="Escuro" desc="Padrão Altum, ideal para uso prolongado." />
            <Toggle active={theme === "light"} onClick={() => setTheme("light")} icon={Sun} label="Claro" desc="Mais legível em ambientes muito iluminados." />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-base font-bold">Modo de operação</h2>
          <p className="text-xs text-muted-foreground">Define a densidade dos elementos.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Toggle active={uiMode === "essencial"} onClick={() => setUiMode("essencial")} icon={LayoutGrid} label="Essencial" desc="Foco no que importa, com menos ruído." />
            <Toggle active={uiMode === "conforto"} onClick={() => setUiMode("conforto")} icon={Maximize2} label="Conforto" desc="Mais respiro entre os elementos." />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-base font-bold">Barra lateral</h2>
          <p className="text-xs text-muted-foreground">Controle se a navegação inicia recolhida.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Toggle active={!sidebarCollapsed} onClick={() => setSidebarCollapsed(false)} icon={PanelLeftOpen} label="Expandida" desc="Mostra os rótulos completos." />
            <Toggle active={sidebarCollapsed} onClick={() => setSidebarCollapsed(true)} icon={PanelLeftClose} label="Recolhida" desc="Mostra apenas ícones." />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-base font-bold">Conta</h2>
          <p className="text-xs text-muted-foreground">Identidade exibida no portal.</p>
          {loadingProfile ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Carregando…</div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">E-mail</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm">
                  <UserIcon className="h-4 w-4 text-muted-foreground" /> {user?.email}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nome de exibição</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={saveProfile} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />} Salvar perfil
                </button>
                <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive">
                  <LogOut className="h-3 w-3" /> Sair da conta
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </CRMLayout>
  );
}

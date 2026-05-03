import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Rocket, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lancamento")({
  head: () => ({ meta: [{ title: "Lançamento — ALTUM Portal" }] }),
  component: Page,
});

const SEED = [
  "Conectar canal WhatsApp", "Importar contatos iniciais", "Configurar prompt da IA",
  "Definir horário de atendimento", "Cadastrar serviços e preços", "Treinar base de conhecimento",
  "Configurar campanha de boas-vindas", "Validar fluxo de retornos", "Publicar formulário de captação",
];

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newItem, setNewItem] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["launch", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_launch_checklist").select("*").order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const seed = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const rows = SEED.map((item, i) => ({ owner_id: user.id, item, position: i, status: "pendente" }));
      const { error } = await supabase.from("crm_launch_checklist").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["launch"] }),
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user || !newItem.trim()) return;
      const { error } = await supabase.from("crm_launch_checklist").insert({ owner_id: user.id, item: newItem.trim(), position: items.length, status: "pendente" });
      if (error) throw error;
    },
    onSuccess: () => { setNewItem(""); qc.invalidateQueries({ queryKey: ["launch"] }); },
  });

  const toggle = useMutation({
    mutationFn: async (it: any) => {
      const next = it.status === "concluido" ? "pendente" : "concluido";
      const { error } = await supabase.from("crm_launch_checklist").update({ status: next, completed_at: next === "concluido" ? new Date().toISOString() : null }).eq("id", it.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["launch"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("crm_launch_checklist").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["launch"] }),
  });

  const done = items.filter((i: any) => i.status === "concluido").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <CRMLayout>
      <div className="space-y-4">
        <CRMPageHeader eyebrow="Governança" title="Lançamento" description="Checklist de go-live da operação." />

        <div className="glass rounded-2xl p-4 sm:p-5 ambient-glow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Prontidão da operação</div>
              <div className="mt-1 text-2xl font-black">{pct}%</div>
              <div className="text-xs text-muted-foreground">{done} de {items.length} itens concluídos</div>
            </div>
            <div className="h-16 w-16 rounded-full glass-strong grid place-items-center glow-soft"><Rocket className="h-7 w-7 text-primary" /></div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-card overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="flex gap-2">
          <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Adicionar item ao checklist" className="flex-1 rounded-full glass px-4 py-2 text-sm outline-none" />
          <button type="submit" disabled={!newItem.trim()} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground glow-soft disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}><Plus className="h-3.5 w-3.5" /> Adicionar</button>
        </form>

        {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : items.length === 0 ? (
          <div className="space-y-3">
            <CRMEmptyState icon={Rocket} title="Comece pelo essencial" description="Crie um checklist personalizado ou use nosso template." />
            <button onClick={() => seed.mutate()} className="rounded-full glass px-4 py-2 text-xs font-bold">Usar template ALTUM</button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it: any) => {
              const ok = it.status === "concluido";
              return (
                <div key={it.id} className={cn("group glass rounded-xl px-3 py-2.5 flex items-center gap-3", ok && "opacity-60")}>
                  <button onClick={() => toggle.mutate(it)} className={cn("h-6 w-6 grid place-items-center rounded-full border transition", ok ? "bg-success border-success text-success-foreground glow-soft" : "border-border hover:border-primary")}>
                    {ok && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <span className={cn("flex-1 text-sm", ok && "line-through")}>{it.item}</span>
                  <button onClick={() => del.mutate(it.id)} className="opacity-0 group-hover:opacity-100 h-7 w-7 grid place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}

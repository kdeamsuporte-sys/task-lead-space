import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, Activity, MessageCircle, ArrowRight, Flame, Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "Logs — ALTUM Portal" }] }),
  component: Page,
});

const filters = ["Todos", "Contatos", "Mensagens", "Etapas", "Notas"];

const ICON: Record<string, any> = {
  contato_criado: Plus, etapa_alterada: ArrowRight, mensagem_enviada: MessageCircle,
  nota_adicionada: FileText, prioridade_alterada: Flame, temperatura_alterada: Flame,
};

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Page() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contact_timeline")
        .select("*, contact:crm_contacts(id,name)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    let l = events as any[];
    if (filter === "Contatos") l = l.filter((e) => e.event_type.includes("contato"));
    if (filter === "Mensagens") l = l.filter((e) => e.event_type.includes("mensagem"));
    if (filter === "Etapas") l = l.filter((e) => e.event_type.includes("etapa") || e.event_type.includes("temperatura") || e.event_type.includes("prioridade"));
    if (filter === "Notas") l = l.filter((e) => e.event_type.includes("nota"));
    if (search.trim()) {
      const s = search.toLowerCase();
      l = l.filter((e) => (e.description ?? "").toLowerCase().includes(s) || (e.contact?.name ?? "").toLowerCase().includes(s));
    }
    return l;
  }, [events, filter, search]);

  return (
    <CRMLayout>
      <div className="space-y-4">
        <CRMPageHeader eyebrow="Governança" title="Logs" description="Histórico de eventos e auditoria da operação." />

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <CRMFilterChips options={filters} value={filter} onChange={setFilter} />
          <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar evento ou contato…" className="flex-1 bg-transparent text-xs outline-none" />
          </div>
        </div>

        {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : filtered.length === 0 ? (
          <CRMEmptyState icon={ScrollText} title="Sem eventos" description="As ações da sua operação aparecerão aqui em tempo real." />
        ) : (
          <div className="glass rounded-2xl divide-y divide-border-soft overflow-hidden">
            {filtered.map((e: any) => {
              const Icon = ICON[e.event_type] ?? Activity;
              return (
                <div key={e.id} className="flex items-start gap-3 p-3 hover:bg-card/40 transition">
                  <div className="h-9 w-9 shrink-0 rounded-xl glass-strong grid place-items-center text-primary glow-soft"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{e.event_type.replace(/_/g, " ")}</span>
                      {e.contact?.name && <span className="text-[11px] font-bold">· {e.contact.name}</span>}
                    </div>
                    <div className="text-sm mt-0.5">{e.description || "—"}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{fmt(e.created_at)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}

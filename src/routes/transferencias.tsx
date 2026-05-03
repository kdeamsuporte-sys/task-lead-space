import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Bot, UserCog, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/transferencias")({
  head: () => ({ meta: [{ title: "Transferências — ALTUM Portal" }] }),
  component: Page,
});

const filters = ["Todas", "Pendente", "Resolvida", "Cancelada"];

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("Todas");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["handoffs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_handoffs")
        .select("*, contact:crm_contacts(id,name,phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (rows as any[]).filter((r) => {
    if (filter === "Pendente") return r.status === "pendente";
    if (filter === "Resolvida") return r.status === "resolvida";
    if (filter === "Cancelada") return r.status === "cancelada";
    return true;
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: any = { status };
      if (status === "resolvida") patch.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("crm_handoffs").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["handoffs"] }); toast.success("Atualizado"); },
  });

  const stats = {
    pendente: (rows as any[]).filter((r) => r.status === "pendente").length,
    resolvida: (rows as any[]).filter((r) => r.status === "resolvida").length,
    total: rows.length,
  };

  return (
    <CRMLayout>
      <div className="space-y-4">
        <CRMPageHeader eyebrow="Inteligência" title="Transferências" description="Handoffs entre IA e atendimento humano." />

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Pendentes", value: stats.pendente, tone: "warning" },
            { label: "Resolvidas", value: stats.resolvida, tone: "success" },
            { label: "Total", value: stats.total, tone: "info" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 ambient-glow">
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-3xl font-black">{s.value}</div>
            </div>
          ))}
        </div>

        <CRMFilterChips options={filters} value={filter} onChange={setFilter} />

        {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : filtered.length === 0 ? (
          <CRMEmptyState icon={ArrowLeftRight} title="Sem transferências" description="Quando a IA pedir handoff, aparecerá aqui." />
        ) : (
          <div className="space-y-2">
            {filtered.map((r: any) => (
              <article key={r.id} className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl glass-strong grid place-items-center text-primary glow-soft"><Bot className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{r.contact?.name ?? "Contato removido"}</span>
                    <CRMStatusBadge tone={r.status === "pendente" ? "warning" : r.status === "resolvida" ? "success" : "neutral"}>{r.status}</CRMStatusBadge>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.from_agent} → humano</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.reason || "Sem motivo informado"}</div>
                </div>
                {r.status === "pendente" && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => update.mutate({ id: r.id, status: "resolvida" })} className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30"><CheckCircle2 className="h-3 w-3" /> Resolver</button>
                    <button onClick={() => update.mutate({ id: r.id, status: "cancelada" })} className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-[11px] font-bold"><X className="h-3 w-3" /> Cancelar</button>
                    <button className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-[11px] font-bold"><UserCog className="h-3 w-3" /> Assumir</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}

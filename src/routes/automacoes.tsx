import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { AutomationDialog } from "@/components/crm/AutomationDialog";
import { useAutomations, useToggleAutomation, useDeleteAutomation } from "@/hooks/use-crm";
import { Zap, Pencil, Plus, ArrowRight, Trash2 } from "lucide-react";

export const Route = createFileRoute("/automacoes")({
  head: () => ({ meta: [{ title: "Automações — ALTUM CRM" }] }),
  component: AutomacoesPage,
});

function AutomacoesPage() {
  const { data: items = [] } = useAutomations();
  const toggle = useToggleAutomation();
  const del = useDeleteAutomation();
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="O CRM trabalha por você" title="Automações" description="Gatilhos comerciais."
          actions={<button onClick={() => setDlg({ open: true, initial: null })} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Plus className="h-3.5 w-3.5" /> Nova</button>}
        />
        {items.length === 0 ? (
          <CRMEmptyState icon={Zap} title="Sem automações" description="Crie sua primeira automação." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((a) => (
              <article key={a.id} className="glass-card ring-premium relative overflow-hidden rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${a.is_active ? "bg-primary/15 text-primary ring-primary/30" : "bg-muted/15 text-muted-foreground ring-border"}`}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold leading-tight">{a.name}</div>
                      {a.description && <div className="mt-0.5 text-[11px] text-muted-foreground">{a.description}</div>}
                    </div>
                  </div>
                  <button
                    onClick={async () => { try { await toggle.mutateAsync({ id: a.id, is_active: !a.is_active }); } catch(e:any){toast.error(e?.message);} }}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${a.is_active ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-md transition-all ${a.is_active ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-background/40 p-3">
                  <CRMStatusBadge tone="warning" size="xs">{a.trigger_type}</CRMStatusBadge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <CRMStatusBadge tone="primary" size="xs">{a.action_type}</CRMStatusBadge>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <CRMStatusBadge tone={a.is_active ? "success" : "neutral"}>{a.is_active ? "Ativa" : "Pausada"}</CRMStatusBadge>
                  <div className="flex gap-2">
                    <button onClick={() => setDlg({ open: true, initial: a })} className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-[11px] font-bold"><Pencil className="h-3 w-3" /> Editar</button>
                    <button onClick={async () => { if (confirm("Excluir?")) { try { await del.mutateAsync(a.id); toast.success("Excluída"); } catch(e:any){toast.error(e?.message);} } }} className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-[11px] font-bold text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <AutomationDialog open={dlg.open} onOpenChange={(v) => setDlg({ open: v, initial: null })} initial={dlg.initial} />
    </CRMLayout>
  );
}

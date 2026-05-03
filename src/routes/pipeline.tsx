import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { MoveStageDialog } from "@/components/crm/MoveStageDialog";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { usePipeline } from "@/hooks/use-crm";
import { useUpdateContact } from "@/hooks/use-contacts";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, fmtMoney, STAGE_LABEL } from "@/lib/format";
import { MessageCircle, Flame, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline — ALTUM CRM" }, { name: "description", content: "Funil." }] }),
  component: PipelinePage,
});

const stages: { id: any; label: string; tone: string }[] = [
  { id: "novo_lead", label: "Novo lead", tone: "primary" },
  { id: "aguardando_info", label: "Aguardando info", tone: "warning" },
  { id: "orcamento_enviado", label: "Orçamento enviado", tone: "info" },
  { id: "followup", label: "Follow-up", tone: "warning" },
  { id: "agendado", label: "Agendado", tone: "primary" },
  { id: "servico_realizado", label: "Realizado", tone: "success" },
  { id: "pos_venda", label: "Pós-venda", tone: "success" },
  { id: "perdido", label: "Perdido", tone: "danger" },
];

const toneCls: Record<string, string> = {
  primary: "border-primary/40 bg-primary/12 text-primary",
  warning: "border-warning/30 bg-warning/12 text-warning",
  info: "border-border bg-card/70 text-foreground/85",
  success: "border-success/30 bg-success/12 text-success",
  danger: "border-destructive/30 bg-destructive/12 text-destructive",
};

function PipelinePage() {
  const { data: contacts = [] } = usePipeline();
  const update = useUpdateContact();
  const [move, setMove] = useState<{ open: boolean; contact: any }>({ open: false, contact: null });
  const [createOpen, setCreateOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    stages.forEach((s) => (g[s.id] = []));
    contacts.forEach((c) => { if (g[c.stage]) g[c.stage].push(c); });
    return g;
  }, [contacts]);

  const onDrop = async (stageId: string) => {
    if (!dragId) return;
    try { await update.mutateAsync({ id: dragId, stage: stageId as any }); toast.success("Etapa atualizada"); }
    catch (e:any) { toast.error(e?.message); }
    setDragId(null);
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Funil comercial" title="Pipeline" description="Arraste cards entre colunas para mover etapas."
          actions={<button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Plus className="h-3.5 w-3.5" /> Novo</button>}
        />
        <div className="scroll-x-soft -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0">
          {stages.map((stage) => {
            const list = grouped[stage.id] ?? [];
            const total = list.reduce((s, l) => s + (Number(l.potential_value) || 0), 0);
            return (
              <div key={stage.id} className="w-[300px] shrink-0" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(stage.id)}>
                <div className="glass-card ring-premium rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${toneCls[stage.tone]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {stage.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-[11px] text-muted-foreground">
                    <span><span className="font-bold text-foreground">{list.length}</span> {list.length === 1 ? "negócio" : "negócios"}</span>
                    <span className="font-bold tabular-nums text-foreground">{fmtMoney(total)}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2 min-h-[80px]">
                  {list.length === 0 && <div className="rounded-2xl border border-dashed border-border-soft bg-card/30 p-6 text-center text-[11px] text-muted-foreground">Vazio</div>}
                  {list.map((l) => {
                    const onWa = () => {
                      const link = whatsappLink(l.phone, `Olá ${l.name.split(" ")[0]}, tudo bem?`);
                      if (!link) return toast.error("Sem telefone");
                      window.open(link, "_blank");
                    };
                    return (
                      <article key={l.id} draggable onDragStart={() => setDragId(l.id)} className="glass-card ring-premium group cursor-grab rounded-2xl p-3 transition hover:-translate-y-0.5 hover:border-primary/40 active:cursor-grabbing">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-[11px] font-black text-primary ring-1 ring-primary/30">{initials(l.name)}</div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold">{l.name}</div>
                              <div className="truncate text-[10px] text-muted-foreground">{l.service ?? "—"}</div>
                            </div>
                          </div>
                          <button onClick={() => setMove({ open: true, contact: l })} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"><ArrowRight className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-[10px] text-muted-foreground">{l.source ?? "—"}</div>
                          <div className="text-xs font-black tabular-nums">{fmtMoney(l.potential_value)}</div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          {l.temperature === "quente" && <CRMStatusBadge tone="primary" icon={Flame} size="xs">Quente</CRMStatusBadge>}
                          {l.temperature === "morno" && <CRMStatusBadge tone="warning" size="xs">Morno</CRMStatusBadge>}
                          {l.temperature === "frio" && <CRMStatusBadge tone="neutral" size="xs">Frio</CRMStatusBadge>}
                        </div>
                        <button onClick={onWa} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-success/15 px-2 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30">
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <MoveStageDialog open={move.open} onOpenChange={(v) => setMove({ open: v, contact: null })} contact={move.contact} />
      <ContactFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </CRMLayout>
  );
}

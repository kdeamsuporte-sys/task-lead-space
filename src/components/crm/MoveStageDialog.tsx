import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUpdateContact } from "@/hooks/use-contacts";

const STAGES = [
  ["novo_lead", "Novo lead"],
  ["aguardando_info", "Aguardando informações"],
  ["orcamento_enviado", "Orçamento enviado"],
  ["followup", "Follow-up"],
  ["agendado", "Agendado"],
  ["servico_realizado", "Serviço realizado"],
  ["pos_venda", "Pós-venda"],
  ["perdido", "Perdido"],
] as const;

export function MoveStageDialog({ open, onOpenChange, contact }: { open: boolean; onOpenChange: (v: boolean) => void; contact: any }) {
  const update = useUpdateContact();
  const [stage, setStage] = useState(contact?.stage ?? "novo_lead");
  const [lostReason, setLostReason] = useState(contact?.lost_reason ?? "");

  useEffect(() => {
    if (open && contact) {
      setStage(contact.stage);
      setLostReason(contact.lost_reason ?? "");
    }
  }, [open, contact]);

  const submit = async () => {
    if (!contact) return;
    try {
      const patch: any = { id: contact.id, stage };
      if (stage === "perdido") {
        patch.lost_reason = lostReason || null;
        patch.lost_at = new Date().toISOString();
      }
      await update.mutateAsync(patch);
      toast.success("Etapa atualizada");
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Erro"); }
  };

  const inp = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Mover etapa{contact ? ` · ${contact.name}` : ""}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Etapa</span>
            <select className={inp} value={stage} onChange={(e) => setStage(e.target.value as any)}>
              {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          {stage === "perdido" && (
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Motivo</span>
              <select className={inp} value={lostReason} onChange={(e) => setLostReason(e.target.value)}>
                <option value="">Selecionar…</option>
                <option>Sem resposta</option><option>Preço alto</option>
                <option>Fora da região</option><option>Fechou com outro</option>
                <option>Sem interesse</option><option>Outro</option>
              </select>
            </label>
          )}
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button>
          <button onClick={submit} disabled={update.isPending} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
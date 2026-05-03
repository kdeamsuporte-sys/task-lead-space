import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ContactPicker } from "./ContactPicker";
import { useUpsertFollowup } from "@/hooks/use-crm";

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function FollowupDialog({
  open, onOpenChange, initial, defaultContactId,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: any; defaultContactId?: string | null }) {
  const upsert = useUpsertFollowup();
  const [contactId, setContactId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<"baixa" | "media" | "alta" | "urgente">("media");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setContactId(initial?.contact_id ?? defaultContactId ?? null);
      setScheduledAt(toLocalInput(initial?.scheduled_at) || toLocalInput(new Date(Date.now() + 24 * 3600_000).toISOString()));
      setReason(initial?.reason ?? "");
      setPriority(initial?.priority ?? "media");
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial, defaultContactId]);

  const submit = async () => {
    if (!contactId) return toast.error("Selecione um contato");
    if (!scheduledAt) return toast.error("Defina a data");
    try {
      await upsert.mutateAsync({
        id: initial?.id,
        contact_id: contactId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        reason: reason || null,
        priority,
        notes: notes || null,
      } as any);
      toast.success(initial?.id ? "Retorno atualizado" : "Retorno criado");
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Erro"); }
  };

  const inp = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial?.id ? "Editar retorno" : "Novo retorno"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Contato</div>
            <ContactPicker value={contactId} onChange={(id) => setContactId(id)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Data e hora</span>
              <input type="datetime-local" className={inp} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Prioridade</span>
              <select className={inp} value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option value="baixa">Baixa</option><option value="media">Média</option>
                <option value="alta">Alta</option><option value="urgente">Urgente</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Motivo</span>
            <input className={inp} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Aguardando decisão, follow-up de orçamento…" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Observações</span>
            <textarea className={inp + " min-h-[80px]"} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button>
          <button onClick={submit} disabled={upsert.isPending} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
            {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
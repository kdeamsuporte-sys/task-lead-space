import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ContactPicker } from "./ContactPicker";
import { useUpsertTask } from "@/hooks/use-crm";

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function TaskDialog({
  open, onOpenChange, initial, defaultContactId,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: any; defaultContactId?: string | null }) {
  const upsert = useUpsertTask();
  const [contactId, setContactId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<"baixa" | "media" | "alta" | "urgente">("media");

  useEffect(() => {
    if (open) {
      setContactId(initial?.contact_id ?? defaultContactId ?? null);
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setDueAt(toLocalInput(initial?.due_at));
      setPriority(initial?.priority ?? "media");
    }
  }, [open, initial, defaultContactId]);

  const submit = async () => {
    if (!title.trim()) return toast.error("Informe o título");
    try {
      await upsert.mutateAsync({
        id: initial?.id,
        title: title.trim(),
        description: description || null,
        contact_id: contactId,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        priority,
      } as any);
      toast.success(initial?.id ? "Tarefa atualizada" : "Tarefa criada");
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Erro"); }
  };

  const inp = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial?.id ? "Editar tarefa" : "Nova tarefa"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Título*</span>
            <input className={inp} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Descrição</span>
            <textarea className={inp + " min-h-[60px]"} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Prazo</span>
              <input type="datetime-local" className={inp} value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Prioridade</span>
              <select className={inp} value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option value="baixa">Baixa</option><option value="media">Média</option>
                <option value="alta">Alta</option><option value="urgente">Urgente</option>
              </select>
            </label>
          </div>
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Contato (opcional)</div>
            <ContactPicker value={contactId} onChange={(id) => setContactId(id)} />
          </div>
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
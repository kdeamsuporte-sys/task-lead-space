import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUpsertAutomation } from "@/hooks/use-crm";

const TRIGGERS = [
  ["lead_sem_resposta", "Lead sem resposta"],
  ["orcamento_sem_retorno", "Orçamento sem retorno"],
  ["pos_venda", "Após serviço realizado"],
  ["aniversario", "Aniversário do cliente"],
  ["lead_quente_inativo", "Lead quente inativo"],
];
const ACTIONS = [
  ["enviar_whatsapp", "Enviar WhatsApp"],
  ["criar_tarefa", "Criar tarefa"],
  ["criar_retorno", "Criar retorno"],
  ["mover_etapa", "Mover etapa"],
  ["alerta", "Mostrar alerta"],
];

export function AutomationDialog({
  open, onOpenChange, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: any }) {
  const upsert = useUpsertAutomation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("lead_sem_resposta");
  const [action, setAction] = useState("enviar_whatsapp");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setTrigger(initial?.trigger_type ?? "lead_sem_resposta");
      setAction(initial?.action_type ?? "enviar_whatsapp");
      setActive(initial?.is_active ?? false);
    }
  }, [open, initial]);

  const submit = async () => {
    if (!name.trim()) return toast.error("Dê um nome");
    try {
      await upsert.mutateAsync({
        id: initial?.id,
        name: name.trim(),
        description: description || null,
        trigger_type: trigger,
        action_type: action,
        is_active: active,
      } as any);
      toast.success(initial?.id ? "Automação atualizada" : "Automação criada");
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Erro"); }
  };

  const inp = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial?.id ? "Editar automação" : "Nova automação"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Nome</span>
            <input className={inp} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Descrição</span>
            <textarea className={inp + " min-h-[60px]"} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Quando</span>
              <select className={inp} value={trigger} onChange={(e) => setTrigger(e.target.value)}>
                {TRIGGERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Faz</span>
              <select className={inp} value={action} onChange={(e) => setAction(e.target.value)}>
                {ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span className="text-sm">Ativar imediatamente</span>
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ContactPicker } from "./ContactPicker";
import { useUpsertQuote } from "@/hooks/use-crm";

export function QuoteDialog({
  open, onOpenChange, initial, defaultContactId,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: any; defaultContactId?: string | null }) {
  const upsert = useUpsertQuote();
  const [contactId, setContactId] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState<"rascunho"|"enviado"|"visualizado"|"aguardando"|"aceito"|"recusado"|"expirado">("rascunho");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    if (open) {
      setContactId(initial?.contact_id ?? defaultContactId ?? null);
      setService(initial?.service ?? "");
      setDescription(initial?.description ?? "");
      setAmount(String(initial?.amount ?? "0"));
      setDiscount(String(initial?.discount ?? "0"));
      setDeposit(String(initial?.deposit ?? "0"));
      setPaymentMethod(initial?.payment_method ?? "");
      setValidUntil(initial?.valid_until ?? "");
      setStatus(initial?.status ?? "rascunho");
      setObservations(initial?.observations ?? "");
    }
  }, [open, initial, defaultContactId]);

  const submit = async () => {
    if (!contactId) return toast.error("Selecione um contato");
    if (!service) return toast.error("Informe o serviço");
    try {
      await upsert.mutateAsync({
        id: initial?.id,
        contact_id: contactId,
        service, description: description || null,
        amount: Number(amount.replace(",", ".")) || 0,
        discount: Number(discount.replace(",", ".")) || 0,
        deposit: Number(deposit.replace(",", ".")) || 0,
        payment_method: paymentMethod || null,
        valid_until: validUntil || null,
        status,
        observations: observations || null,
      } as any);
      toast.success(initial?.id ? "Orçamento atualizado" : "Orçamento criado");
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Erro"); }
  };

  const inp = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial?.id ? "Editar orçamento" : "Novo orçamento"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Contato</div>
            <ContactPicker value={contactId} onChange={(id) => setContactId(id)} />
          </div>
          <label className="block md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Serviço*</span>
            <input className={inp} value={service} onChange={(e) => setService(e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Descrição</span>
            <textarea className={inp + " min-h-[80px]"} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Valor (R$)</span>
            <input className={inp} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Desconto (R$)</span>
            <input className={inp} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sinal (R$)</span>
            <input className={inp} value={deposit} onChange={(e) => setDeposit(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pagamento</span>
            <input className={inp} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Pix, cartão, boleto…" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Validade</span>
            <input type="date" className={inp} value={validUntil ?? ""} onChange={(e) => setValidUntil(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
            <select className={inp} value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="rascunho">Rascunho</option>
              <option value="enviado">Enviado</option>
              <option value="visualizado">Visualizado</option>
              <option value="aguardando">Aguardando</option>
              <option value="aceito">Aceito</option>
              <option value="recusado">Recusado</option>
              <option value="expirado">Expirado</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Observações</span>
            <textarea className={inp + " min-h-[60px]"} value={observations} onChange={(e) => setObservations(e.target.value)} />
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
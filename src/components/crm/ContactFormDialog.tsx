import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCreateContact, useUpdateContact, type Contact } from "@/hooks/use-contacts";

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

const PRIORITIES = [["baixa","Baixa"],["media","Média"],["alta","Alta"],["urgente","Urgente"]] as const;
const TEMPS = [["frio","Frio"],["morno","Morno"],["quente","Quente"]] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().max(160).email("E-mail inválido").optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional().or(z.literal("")),
  service: z.string().trim().max(160).optional().or(z.literal("")),
  neighborhood: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  stage: z.enum(["novo_lead","aguardando_info","orcamento_enviado","followup","agendado","servico_realizado","pos_venda","perdido"]),
  priority: z.enum(["baixa","media","alta","urgente"]),
  temperature: z.enum(["frio","morno","quente"]),
  potential_value: z.string().optional(),
  next_step: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact?: Contact | null;
  onSaved?: (id: string) => void;
};

export function ContactFormDialog({ open, onOpenChange, contact, onSaved }: Props) {
  const isEdit = !!contact;
  const create = useCreateContact();
  const update = useUpdateContact();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", company: "", source: "", service: "",
    neighborhood: "", city: "",
    stage: "novo_lead", priority: "media", temperature: "morno",
    potential_value: "", next_step: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (contact) {
        setForm({
          name: contact.name ?? "",
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          company: contact.company ?? "",
          source: contact.source ?? "",
          service: contact.service ?? "",
          neighborhood: contact.neighborhood ?? "",
          city: contact.city ?? "",
          stage: contact.stage,
          priority: contact.priority,
          temperature: contact.temperature,
          potential_value: contact.potential_value != null ? String(contact.potential_value) : "",
          next_step: contact.next_step ?? "",
          notes: contact.notes ?? "",
        });
      } else {
        setForm({
          name: "", phone: "", email: "", company: "", source: "", service: "",
          neighborhood: "", city: "",
          stage: "novo_lead", priority: "media", temperature: "morno",
          potential_value: "", next_step: "", notes: "",
        });
      }
    }
  }, [open, contact]);

  const submitting = create.isPending || update.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string,string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      company: form.company.trim() || null,
      source: form.source.trim() || null,
      service: form.service.trim() || null,
      neighborhood: form.neighborhood.trim() || null,
      city: form.city.trim() || null,
      stage: form.stage as any,
      priority: form.priority as any,
      temperature: form.temperature as any,
      potential_value: form.potential_value ? Number(form.potential_value.replace(",", ".")) : null,
      next_step: form.next_step.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      if (isEdit && contact) {
        await update.mutateAsync({ id: contact.id, ...payload });
        toast.success("Contato atualizado");
        onSaved?.(contact.id);
      } else {
        const created = await create.mutateAsync(payload);
        toast.success("Contato criado");
        onSaved?.(created.id);
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar");
    }
  };

  const inp = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar contato" : "Novo contato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nome*" error={errors.name}>
            <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Telefone" error={errors.phone}>
            <input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+55 31 9..." />
          </Field>
          <Field label="E-mail" error={errors.email}>
            <input type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Empresa">
            <input className={inp} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="Origem">
            <input className={inp} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="WhatsApp, Indicação, Site…" />
          </Field>
          <Field label="Serviço de interesse">
            <input className={inp} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
          </Field>
          <Field label="Bairro">
            <input className={inp} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
          </Field>
          <Field label="Cidade">
            <input className={inp} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Etapa">
            <select className={inp} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Prioridade">
            <select className={inp} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Temperatura">
            <select className={inp} value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })}>
              {TEMPS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Valor potencial (R$)">
            <input className={inp} value={form.potential_value} onChange={(e) => setForm({ ...form, potential_value: e.target.value })} placeholder="0,00" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Próximo passo">
              <input className={inp} value={form.next_step} onChange={(e) => setForm({ ...form, next_step: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Observação">
              <textarea className={inp + " min-h-[80px]"} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>

          <DialogFooter className="md:col-span-2 mt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-4 py-2 text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Criar contato"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </label>
  );
}
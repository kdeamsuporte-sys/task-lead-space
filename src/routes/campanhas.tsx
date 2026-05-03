import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Megaphone, Users, Send, Trash2, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — ALTUM Portal" }, { name: "description", content: "Resultados das campanhas de relacionamento." }] }),
  component: Page,
});

function useCampaigns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["campaigns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("crm_campaigns").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

function CampaignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [max, setMax] = useState(50);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!user) return;
    if (!name.trim()) return toast.error("Nome obrigatório");
    if (!message.trim()) return toast.error("Mensagem obrigatória");
    setSaving(true);
    const { error } = await supabase.from("crm_campaigns").insert({ owner_id: user.id, name: name.trim(), message: message.trim(), max_recipients: max, status: "rascunho" });
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    toast.success("Campanha criada");
    setName(""); setMessage(""); setMax(50);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova campanha</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Mensagem</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Máx. destinatários</label>
            <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value) || 50)} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-full border border-border px-4 py-2 text-xs font-bold">Cancelar</button>
          <button onClick={submit} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>{saving && <Loader2 className="h-3 w-3 animate-spin" />} Criar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "bg-secondary text-muted-foreground" },
  ativa: { label: "Ativa", cls: "bg-success/15 text-success" },
  pausada: { label: "Pausada", cls: "bg-warning/15 text-warning" },
  concluida: { label: "Concluída", cls: "bg-primary/15 text-primary" },
};

function Page() {
  const qc = useQueryClient();
  const { data: list = [], isLoading } = useCampaigns();
  const [open, setOpen] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Remover campanha?")) return;
    await supabase.from("crm_campaigns").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["campaigns"] });
  };
  const run = async (id: string) => {
    await supabase.from("crm_campaigns").update({ status: "ativa", last_run_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    toast.success("Campanha ativada");
  };

  const totalRuns = list.reduce((s: number, c: any) => s + (c.runs_count ?? 0), 0);
  const ativas = list.filter((c: any) => c.status === "ativa").length;

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Crescimento"
          title="Campanhas"
          description="Acompanhe o resultado das campanhas de relacionamento."
          actions={
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Plus className="h-3.5 w-3.5" /> Nova campanha</button>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CRMMetricCard icon={Megaphone} label="Campanhas" value={list.length} tone="primary" />
          <CRMMetricCard icon={Send} label="Ativas" value={ativas} tone="success" />
          <CRMMetricCard icon={Users} label="Execuções" value={totalRuns} hint="Total acumulado" tone="info" />
          <CRMMetricCard icon={Megaphone} label="Rascunhos" value={list.filter((c: any) => c.status === "rascunho").length} tone="warning" />
        </div>

        <section className="glass-card rounded-3xl p-4 sm:p-5">
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Lista</div>
            <h3 className="mt-1 text-base font-bold">Suas campanhas</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : list.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">Nenhuma campanha ainda. Crie a primeira para iniciar.</div>
          ) : (
            <ul className="space-y-2">
              {list.map((c: any) => {
                const s = STATUS_LABEL[c.status] ?? STATUS_LABEL.rascunho;
                return (
                  <li key={c.id} className="rounded-2xl border border-border-soft bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold">{c.name}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.message}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                          <span>Máx: {c.max_recipients}</span>
                          <span>Execuções: {c.runs_count ?? 0}</span>
                          <span>Última: {c.last_run_at ? fmtDate(c.last_run_at) : "—"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {c.status !== "ativa" && <button onClick={() => run(c.id)} className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30"><Play className="h-3 w-3" /> Ativar</button>}
                        <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[11px] font-bold text-destructive"><Trash2 className="h-3 w-3" /> Remover</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <CampaignDialog open={open} onOpenChange={setOpen} />
    </CRMLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Wand2, MessageSquareText, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ia")({
  head: () => ({ meta: [{ title: "IA — ALTUM Portal" }, { name: "description", content: "Sugestões de próximos passos e mensagens." }] }),
  component: Page,
});

function useAiSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ai-settings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("crm_ai_settings").select("*").eq("owner_id", user!.id).maybeSingle();
      return data;
    },
  });
}

async function callAI(type: "next" | "message", context: string) {
  const { data, error } = await supabase.functions.invoke("ai-suggest", { body: { type, context } });
  if (error) throw error;
  return data?.text as string;
}

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: settings, isLoading } = useAiSettings();
  const [tone, setTone] = useState("profissional");
  const [basePrompt, setBasePrompt] = useState("");
  const [active, setActive] = useState(false);
  const [savingS, setSavingS] = useState(false);

  const [nextCtx, setNextCtx] = useState("");
  const [nextOut, setNextOut] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);

  const [msgCtx, setMsgCtx] = useState("");
  const [msgOut, setMsgOut] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);

  // sync state
  if (!isLoading && settings && !basePrompt && !nextOut && tone === "profissional") {
    if (settings.tone) setTone(settings.tone);
    if (settings.base_prompt) setBasePrompt(settings.base_prompt);
    if (typeof settings.is_active === "boolean") setActive(settings.is_active);
  }

  const saveSettings = async () => {
    if (!user) return;
    setSavingS(true);
    const payload = { owner_id: user.id, tone, base_prompt: basePrompt, is_active: active };
    const existing = settings?.id;
    const { error } = existing
      ? await supabase.from("crm_ai_settings").update(payload).eq("id", existing)
      : await supabase.from("crm_ai_settings").insert(payload);
    setSavingS(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["ai-settings"] });
    toast.success("Configurações salvas");
  };

  const runNext = async () => {
    if (!nextCtx.trim()) return toast.error("Descreva o contexto");
    setLoadingNext(true);
    try {
      const ctx = `${basePrompt ? basePrompt + "\n\n" : ""}Tom: ${tone}\nContexto: ${nextCtx}`;
      const out = await callAI("next", ctx);
      setNextOut(out);
    } catch (e: any) { toast.error(e.message ?? "Falha ao chamar a IA"); }
    finally { setLoadingNext(false); }
  };

  const runMsg = async () => {
    if (!msgCtx.trim()) return toast.error("Descreva o contexto");
    setLoadingMsg(true);
    try {
      const ctx = `${basePrompt ? basePrompt + "\n\n" : ""}Tom: ${tone}\nObjetivo: ${msgCtx}`;
      const out = await callAI("message", ctx);
      setMsgOut(out);
    } catch (e: any) { toast.error(e.message ?? "Falha ao chamar a IA"); }
    finally { setLoadingMsg(false); }
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Inteligência" title="IA" description="Sugestões de próximos passos e mensagens prontas para enviar." />

        <section className="glass-card rounded-3xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Configuração</div>
              <h3 className="mt-1 text-base font-bold">Tom e prompt base</h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[oklch(0.72_0.205_38)]" />
              Ativa
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tom</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="profissional">Profissional</option>
                <option value="amigavel">Amigável</option>
                <option value="consultivo">Consultivo</option>
                <option value="direto">Direto</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Prompt base (contexto da empresa)</label>
              <textarea value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex.: Empresa de manutenção predial em São Paulo, atendimento 24h, preço médio R$ 800…" />
            </div>
          </div>
          <div className="mt-3">
            <button onClick={saveSettings} disabled={savingS} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
              {savingS ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Salvar
            </button>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Próximos passos</div>
              <h3 className="mt-1 text-base font-bold flex items-center gap-1.5"><Wand2 className="h-4 w-4 text-primary" /> Sugerir ações</h3>
            </div>
            <textarea value={nextCtx} onChange={(e) => setNextCtx(e.target.value)} rows={4} placeholder="Descreva o lead/situação. Ex.: Cliente João, recebeu orçamento há 4 dias, sem resposta…" className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={runNext} disabled={loadingNext} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
              {loadingNext ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Gerar sugestões
            </button>
            {nextOut && <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed">{nextOut}</pre>}
          </section>

          <section className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Mensagens</div>
                <h3 className="mt-1 text-base font-bold flex items-center gap-1.5"><MessageSquareText className="h-4 w-4 text-primary" /> Sugerir mensagem</h3>
              </div>
              {msgOut && <button onClick={runMsg} className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-bold"><RefreshCw className="inline h-3 w-3" /> Refazer</button>}
            </div>
            <textarea value={msgCtx} onChange={(e) => setMsgCtx(e.target.value)} rows={4} placeholder="Qual o objetivo da mensagem? Ex.: Reativar lead frio que sumiu há 30 dias." className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={runMsg} disabled={loadingMsg} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
              {loadingMsg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Gerar mensagens
            </button>
            {msgOut && <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed">{msgOut}</pre>}
          </section>
        </div>
      </div>
    </CRMLayout>
  );
}

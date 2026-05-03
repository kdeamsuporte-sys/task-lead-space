import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { usePipeline } from "@/hooks/use-crm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { initials, STAGE_LABEL } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { MessageCircle, Search, Send, Phone, Sparkles, Pause, UserCog, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conversas")({
  head: () => ({ meta: [{ title: "Conversas — ALTUM Portal" }] }),
  component: Page,
});

const filters = ["Todas", "Aberta", "Pendente", "Resolvida", "Arquivada"];

function timeAgo(d?: string | null) {
  if (!d) return "";
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24); return `${dd}d`;
}

function useTimeline(contactId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["timeline", user?.id, contactId],
    enabled: !!user && !!contactId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contact_timeline")
        .select("*")
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: contacts = [], isLoading } = usePipeline();
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    let l = [...contacts];
    if (search.trim()) {
      const s = search.toLowerCase();
      l = l.filter((c) => c.name.toLowerCase().includes(s) || (c.phone ?? "").includes(s));
    }
    if (filter === "Aberta") l = l.filter((c) => !["servico_realizado", "pos_venda", "perdido"].includes(c.stage));
    if (filter === "Pendente") l = l.filter((c) => !c.next_step);
    if (filter === "Resolvida") l = l.filter((c) => ["servico_realizado", "pos_venda"].includes(c.stage));
    if (filter === "Arquivada") l = l.filter((c) => c.stage === "perdido");
    return l;
  }, [contacts, filter, search]);

  const current = useMemo(() => contacts.find((c) => c.id === selected) ?? null, [contacts, selected]);
  const { data: timeline = [] } = useTimeline(selected);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999 }); }, [timeline.length, selected]);

  const sendMsg = useMutation({
    mutationFn: async () => {
      if (!user || !current || !msg.trim()) return;
      const { error } = await supabase.from("crm_contact_timeline").insert({
        owner_id: user.id, contact_id: current.id, event_type: "mensagem_enviada",
        description: msg.trim(), metadata: { channel: "whatsapp", direction: "out" },
      });
      if (error) throw error;
      await supabase.from("crm_contacts").update({ last_contact_at: new Date().toISOString() }).eq("id", current.id);
    },
    onSuccess: () => { setMsg(""); qc.invalidateQueries({ queryKey: ["timeline"] }); qc.invalidateQueries({ queryKey: ["pipeline"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const openWa = () => {
    if (!current) return;
    const link = whatsappLink(current.phone, msg || `Olá ${current.name.split(" ")[0]}`);
    if (!link) return toast.error("Sem telefone válido");
    window.open(link, "_blank");
  };

  const resolve = useMutation({
    mutationFn: async () => {
      if (!current) return;
      const { error } = await supabase.from("crm_contacts").update({ stage: "servico_realizado" }).eq("id", current.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); toast.success("Conversa resolvida"); },
  });

  return (
    <CRMLayout>
      <div className="space-y-4">
        <CRMPageHeader eyebrow="Atendimento" title="Conversas" description="Inbox unificado de WhatsApp e canais conectados." />
        <CRMFilterChips options={filters} value={filter} onChange={setFilter} />

        <div className="grid gap-3 lg:grid-cols-[340px_1fr]">
          {/* List — hide on mobile when a conversation is open */}
          <aside className={cn(
            "glass rounded-2xl p-3 max-h-[72vh] overflow-y-auto scroll-x-soft",
            current ? "hidden lg:block" : "block"
          )}>
            <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 mb-3">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone…" className="flex-1 bg-transparent text-xs outline-none" />
            </div>
            {isLoading ? (
              <div className="text-xs text-muted-foreground p-4">Carregando…</div>
            ) : list.length === 0 ? (
              <CRMEmptyState icon={MessageCircle} title="Nenhuma conversa" description="Conecte um canal ou crie um contato." />
            ) : (
              <div className="space-y-1.5">
                {list.map((c) => {
                  const active = selected === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelected(c.id)} className={cn(
                      "w-full text-left rounded-xl p-2.5 transition flex gap-2.5",
                      active ? "bg-primary/12 ring-1 ring-primary/30 glow-soft" : "hover:bg-card/60"
                    )}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-[11px] font-black text-primary">{initials(c.name)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-[12.5px] font-bold">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{timeAgo(c.last_contact_at ?? c.updated_at)}</div>
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">{c.phone || c.email || "sem contato"}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <CRMStatusBadge tone={c.temperature === "quente" ? "primary" : c.temperature === "morno" ? "warning" : "neutral"}>{c.temperature}</CRMStatusBadge>
                          <CRMStatusBadge tone="info">{STAGE_LABEL[c.stage]}</CRMStatusBadge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Chat */}
          <section className={cn(
            "glass rounded-2xl flex flex-col min-h-[60vh] lg:min-h-[72vh]",
            !current ? "hidden lg:flex" : "flex"
          )}>
            {!current ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="mx-auto h-12 w-12 rounded-2xl glass-strong flex items-center justify-center glow-soft mb-3"><MessageCircle className="h-5 w-5 text-primary" /></div>
                  <div className="font-bold">Selecione uma conversa</div>
                  <div className="text-xs text-muted-foreground mt-1">Escolha um contato na lista para abrir o atendimento.</div>
                </div>
              </div>
            ) : (
              <>
                <header className="flex flex-wrap items-center gap-2 border-b border-border-soft p-3">
                  <button onClick={() => setSelected(null)} className="lg:hidden h-8 w-8 grid place-items-center rounded-full glass" title="Voltar">‹</button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-[11px] font-black text-primary">{initials(current.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold">{current.name}</h3>
                      <span className="hidden sm:flex items-center gap-1.5">
                        <CRMStatusBadge tone="success">WhatsApp</CRMStatusBadge>
                        <CRMStatusBadge tone="info">{STAGE_LABEL[current.stage]}</CRMStatusBadge>
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{current.phone || "sem telefone"} · {current.service || "sem serviço"}</div>
                  </div>
                  <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto sm:overflow-visible">
                    <button onClick={openWa} className="shrink-0 inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success ring-1 ring-success/30"><Phone className="h-3 w-3" /> <span className="hidden sm:inline">WhatsApp</span></button>
                    <button className="shrink-0 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-bold"><Pause className="h-3 w-3" /> <span className="hidden sm:inline">Pausar IA</span></button>
                    <button className="shrink-0 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-bold"><UserCog className="h-3 w-3" /> <span className="hidden sm:inline">Assumir</span></button>
                    <button onClick={() => resolve.mutate()} className="shrink-0 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-bold text-success"><CheckCircle2 className="h-3 w-3" /> <span className="hidden sm:inline">Resolver</span></button>
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  {timeline.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-12">Nenhuma mensagem ainda. Envie a primeira para iniciar a conversa.</div>
                  ) : timeline.map((t: any) => {
                    const out = t.metadata?.direction === "out" || t.event_type === "mensagem_enviada";
                    return (
                      <div key={t.id} className={cn("flex", out ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug",
                          out ? "bg-primary/15 text-foreground ring-1 ring-primary/30" : "glass"
                        )}>
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {timeAgo(t.created_at)} · {t.event_type.replace(/_/g, " ")}
                          </div>
                          <div>{t.description || "—"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); sendMsg.mutate(); }} className="border-t border-border-soft p-2 flex items-center gap-2">
                  <button type="button" title="Sugestão IA" className="h-9 w-9 grid place-items-center rounded-full glass text-primary"><Sparkles className="h-4 w-4" /></button>
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Digite a mensagem" className="flex-1 min-w-0 rounded-full glass px-3 py-2 text-sm outline-none" />
                  <button type="submit" disabled={!msg.trim() || sendMsg.isPending} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2 text-xs font-bold text-primary-foreground glow-primary disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
                    <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Enviar</span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </CRMLayout>
  );
}

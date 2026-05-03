import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { ContactPanel } from "@/components/workspace/ContactPanel";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { FollowupDialog } from "@/components/crm/FollowupDialog";
import { MoveStageDialog } from "@/components/crm/MoveStageDialog";
import { usePipeline } from "@/hooks/use-crm";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, STAGE_LABEL } from "@/lib/format";
import { MessageCircle, RotateCcw, ArrowRight, Flame, Clock, AlertTriangle, Search, Tag, MapPin, ChevronRight, Plus, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Inbox Comercial — ALTUM CRM" }, { name: "description", content: "Fila de atendimento comercial." }] }),
  component: InboxPage,
});

const filters = ["Todos", "Novos", "Quentes", "Sem orçamento", "Sem proximo passo"];

function daysSince(date?: string | null): number {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function InboxPage() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [followupOpen, setFollowupOpen] = useState<{ open: boolean; contactId: string | null }>({ open: false, contactId: null });
  const [moveOpen, setMoveOpen] = useState<{ open: boolean; contact: any }>({ open: false, contact: null });

  const { data: contacts = [], isLoading } = usePipeline();

  const filtered = useMemo(() => {
    let list = contacts.filter((c) => c.stage !== "servico_realizado" && c.stage !== "pos_venda" && c.stage !== "perdido");
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || (c.phone ?? "").includes(s) || (c.service ?? "").toLowerCase().includes(s));
    }
    if (filter === "Novos") list = list.filter((c) => c.stage === "novo_lead");
    if (filter === "Quentes") list = list.filter((c) => c.temperature === "quente");
    if (filter === "Sem orçamento") list = list.filter((c) => c.stage === "novo_lead" || c.stage === "aguardando_info");
    if (filter === "Sem proximo passo") list = list.filter((c) => !c.next_step);
    return list;
  }, [contacts, filter, search]);

  return (
    <CRMLayout>
      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <CRMPageHeader
            eyebrow="Inbox comercial"
            title="Fila de atendimento"
            description="Quem precisa ser atendido agora? Filtre, busque e tome ação direto daqui."
            actions={
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="flex flex-1 sm:flex-none items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar…" className="w-full sm:w-48 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
                </div>
                <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Plus className="h-3.5 w-3.5" /> Novo
                </button>
              </div>
            }
          />

          <CRMFilterChips options={filters} value={filter} onChange={setFilter} />

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Carregando…</div>
          ) : filtered.length === 0 ? (
            <CRMEmptyState icon={Inbox} title="Inbox vazia" description="Nenhum lead nesta categoria. Crie um contato para começar." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((l) => {
                const tone = l.temperature === "quente" ? "primary" : l.temperature === "morno" ? "warning" : "neutral";
                const days = daysSince(l.last_contact_at ?? l.updated_at);
                const urgent = days >= 3;
                const onWa = () => {
                  const link = whatsappLink(l.phone, `Olá ${l.name.split(" ")[0]}, tudo bem?`);
                  if (!link) return toast.error("Sem telefone válido");
                  window.open(link, "_blank");
                };
                return (
                  <article key={l.id} onClick={() => setSelected(l.id)} className={`glass-card ring-premium group relative cursor-pointer rounded-2xl p-3 sm:p-4 transition hover:-translate-y-0.5 hover:border-primary/40 ${selected === l.id ? "border-primary/60 ring-2 ring-primary/30" : ""}`}>
                    {urgent && (
                      <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive shadow-sm">
                        <AlertTriangle className="h-2.5 w-2.5" /> {days}d sem contato
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black text-primary ring-1 ring-primary/30">
                        {initials(l.name)}
                        {l.temperature === "quente" && (
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground"><Flame className="h-2.5 w-2.5" /></span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold leading-tight">{l.name}</h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          {l.service && <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {l.service}</span>}
                          {l.source && <><span>·</span><span>{l.source}</span></>}
                          {l.neighborhood && <><span>·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {l.neighborhood}</span></>}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <CRMStatusBadge tone="info">{STAGE_LABEL[l.stage]}</CRMStatusBadge>
                          <CRMStatusBadge tone={tone}>{l.temperature}</CRMStatusBadge>
                          <CRMStatusBadge tone={days === 0 ? "success" : days >= 3 ? "danger" : "warning"} icon={Clock}>
                            {days === 0 ? "Hoje" : `${days}d`}
                          </CRMStatusBadge>
                        </div>
                      </div>
                    </div>

                    {l.next_step && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary"><ChevronRight className="h-3.5 w-3.5" /></div>
                        <div className="text-xs"><span className="font-bold text-primary">Próxima ação:</span><span className="ml-1 text-foreground/85">{l.next_step}</span></div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={onWa} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 hover:bg-success/25 min-h-[40px]">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </button>
                      <button onClick={() => setFollowupOpen({ open: true, contactId: l.id })} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold hover:bg-background min-h-[40px]">
                        <RotateCcw className="h-3.5 w-3.5" /> Retorno
                      </button>
                      <button onClick={() => setMoveOpen({ open: true, contact: l })} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold hover:bg-background min-h-[40px]">
                        <ArrowRight className="h-3.5 w-3.5" /> Etapa
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <ContactPanel contactId={selected} onDeleted={() => setSelected(null)} />
      </div>
      <ContactFormDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={(id) => setSelected(id)} />
      <FollowupDialog open={followupOpen.open} onOpenChange={(v) => setFollowupOpen({ open: v, contactId: null })} defaultContactId={followupOpen.contactId} />
      <MoveStageDialog open={moveOpen.open} onOpenChange={(v) => setMoveOpen({ open: v, contact: null })} contact={moveOpen.contact} />
    </CRMLayout>
  );
}

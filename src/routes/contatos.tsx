import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { ContactPanel } from "@/components/workspace/ContactPanel";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { useContacts, type Contact } from "@/hooks/use-contacts";
import { useAuth } from "@/lib/auth-context";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Search, MessageCircle, Flame, Plus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/contatos")({
  head: () => ({ meta: [{ title: "Contatos — ALTUM CRM" }] }),
  component: ContatosPage,
});

const STAGE_LABEL: Record<string, string> = {
  novo_lead: "Novo lead", aguardando_info: "Aguardando info", orcamento_enviado: "Orçamento enviado",
  followup: "Follow-up", agendado: "Agendado", servico_realizado: "Realizado", pos_venda: "Pós-venda", perdido: "Perdido",
};

const chips = ["Todos", "Quentes", "Sem próximo passo", "WhatsApp", "Orçamento enviado", "Agendados", "Perdidos"];

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

function applyChip(list: Contact[], chip: string): Contact[] {
  switch (chip) {
    case "Quentes": return list.filter(c => c.temperature === "quente");
    case "Sem próximo passo": return list.filter(c => !c.next_step);
    case "WhatsApp": return list.filter(c => (c.source ?? "").toLowerCase().includes("whats"));
    case "Orçamento enviado": return list.filter(c => c.stage === "orcamento_enviado");
    case "Agendados": return list.filter(c => c.stage === "agendado");
    case "Perdidos": return list.filter(c => c.stage === "perdido");
    default: return list;
  }
}

function ContatosPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("Todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const { data: contacts = [], isLoading } = useContacts(search);
  const filtered = applyChip(contacts, chip);

  useEffect(() => {
    if (!selected && filtered.length > 0) setSelected(filtered[0].id);
  }, [filtered, selected]);

  const onWhatsApp = (c: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = whatsappLink(c.phone, `Olá ${c.name.split(" ")[0]}, tudo bem?`);
    if (!link) { toast.error("Este contato não possui telefone válido."); return; }
    window.open(link, "_blank");
  };

  return (
    <CRMLayout>
      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <CRMPageHeader
            eyebrow="Base comercial"
            title="Contatos"
            description="Lista real, busca e ficha 360º conectada ao banco."
            actions={
              <>
                <div className="flex w-full sm:w-auto items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome, telefone, e-mail, empresa…"
                    className="w-full sm:w-56 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.205_38_/_0.7)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Plus className="h-3.5 w-3.5" /> Novo contato
                </button>
              </>
            }
          />

          <CRMFilterChips options={chips} value={chip} onChange={setChip} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="text-sm font-bold">Nenhum contato {search || chip !== "Todos" ? "para esses filtros" : "ainda"}.</div>
              <div className="mt-1 text-xs text-muted-foreground">Crie seu primeiro contato para começar.</div>
              <button onClick={() => setCreateOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <Plus className="h-3.5 w-3.5" /> Novo contato
              </button>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="glass-card hidden overflow-hidden rounded-2xl md:block">
                <table className="w-full text-sm">
                  <thead className="border-b border-border-soft bg-background/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Contato</th>
                      <th className="px-4 py-3">Serviço</th>
                      <th className="px-4 py-3">Etapa</th>
                      <th className="px-4 py-3">Próximo passo</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} onClick={() => setSelected(c.id)} className={`group cursor-pointer border-b border-border-soft transition hover:bg-card/60 ${selected === c.id ? "bg-primary/5" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-[11px] font-black text-primary ring-1 ring-primary/30">
                              {initials(c.name)}
                              {c.temperature === "quente" && <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card bg-primary"><Flame className="h-2 w-2 text-primary-foreground" /></span>}
                            </div>
                            <div>
                              <div className="font-bold leading-tight">{c.name}</div>
                              <div className="text-[10px] text-muted-foreground">{c.phone ?? "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground/85">{c.service ?? "—"}</td>
                        <td className="px-4 py-3"><CRMStatusBadge tone="info">{STAGE_LABEL[c.stage]}</CRMStatusBadge></td>
                        <td className="px-4 py-3 text-foreground/80">{c.next_step ?? <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-4 py-3 font-bold tabular-nums">{c.potential_value != null ? Number(c.potential_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={(e) => onWhatsApp(c, e)} className="flex items-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30">
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-2 md:hidden">
                {filtered.map((c) => (
                  <article key={c.id} className="glass-card rounded-2xl p-3" onClick={() => setSelected(c.id)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black text-primary ring-1 ring-primary/30">{initials(c.name)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold leading-tight">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.service ?? "—"} · {STAGE_LABEL[c.stage]}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={(e) => onWhatsApp(c, e)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[44px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
        <ContactPanel contactId={selected} onDeleted={() => setSelected(null)} />
      </div>
      <ContactFormDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={(id) => setSelected(id)} />
    </CRMLayout>
  );
}

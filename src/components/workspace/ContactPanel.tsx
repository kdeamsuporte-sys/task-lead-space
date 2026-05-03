import { useState } from "react";
import { MessageCircle, Calendar, RotateCcw, Pencil, Sparkles, Flame, MapPin, Wallet, User, Phone, Mail, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useContact, useNotes, useTimeline, useAddNote, useDeleteContact } from "@/hooks/use-contacts";
import { whatsappLink } from "@/lib/whatsapp";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const STAGE_LABEL: Record<string, string> = {
  novo_lead: "Novo lead", aguardando_info: "Aguardando info", orcamento_enviado: "Orçamento enviado",
  followup: "Follow-up", agendado: "Agendado", servico_realizado: "Serviço realizado",
  pos_venda: "Pós-venda", perdido: "Perdido",
};

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }
  catch { return s; }
}

function fmtMoney(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ContactPanel({ contactId, onDeleted }: { contactId: string | null; onDeleted?: () => void }) {
  const { data: contact, isLoading } = useContact(contactId);
  const { data: notes = [] } = useNotes(contactId);
  const { data: timeline = [] } = useTimeline(contactId);
  const addNote = useAddNote();
  const del = useDeleteContact();
  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  if (!contactId) {
    return (
      <aside className="hidden w-[400px] shrink-0 xl:block">
        <div className="glass-elevated sticky top-4 max-h-[calc(100vh-2rem)] rounded-[28px] p-8 text-center text-sm text-muted-foreground">
          Selecione um contato para ver a ficha 360º.
        </div>
      </aside>
    );
  }

  if (isLoading || !contact) {
    return (
      <aside className="hidden w-[400px] shrink-0 xl:block">
        <div className="glass-elevated sticky top-4 max-h-[calc(100vh-2rem)] rounded-[28px] p-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </aside>
    );
  }

  const waLink = whatsappLink(contact.phone, `Olá ${contact.name.split(" ")[0]}, tudo bem?`);

  const onWhatsApp = () => {
    if (!waLink) {
      toast.error("Este contato não possui telefone válido.");
      return;
    }
    window.open(waLink, "_blank");
  };

  const onAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addNote.mutateAsync({ contactId: contact.id, body: noteText.trim() });
      setNoteText("");
      toast.success("Nota adicionada");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar nota");
    }
  };

  const onDelete = async () => {
    try {
      await del.mutateAsync(contact.id);
      toast.success("Contato excluído");
      onDeleted?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao excluir");
    }
  };

  const inner = (
    <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-primary">Ficha 360º</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditOpen(true)} title="Editar" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button title="Excluir" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá {contact.name} e todo o histórico associado. Não é possível desfazer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Identity */}
        <div className="mt-5 flex items-start gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-primary/5 text-lg font-black text-primary ring-1 ring-primary/35 shadow-[0_12px_30px_-12px_oklch(0.72_0.205_38_/_0.6)]">
            {initials(contact.name)}
            {contact.temperature === "quente" && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary">
                <Flame className="h-2.5 w-2.5 text-primary-foreground" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-black leading-tight">{contact.name}</div>
            {contact.phone && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Phone className="h-3 w-3" /> {contact.phone}
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Mail className="h-3 w-3" /> {contact.email}
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {contact.temperature === "quente" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <Flame className="h-2.5 w-2.5" /> Quente
                </span>
              )}
              <span className="rounded-full border border-border-soft bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80">Etapa: {STAGE_LABEL[contact.stage]}</span>
              {contact.source && (
                <span className="rounded-full border border-border-soft bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80">{contact.source}</span>
              )}
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onWhatsApp}
            className="col-span-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground shadow-[0_14px_36px_-12px_oklch(0.72_0.205_38_/_0.7)] transition hover:brightness-110"
            style={{ background: "var(--gradient-primary)" }}
          >
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </button>
          <button onClick={() => setEditOpen(true)} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/70 py-2.5 text-xs font-bold hover:border-primary/30 hover:bg-card">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button disabled className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/40 py-2.5 text-xs font-bold text-muted-foreground" title="Em breve">
            <Calendar className="h-3.5 w-3.5" /> Agendar
          </button>
          <button disabled className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/40 py-2.5 text-xs font-bold text-muted-foreground" title="Em breve">
            <RotateCcw className="h-3.5 w-3.5" /> Retorno
          </button>
          <button onClick={() => document.getElementById("note-input")?.focus()} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/70 py-2.5 text-xs font-bold hover:border-primary/30 hover:bg-card">
            <Pencil className="h-3.5 w-3.5" /> Nota
          </button>
        </div>

        <Block title="Resumo comercial">
          <Row icon={User} label="Serviço" value={contact.service ?? "—"} />
          <Row icon={MapPin} label="Bairro" value={[contact.neighborhood, contact.city].filter(Boolean).join(" · ") || "—"} />
          <Row icon={Wallet} label="Potencial" value={fmtMoney(contact.potential_value as any)} accent />
          <Row icon={Calendar} label="Próximo passo" value={contact.next_step ?? "—"} />
        </Block>

        <Block title="Timeline">
          {timeline.length === 0 ? (
            <div className="rounded-xl border border-border-soft bg-card/40 p-3 text-xs text-muted-foreground">Nenhum evento registrado.</div>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-border-soft pl-4">
              {timeline.map((e, i) => (
                <li key={e.id} className="relative">
                  <span className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full ring-4 ring-background ${i === 0 ? "bg-primary shadow-[0_0_0_3px_oklch(0.72_0.205_38_/_0.25)]" : "bg-muted-foreground/30"}`} />
                  <div className="text-xs font-semibold">{e.description ?? e.event_type}</div>
                  <div className="text-[10px] text-muted-foreground">{fmtDate(e.created_at)}</div>
                </li>
              ))}
            </ol>
          )}
        </Block>

        <Block title="Notas internas">
          <div className="space-y-2">
            <textarea
              id="note-input"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Adicionar nota…"
              className="w-full rounded-2xl border border-border-soft bg-card/60 p-3 text-xs leading-relaxed text-foreground/85 outline-none focus:border-primary"
              rows={2}
            />
            <button
              onClick={onAddNote}
              disabled={addNote.isPending || !noteText.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-[11px] font-bold text-primary ring-1 ring-primary/30 disabled:opacity-50"
            >
              {addNote.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Adicionar nota
            </button>
            {notes.length > 0 && (
              <ul className="space-y-1.5 pt-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl border border-border-soft bg-card/40 p-2.5">
                    <div className="text-xs leading-relaxed text-foreground/85">{n.body}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{fmtDate(n.created_at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Block>
      <ContactFormDialog open={editOpen} onOpenChange={setEditOpen} contact={contact} />
    </>
  );

  return (
    <>
      <aside className="hidden w-[400px] shrink-0 xl:block">
        <div className="glass-elevated sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[28px] p-5">
          {inner}
        </div>
      </aside>
      <Sheet open={!!contactId} onOpenChange={(v) => { if (!v) onDeleted?.(); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-5 xl:hidden">
          {inner}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Block({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
        {action && <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground">{action}</button>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border-soft bg-card/60 px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`text-xs font-bold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

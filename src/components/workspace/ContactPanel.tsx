import { MessageCircle, FileText, Calendar, RotateCcw, StickyNote, Download, Pencil, Sparkles, ChevronRight, Flame, MapPin, Wallet, User, Phone, Mail, Bookmark } from "lucide-react";
import { leads } from "./data";

export function ContactPanel({ leadId }: { leadId: string }) {
  const lead = leads.find((l) => l.id === leadId) ?? leads[0];

  return (
    <aside className="hidden w-[400px] shrink-0 xl:block">
      <div className="glass-elevated sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[28px] p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-primary">Ficha 360º</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground">
              <Bookmark className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="mt-5 flex items-start gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-primary/5 text-lg font-black text-primary ring-1 ring-primary/35 shadow-[0_12px_30px_-12px_oklch(0.72_0.205_38_/_0.6)]">
            {lead.initials}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary">
              <Flame className="h-2.5 w-2.5 text-primary-foreground" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-black leading-tight">{lead.name}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3" /> +55 31 9 8765-4321
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3" /> {lead.name.toLowerCase().replace(" ", ".")}@email.com
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                <Flame className="h-2.5 w-2.5" /> Quente
              </span>
              <span className="rounded-full border border-border-soft bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80">Etapa: Orçamento</span>
              <span className="rounded-full border border-border-soft bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80">{lead.origin}</span>
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="col-span-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground shadow-[0_14px_36px_-12px_oklch(0.72_0.205_38_/_0.7)] transition hover:brightness-110"
            style={{ background: "var(--gradient-primary)" }}
          >
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/70 py-2.5 text-xs font-bold hover:border-primary/30 hover:bg-card">
            <FileText className="h-3.5 w-3.5" /> Orçamento
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/70 py-2.5 text-xs font-bold hover:border-primary/30 hover:bg-card">
            <Calendar className="h-3.5 w-3.5" /> Agendar
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/70 py-2.5 text-xs font-bold hover:border-primary/30 hover:bg-card">
            <RotateCcw className="h-3.5 w-3.5" /> Retorno
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/70 py-2.5 text-xs font-bold hover:border-primary/30 hover:bg-card">
            <StickyNote className="h-3.5 w-3.5" /> Nota
          </button>
        </div>

        <Block title="Resumo comercial">
          <Row icon={User} label="Serviço" value={lead.service} />
          <Row icon={MapPin} label="Bairro" value={`${lead.district} · BH`} />
          <Row icon={Wallet} label="Potencial" value={lead.estimate} accent />
          <Row icon={Calendar} label="Melhor dia" value="Sábado · manhã" />
        </Block>

        <Block title="Próximo passo">
          <div className="relative flex items-start justify-between gap-3 overflow-hidden rounded-2xl border border-primary/30 bg-primary/8 p-3">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">prioridade alta</div>
              <div className="mt-0.5 text-sm font-bold">Confirmar agendamento</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">28.03 · 14:00 · sábado</div>
            </div>
            <button className="relative rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground hover:brightness-110">
              Confirmar
            </button>
          </div>
        </Block>

        <Block title="Propostas / Documentos" action={<Download className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Orçamento.pdf", date: "Enviado · 26.03" },
              { name: "Brief inicial", date: "Atualizado · 25.03" },
            ].map((d) => (
              <div key={d.name} className="group cursor-pointer rounded-2xl border border-border-soft bg-card/60 p-2.5 transition hover:border-primary/30">
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gradient-to-b from-muted to-background ring-1 ring-border-soft">
                  <div className="h-1/3 bg-primary/10" />
                  <div className="space-y-1.5 p-2">
                    <div className="h-1 w-3/4 rounded-full bg-foreground/15" />
                    <div className="h-1 w-1/2 rounded-full bg-foreground/10" />
                    <div className="h-1 w-2/3 rounded-full bg-foreground/10" />
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-bold">{d.name}</div>
                <div className="text-[10px] text-muted-foreground">{d.date}</div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Timeline">
          <ol className="relative space-y-4 border-l-2 border-border-soft pl-4">
            {[
              { t: "Lead captado via WhatsApp", d: "26.03 · 09:12", on: true },
              { t: "Orçamento enviado", d: "26.03 · 14:30", on: true },
              { t: "Follow-up criado", d: "27.03 · 10:00" },
              { t: "Etapa: Aguardando resposta", d: "27.03 · 18:00" },
            ].map((e, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full ring-4 ring-background ${e.on ? "bg-primary shadow-[0_0_0_3px_oklch(0.72_0.205_38_/_0.25)]" : "bg-muted-foreground/30"}`} />
                <div className="text-xs font-semibold">{e.t}</div>
                <div className="text-[10px] text-muted-foreground">{e.d}</div>
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Notas internas" action={<Pencil className="h-3.5 w-3.5" />}>
          <div className="rounded-2xl border border-border-soft bg-card/60 p-3 text-xs leading-relaxed text-foreground/85">
            Cliente prefere atendimento aos sábados. Já trocou mensagens com a Júlia. Demonstrou interesse no combo sofá + tapete.
          </div>
        </Block>
      </div>
    </aside>
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

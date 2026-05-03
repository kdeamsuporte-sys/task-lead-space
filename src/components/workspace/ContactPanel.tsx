import { MessageCircle, FileText, Calendar, RotateCcw, StickyNote, Download, Pencil, Sparkles, ChevronRight, Flame, MapPin, Wallet, User } from "lucide-react";
import { leads } from "./data";

export function ContactPanel({ leadId }: { leadId: string }) {
  const lead = leads.find((l) => l.id === leadId) ?? leads[0];

  return (
    <aside className="hidden w-[380px] shrink-0 xl:block">
      <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-border bg-[oklch(0.13_0.012_250)] p-4 shadow-[0_30px_80px_-30px_oklch(0_0_0_/_0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-card/70 px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">Resumo do Cliente</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Identity */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-base font-bold text-primary ring-1 ring-primary/30">
            {lead.initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold leading-tight">{lead.name}</div>
            <div className="text-xs text-muted-foreground">+55 31 9 8765-4321 · {lead.origin}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <Flame className="h-3 w-3" /> Quente
              </span>
              <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-foreground/80">Orçamento</span>
              <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-foreground/80">3 dias</span>
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold hover:bg-card/70">
            <FileText className="h-3.5 w-3.5" /> Enviar orçamento
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold hover:bg-card/70">
            <Calendar className="h-3.5 w-3.5" /> Agendar
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold hover:bg-card/70">
            <RotateCcw className="h-3.5 w-3.5" /> Criar retorno
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold hover:bg-card/70">
            <StickyNote className="h-3.5 w-3.5" /> Nota
          </button>
        </div>

        {/* Resumo comercial */}
        <Block title="Resumo comercial">
          <Row icon={User} label="Serviço" value={lead.service} />
          <Row icon={MapPin} label="Bairro" value={`${lead.district} · BH`} />
          <Row icon={Wallet} label="Potencial" value={lead.estimate} accent />
          <Row icon={Calendar} label="Melhor dia" value="Sábado · manhã" />
        </Block>

        {/* Próximo passo */}
        <Block title="Próximo passo">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div>
              <div className="text-sm font-semibold">Confirmar agendamento</div>
              <div className="text-xs text-muted-foreground">28.03 · 14:00 · Prioridade alta</div>
            </div>
            <button className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
              Criar retorno
            </button>
          </div>
        </Block>

        {/* Documentos */}
        <Block title="Propostas / Documentos" action={<Download className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-2">
            {["Orçamento.pdf", "Brief inicial"].map((d) => (
              <div key={d} className="rounded-xl border border-border bg-card/60 p-2.5">
                <div className="aspect-[4/5] rounded-md bg-gradient-to-b from-muted to-background" />
                <div className="mt-2 text-[11px] font-medium">{d}</div>
                <div className="text-[10px] text-muted-foreground">Enviado · 26.03</div>
              </div>
            ))}
          </div>
        </Block>

        {/* Timeline */}
        <Block title="Timeline">
          <ol className="relative space-y-3 border-l border-border pl-4">
            {[
              { t: "Lead captado via WhatsApp", d: "26.03 · 09:12", on: true },
              { t: "Orçamento enviado", d: "26.03 · 14:30", on: true },
              { t: "Follow-up criado", d: "27.03 · 10:00" },
              { t: "Etapa: Aguardando resposta", d: "27.03 · 18:00" },
            ].map((e, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${e.on ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="text-xs font-medium">{e.t}</div>
                <div className="text-[10px] text-muted-foreground">{e.d}</div>
              </li>
            ))}
          </ol>
        </Block>

        {/* Notas */}
        <Block title="Notas internas" action={<Pencil className="h-3.5 w-3.5" />}>
          <div className="rounded-xl border border-border bg-card/60 p-3 text-xs text-foreground/80">
            Cliente prefere atendimento aos sábados. Já trocou mensagens com a Júlia.
          </div>
        </Block>
      </div>
    </aside>
  );
}

function Block({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        {action && <button className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">{action}</button>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`text-xs font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

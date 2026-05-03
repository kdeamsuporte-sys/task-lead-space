import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { leads } from "@/components/workspace/data";
import { MessageCircle, RotateCcw, ArrowRight, Flame, Clock, AlertTriangle, Search, Tag, MapPin, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox Comercial — ALTUM CRM" },
      { name: "description", content: "Fila de atendimento comercial: quem precisa ser atendido agora." },
    ],
  }),
  component: InboxPage,
});

const filters = ["Todos", "Novos", "Sem resposta", "Orçamentos parados", "Retornos hoje", "Atrasados", "Quentes"];

function InboxPage() {
  const [filter, setFilter] = useState("Todos");

  const filtered = leads.filter((l) => {
    if (filter === "Quentes") return l.temperature === "quente";
    if (filter === "Novos") return l.stage === "Novo lead";
    if (filter === "Sem resposta") return l.daysIdle >= 1;
    if (filter === "Atrasados") return l.daysIdle >= 3;
    if (filter === "Orçamentos parados") return l.budgetStatus === "aguardando" || l.budgetStatus === "enviado";
    return true;
  });

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Inbox comercial"
          title="Fila de atendimento"
          description="Quem precisa ser atendido agora? Cards organizados por urgência, com a próxima ação recomendada."
          actions={
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Buscar na inbox…" className="w-48 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
            </div>
          }
        />

        <CRMFilterChips options={filters} value={filter} onChange={setFilter} />

        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((l) => {
            const tone = l.temperature === "quente" ? "primary" : l.temperature === "morno" ? "warning" : "neutral";
            const urgentDays = l.daysIdle >= 3;
            return (
              <article key={l.id} className="glass-card ring-premium group relative rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-primary/40">
                {urgentDays && (
                  <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                    <AlertTriangle className="h-2.5 w-2.5" /> Atrasado
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black text-primary ring-1 ring-primary/30">
                    {l.initials}
                    {l.temperature === "quente" && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                        <Flame className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-bold leading-tight">{l.name}</h3>
                      <CRMStatusBadge tone={tone}>{l.temperature}</CRMStatusBadge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {l.service}</span>
                      <span>·</span>
                      <span>{l.origin}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {l.district}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <CRMStatusBadge tone="info">{l.stage}</CRMStatusBadge>
                      <CRMStatusBadge tone={l.daysIdle === 0 ? "success" : l.daysIdle >= 3 ? "danger" : "warning"} icon={Clock}>
                        {l.daysIdle === 0 ? "Em dia" : `${l.daysIdle} ${l.daysIdle === 1 ? "dia" : "dias"} parado`}
                      </CRMStatusBadge>
                    </div>
                  </div>
                </div>

                {l.recommended && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-primary">Próxima ação:</span>
                      <span className="ml-1 text-foreground/85">{l.recommended}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 hover:bg-success/25 min-h-[44px]">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold hover:bg-background min-h-[44px]">
                    <RotateCcw className="h-3.5 w-3.5" /> Retorno
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold hover:bg-background min-h-[44px]">
                    <ArrowRight className="h-3.5 w-3.5" /> Mover etapa
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </CRMLayout>
  );
}

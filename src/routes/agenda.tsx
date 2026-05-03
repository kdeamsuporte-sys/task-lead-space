import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMResponsiveTabs } from "@/components/crm/CRMResponsiveTabs";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { appointments } from "@/components/workspace/data";
import { MapPin, Phone, MessageCircle, Check, RotateCcw, Plus } from "lucide-react";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda Comercial — ALTUM CRM" },
      { name: "description", content: "Próximos atendimentos, retornos, visitas e compromissos." },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  const [view, setView] = useState("Hoje");

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Sua semana comercial"
          title="Agenda"
          description="Compromissos, retornos, visitas e pós-venda em uma timeline visual."
          actions={
            <button className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Novo compromisso
            </button>
          }
        />

        <CRMResponsiveTabs tabs={["Hoje", "Semana", "Mês", "Lista"]} value={view} onChange={setView} />

        {/* Vertical timeline */}
        <div className="glass-card rounded-3xl p-3 sm:p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary/80">28 de Março · Sexta-feira</div>
              <div className="mt-1 text-base sm:text-lg font-bold">{appointments.length} compromissos</div>
            </div>
            <div className="text-[11px] text-muted-foreground"><span className="font-bold text-foreground">2</span> atrasados · <span className="font-bold text-foreground">3</span> confirmados</div>
          </div>

          <ol className="relative space-y-3 sm:space-y-4 border-l-2 border-border-soft pl-5 sm:pl-6">
            {appointments.map((a) => {
              const tone = a.status === "atrasado" ? "danger" : a.status === "pendente" ? "warning" : "success";
              return (
                <li key={a.id} className="relative">
                  <span className={`absolute -left-[26px] sm:-left-[31px] top-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full ring-4 ring-background ${
                    a.status === "atrasado" ? "bg-destructive" : a.status === "pendente" ? "bg-warning" : "bg-success"
                  } shadow-[0_0_0_3px_oklch(0.72_0.205_38_/_0.15)]`} />

                  <div className="glass-card ring-premium group rounded-2xl p-3 sm:p-4 transition hover:-translate-y-0.5 hover:border-primary/40">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="font-mono text-foreground">{a.time}</span>
                          <span>·</span>
                          <CRMStatusBadge tone="info" size="xs">{a.type}</CRMStatusBadge>
                          <CRMStatusBadge tone={tone} size="xs">{a.status}</CRMStatusBadge>
                        </div>
                        <div className="mt-1.5 text-sm sm:text-base font-bold">{a.client}</div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground">{a.service}</div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {a.district}
                        </div>
                      </div>
                      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <button className="flex flex-1 sm:flex-none min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[44px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                        <button className="flex flex-1 sm:flex-none min-w-[120px] items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[44px]"><Check className="h-3.5 w-3.5" /> Confirmar</button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/60"><RotateCcw className="h-3.5 w-3.5" /></button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/60"><Phone className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </CRMLayout>
  );
}

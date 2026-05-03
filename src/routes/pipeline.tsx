import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { leads, pipelineStages, pipelineMap } from "@/components/workspace/data";
import { MessageCircle, MoreHorizontal, Flame, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — ALTUM CRM" },
      { name: "description", content: "Visão Kanban do pipeline comercial." },
    ],
  }),
  component: PipelinePage,
});

const toneMap: Record<string, string> = {
  primary: "border-primary/40 bg-primary/12 text-primary",
  warning: "border-warning/30 bg-warning/12 text-warning",
  info: "border-border bg-card/70 text-foreground/85",
  success: "border-success/30 bg-success/12 text-success",
  danger: "border-destructive/30 bg-destructive/12 text-destructive",
};

function PipelinePage() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Funil comercial"
          title="Pipeline"
          description="Acompanhe seus negócios por etapa. Arraste cards entre colunas para mover etapas."
        />

        <div className="scroll-x-soft -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0">
          {pipelineStages.map((stage) => {
            const stageLeads = (pipelineMap[stage.id] ?? []).map((id) => leads.find((l) => l.id === id)!).filter(Boolean);
            const total = stageLeads.reduce((s, l) => s + l.estimateValue, 0);
            return (
              <div key={stage.id} className="w-[300px] shrink-0">
                <div className="glass-card ring-premium rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", toneMap[stage.tone])}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {stage.label}
                      </span>
                    </div>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-[11px] text-muted-foreground">
                    <span><span className="font-bold text-foreground">{stageLeads.length}</span> {stageLeads.length === 1 ? "negócio" : "negócios"}</span>
                    <span className="font-bold tabular-nums text-foreground">R$ {total.toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {stageLeads.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border-soft bg-card/30 p-6 text-center text-[11px] text-muted-foreground">
                      Nenhum negócio aqui
                    </div>
                  )}
                  {stageLeads.map((l) => (
                    <article key={l.id} className="glass-card ring-premium group cursor-grab rounded-2xl p-3 transition hover:-translate-y-0.5 hover:border-primary/40 active:cursor-grabbing">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-[11px] font-black text-primary ring-1 ring-primary/30">
                            {l.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold">{l.name}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{l.service}</div>
                          </div>
                        </div>
                        <button className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-[10px] text-muted-foreground">{l.origin}</div>
                        <div className="text-xs font-black tabular-nums text-foreground">{l.estimate}</div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {l.temperature === "quente" && <CRMStatusBadge tone="primary" icon={Flame} size="xs">Quente</CRMStatusBadge>}
                        {l.temperature === "morno" && <CRMStatusBadge tone="warning" size="xs">Morno</CRMStatusBadge>}
                        {l.temperature === "frio" && <CRMStatusBadge tone="neutral" size="xs">Frio</CRMStatusBadge>}
                        <CRMStatusBadge tone={l.daysIdle >= 3 ? "danger" : "info"} icon={Clock} size="xs">
                          {l.daysIdle === 0 ? "Hoje" : `${l.daysIdle}d`}
                        </CRMStatusBadge>
                      </div>

                      <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-success/15 px-2 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30 hover:bg-success/25">
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CRMLayout>
  );
}

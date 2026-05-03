import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { automations } from "@/components/workspace/data";
import { Zap, Pencil, Plus, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/automacoes")({
  head: () => ({
    meta: [
      { title: "Automações — ALTUM CRM" },
      { name: "description", content: "O CRM trabalha por você: alertas, retornos automáticos e tarefas." },
    ],
  }),
  component: AutomacoesPage,
});

function AutomacoesPage() {
  const [items, setItems] = useState(automations);
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="O CRM trabalha por você"
          title="Automações"
          description="Gatilhos comerciais que cuidam da operação enquanto você fecha negócios."
          actions={
            <button className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Nova automação
            </button>
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          {items.map((a) => (
            <article key={a.id} className="glass-card ring-premium relative overflow-hidden rounded-2xl p-4 sm:p-5">
              <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition ${a.active ? "bg-primary/15" : "bg-muted/15"}`} />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${a.active ? "bg-primary/15 text-primary ring-primary/30" : "bg-muted/15 text-muted-foreground ring-border"}`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold leading-tight">{a.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{a.runs} execuções no mês</div>
                  </div>
                </div>
                <button
                  onClick={() => setItems((prev) => prev.map((p) => (p.id === a.id ? { ...p, active: !p.active } : p)))}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${a.active ? "bg-primary" : "bg-muted"}`}
                  aria-pressed={a.active}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-md transition-all ${a.active ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              <p className="relative mt-3 text-[11px] sm:text-xs text-foreground/80 leading-relaxed">{a.desc}</p>

              <div className="relative mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-background/40 p-2.5 sm:p-3">
                <CRMStatusBadge tone="warning" size="xs">Quando: {a.trigger}</CRMStatusBadge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <CRMStatusBadge tone="primary" size="xs">Faz: {a.action}</CRMStatusBadge>
              </div>

              <div className="relative mt-4 flex items-center justify-between">
                <CRMStatusBadge tone={a.active ? "success" : "neutral"}>{a.active ? "Ativa" : "Pausada"}</CRMStatusBadge>
                <button className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-[11px] font-bold hover:bg-background"><Pencil className="h-3 w-3" /> Editar</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}

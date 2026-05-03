import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/ia")({
  head: () => ({ meta: [{ title: "IA — ALTUM Portal" }, { name: "description", content: "Configuração da IA, guardrails e tom de voz." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Inteligência" title="IA" description="Configuração da IA, guardrails e tom de voz." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação dentro do Portal ALTUM. Os dados aparecerão aqui assim que houver registros na sua operação.
        </div>
      </div>
    </CRMLayout>
  );
}

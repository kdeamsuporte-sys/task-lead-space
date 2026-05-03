import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/captacao")({
  head: () => ({ meta: [{ title: "Captação — ALTUM Portal" }, { name: "description", content: "Formulários públicos para capturar contatos." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Crescimento" title="Captação" description="Formulários públicos para capturar contatos." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação dentro do Portal ALTUM. Os dados aparecerão aqui assim que houver registros na sua operação.
        </div>
      </div>
    </CRMLayout>
  );
}

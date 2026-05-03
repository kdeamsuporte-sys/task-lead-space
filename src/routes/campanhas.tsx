import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — ALTUM Portal" }, { name: "description", content: "Disparos segmentados via WhatsApp." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Crescimento" title="Campanhas" description="Disparos segmentados via WhatsApp." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação dentro do Portal ALTUM. Os dados aparecerão aqui assim que houver registros na sua operação.
        </div>
      </div>
    </CRMLayout>
  );
}

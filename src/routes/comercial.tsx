import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/comercial")({
  head: () => ({ meta: [{ title: "Comercial — ALTUM Portal" }, { name: "description", content: "Propostas, receita e acompanhamento financeiro." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Mesa comercial" title="Comercial" description="Propostas, receita e acompanhamento financeiro." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação dentro do Portal ALTUM. Os dados aparecerão aqui assim que houver registros na sua operação.
        </div>
      </div>
    </CRMLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/lancamento")({
  head: () => ({ meta: [{ title: "Lançamento — ALTUM Portal" }, { name: "description", content: "Checklist de go-live da operação." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Governança" title="Lançamento" description="Checklist de go-live da operação." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação. Conecte sua operação para liberar dados reais nesta área.
        </div>
      </div>
    </CRMLayout>
  );
}

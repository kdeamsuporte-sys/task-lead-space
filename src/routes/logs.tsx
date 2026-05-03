import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "Logs — ALTUM Portal" }, { name: "description", content: "Histórico de eventos e auditoria." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Governança" title="Logs" description="Histórico de eventos e auditoria." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação. Conecte sua operação para liberar dados reais nesta área.
        </div>
      </div>
    </CRMLayout>
  );
}

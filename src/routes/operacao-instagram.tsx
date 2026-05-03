import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/operacao-instagram")({
  head: () => ({ meta: [{ title: "Operação Instagram — ALTUM Portal" }, { name: "description", content: "Status do canal Instagram e mensagens." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Inteligência" title="Operação Instagram" description="Status do canal Instagram e mensagens." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação. Conecte sua operação para liberar dados reais nesta área.
        </div>
      </div>
    </CRMLayout>
  );
}

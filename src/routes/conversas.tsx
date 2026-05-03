import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export const Route = createFileRoute("/conversas")({
  head: () => ({ meta: [{ title: "Conversas — ALTUM Portal" }, { name: "description", content: "Inbox unificado de WhatsApp e canais conectados." }] }),
  component: Page,
});

function Page() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Atendimento" title="Conversas" description="Inbox unificado de WhatsApp e canais conectados." />
        <div className="glass-card rounded-2xl p-8 text-sm text-muted-foreground">
          Módulo em preparação. Conecte sua operação para liberar dados reais nesta área.
        </div>
      </div>
    </CRMLayout>
  );
}

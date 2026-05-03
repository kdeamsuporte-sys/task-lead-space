import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Workspace } from "@/components/workspace/Workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALTUM CRM — Workspace Comercial" },
      { name: "description", content: "Central de vendas, orçamentos, retornos e agendamentos." },
    ],
  }),
  component: () => (
    <CRMLayout>
      <Workspace />
    </CRMLayout>
  ),
});

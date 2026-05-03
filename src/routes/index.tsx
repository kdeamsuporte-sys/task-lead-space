import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/workspace/Workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALTUM CRM — Workspace Comercial" },
      { name: "description", content: "Central de vendas, orçamentos, retornos e agendamentos para limpeza de estofados." },
    ],
  }),
  component: Workspace,
});

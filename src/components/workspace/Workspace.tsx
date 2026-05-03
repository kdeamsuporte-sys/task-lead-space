import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, FileText, RotateCcw, MessageCircle } from "lucide-react";
import { ScheduleBar } from "./ScheduleBar";
import { KpiCards } from "./KpiCards";
import { LeadsRow } from "./LeadsRow";
import { TasksRow } from "./TasksRow";
import { ContactPanel } from "./ContactPanel";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export function Workspace() {
  const [selected] = useState<string | null>(null);
  const navigate = useNavigate();
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
        <CRMPageHeader
          eyebrow="CRM Comercial"
          title="Workspace"
          description="Sua central de leads, orçamentos, retornos e agendamentos — pensada para fechar mais negócios, com menos atrito."
          actions={
            <>
              <button onClick={() => navigate({ to: "/contatos" })} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                Ir para contatos
              </button>
            </>
          }
        />
        <ScheduleBar />
        <KpiCards />
        <LeadsRow onSelect={() => {}} />
        <TasksRow />
      </div>
      <ContactPanel contactId={selected} />
    </div>
  );
}

import { useState } from "react";
import { Plus, FileText, RotateCcw, MessageCircle } from "lucide-react";
import { ScheduleBar } from "./ScheduleBar";
import { KpiCards } from "./KpiCards";
import { LeadsRow } from "./LeadsRow";
import { TasksRow } from "./TasksRow";
import { ContactPanel } from "./ContactPanel";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";

export function Workspace() {
  const [selected, setSelected] = useState("l1");

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <CRMPageHeader
          eyebrow="CRM Comercial"
          title="Workspace"
          description="Sua central de leads, orçamentos, retornos e agendamentos — pensada para fechar mais negócios, com menos atrito."
          actions={
            <>
              <button className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:border-primary/30">
                <RotateCcw className="h-3.5 w-3.5" /> Retorno
              </button>
              <button className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:border-primary/30">
                <FileText className="h-3.5 w-3.5" /> Orçamento
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/12 px-3 py-1.5 text-xs font-bold text-success">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </button>
            </>
          }
        />
        <ScheduleBar />
        <KpiCards />
        <LeadsRow onSelect={setSelected} />
        <TasksRow />
      </div>
      <ContactPanel leadId={selected} />
    </div>
  );
}

import { useState } from "react";
import { Plus, FileText, RotateCcw, MessageCircle, Bell, Search } from "lucide-react";
import { WorkspaceSidebar } from "./Sidebar";
import { ScheduleBar } from "./ScheduleBar";
import { KpiCards } from "./KpiCards";
import { LeadsRow } from "./LeadsRow";
import { TasksRow } from "./TasksRow";
import { ContactPanel } from "./ContactPanel";
import { cn } from "@/lib/utils";

const tabs = ["Workspace", "Pipeline", "Lista", "Retornos", "Perdidos"];

export function Workspace() {
  const [tab, setTab] = useState("Workspace");
  const [selected, setSelected] = useState("l1");

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <WorkspaceSidebar />

      <main className="flex-1 px-4 py-4 md:px-6 lg:px-8">
        {/* Top header */}
        <header className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Online</span>
          </div>
          <div className="ml-1 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 md:flex">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Buscar contato, telefone, orçamento…"
              className="w-72 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-card/70 md:inline-flex">
              <RotateCcw className="h-3.5 w-3.5" /> Criar retorno
            </button>
            <button className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-card/70 md:inline-flex">
              <FileText className="h-3.5 w-3.5" /> Orçamento
            </button>
            <button className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20 md:inline-flex">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.7_0.2_38_/_0.6)] hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> Novo contato
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-400 text-xs font-bold text-primary-foreground">JV</div>
          </div>
        </header>

        <div className="mt-5 flex gap-6">
          <div className="min-w-0 flex-1 space-y-6">
            {/* Title block */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">CRM Comercial</div>
                <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                  Workspace<span className="text-primary">.</span>
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Sua central de vendas, orçamentos, retornos e agendamentos para limpeza de estofados.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                      tab === t
                        ? "bg-primary text-primary-foreground shadow-[0_4px_16px_-4px_oklch(0.7_0.2_38_/_0.6)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <ScheduleBar />
            <KpiCards />

            {tab === "Workspace" && (
              <>
                <LeadsRow onSelect={setSelected} />
                <TasksRow />
              </>
            )}

            {tab !== "Workspace" && (
              <div className="glass-card flex min-h-[280px] flex-col items-center justify-center rounded-3xl p-10 text-center">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">{tab}</div>
                <div className="mt-2 max-w-md text-sm text-muted-foreground">
                  Esta aba está pronta para receber a integração — Pipeline (Kanban), Lista (tabela), Retornos e Perdidos compartilham os mesmos componentes do Workspace.
                </div>
              </div>
            )}

            <footer className="pt-4 pb-8 text-center text-[11px] text-muted-foreground">
              ALTUM CRM · Workspace comercial · {new Date().getFullYear()}
            </footer>
          </div>

          <ContactPanel leadId={selected} />
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Plus, FileText, RotateCcw, MessageCircle, Bell, Search, Sparkles, ChevronDown } from "lucide-react";
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
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      <WorkspaceSidebar />

      <main className="relative z-10 flex-1 px-4 py-4 md:px-6 lg:px-8">
        {/* Top header */}
        <header className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-success/25 bg-success/8 px-3 py-1.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
            Online · sincronizado
          </div>
          <div className="ml-1 hidden items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 backdrop-blur-md md:flex">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Buscar contato, telefone, orçamento…"
              className="w-72 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground/80 backdrop-blur-md transition hover:border-primary/30 hover:text-foreground md:inline-flex">
              <RotateCcw className="h-3.5 w-3.5" /> Retorno
            </button>
            <button className="hidden items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground/80 backdrop-blur-md transition hover:border-primary/30 hover:text-foreground md:inline-flex">
              <FileText className="h-3.5 w-3.5" /> Orçamento
            </button>
            <button className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/12 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/20 md:inline-flex">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.205_38_/_0.7)] transition hover:brightness-110"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Novo contato
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            </button>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>JV</div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </header>

        <div className="mt-6 flex gap-6">
          <div className="min-w-0 flex-1 space-y-6">
            {/* Title block */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">CRM Comercial</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <Sparkles className="h-2.5 w-2.5" /> IA ativa
                  </span>
                </div>
                <h1 className="mt-2 text-4xl font-black tracking-tight md:text-[44px] md:leading-[1.05]">
                  Workspace<span className="text-gradient-primary">.</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Sua central operacional de leads, orçamentos, retornos e agendamentos — pensada para fechar mais negócios, com menos atrito.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur-md shadow-[0_8px_24px_-12px_oklch(0_0_0_/_0.6)]">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                      tab === t
                        ? "text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.72_0.205_38_/_0.6)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    style={tab === t ? { background: "var(--gradient-primary)" } : undefined}
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
              <div className="glass-elevated flex min-h-[280px] flex-col items-center justify-center rounded-3xl p-10 text-center">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{tab}</div>
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

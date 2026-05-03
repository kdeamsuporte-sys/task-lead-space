import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { ContactPanel } from "@/components/workspace/ContactPanel";
import { leads } from "@/components/workspace/data";
import { Search, SlidersHorizontal, MessageCircle, Phone, Flame } from "lucide-react";

export const Route = createFileRoute("/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos — ALTUM CRM" },
      { name: "description", content: "Controle completo de contatos, busca detalhada e ficha 360º." },
    ],
  }),
  component: ContatosPage,
});

const chips = ["Todos", "Quentes", "Sem próximo passo", "Atrasados", "WhatsApp", "Orçamento enviado", "Agendados", "Sem responsável"];

function ContatosPage() {
  const [chip, setChip] = useState("Todos");
  const [selected, setSelected] = useState(leads[0].id);

  return (
    <CRMLayout>
      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <CRMPageHeader
            eyebrow="Base comercial"
            title="Contatos"
            description="Busca detalhada e ficha 360º. Selecione um contato para ver tudo no painel lateral."
            actions={
              <>
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input placeholder="Nome, telefone, empresa…" className="w-56 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
                </div>
                <button className="flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
                </button>
              </>
            }
          />

          <CRMFilterChips options={chips} value={chip} onChange={setChip} />

          {/* Desktop table */}
          <div className="glass-card hidden overflow-hidden rounded-2xl md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border-soft bg-background/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Orçamento</th>
                  <th className="px-4 py-3">Próximo passo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Último toque</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                    className={`group cursor-pointer border-b border-border-soft transition hover:bg-card/60 ${selected === l.id ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-[11px] font-black text-primary ring-1 ring-primary/30">
                          {l.initials}
                          {l.temperature === "quente" && <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card bg-primary"><Flame className="h-2 w-2 text-primary-foreground" /></span>}
                        </div>
                        <div>
                          <div className="font-bold leading-tight">{l.name}</div>
                          <div className="text-[10px] text-muted-foreground">{l.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground/85">{l.service}</td>
                    <td className="px-4 py-3"><CRMStatusBadge tone="info">{l.stage}</CRMStatusBadge></td>
                    <td className="px-4 py-3"><CRMStatusBadge tone={l.budgetStatus === "aceito" ? "success" : l.budgetStatus === "aguardando" ? "warning" : "neutral"}>{l.budgetStatus ?? "—"}</CRMStatusBadge></td>
                    <td className="px-4 py-3 text-foreground/80">{l.recommended ?? <span className="text-muted-foreground">Sem próximo passo</span>}</td>
                    <td className="px-4 py-3 font-bold tabular-nums">{l.estimate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.lastTouch}</td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-1.5 text-[11px] font-bold text-success ring-1 ring-success/30">
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {leads.map((l) => (
              <article key={l.id} className="glass-card rounded-2xl p-3" onClick={() => setSelected(l.id)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black text-primary ring-1 ring-primary/30">{l.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold leading-tight">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground">{l.service} · {l.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black tabular-nums">{l.estimate}</div>
                    <div className="text-[10px] text-muted-foreground">{l.lastTouch}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[44px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                  <button className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[44px]"><Phone className="h-3.5 w-3.5" /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <ContactPanel leadId={selected} />
      </div>
    </CRMLayout>
  );
}

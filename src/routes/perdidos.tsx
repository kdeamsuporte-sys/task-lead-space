import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMFilterChips } from "@/components/crm/CRMFilterChips";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { usePipeline } from "@/hooks/use-crm";
import { useUpdateContact } from "@/hooks/use-contacts";
import { whatsappLink } from "@/lib/whatsapp";
import { initials, fmtMoney, fmtDate } from "@/lib/format";
import { XCircle, Coins, Repeat, AlertTriangle, MessageCircle, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/perdidos")({
  head: () => ({ meta: [{ title: "Perdidos — ALTUM CRM" }] }),
  component: PerdidosPage,
});

const filters = ["Todos", "Sem resposta", "Preço alto", "Fora da região", "Fechou com outro", "Sem interesse", "Outro"];

function PerdidosPage() {
  const [f, setF] = useState("Todos");
  const { data: all = [] } = usePipeline();
  const lost = useMemo(() => all.filter((c) => c.stage === "perdido"), [all]);
  const list = f === "Todos" ? lost : lost.filter((p) => p.lost_reason === f);
  const totalValue = lost.reduce((s, l) => s + (Number(l.potential_value) || 0), 0);
  const update = useUpdateContact();

  const reasonCounts: Record<string, number> = {};
  lost.forEach((l) => { const k = l.lost_reason ?? "Outro"; reasonCounts[k] = (reasonCounts[k] ?? 0) + 1; });
  const mainReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader eyebrow="Recuperação" title="Perdidos" description="Cada lead perdido carrega aprendizado." />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <CRMMetricCard icon={XCircle} label="Total perdido" value={lost.length} hint="Total" tone="danger" />
          <CRMMetricCard icon={Coins} label="Valor perdido" value={fmtMoney(totalValue)} hint="Em potencial" tone="warning" />
          <CRMMetricCard icon={AlertTriangle} label="Principal motivo" value={mainReason} hint="" tone="info" />
          <CRMMetricCard icon={Repeat} label="Recuperáveis" value={lost.filter((l) => l.lost_reason === "Sem resposta" || l.lost_reason === "Preço alto").length} hint="Vale tentar" tone="primary" />
        </div>

        <CRMFilterChips options={filters} value={f} onChange={setF} />

        {list.length === 0 ? (
          <CRMEmptyState icon={XCircle} title="Nenhum lead perdido" description="Bom trabalho!" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((l) => {
              const onWa = () => {
                const link = whatsappLink(l.phone, `Olá ${l.name.split(" ")[0]}, tudo bem?`);
                if (!link) return toast.error("Sem telefone");
                window.open(link, "_blank");
              };
              const reactivate = async () => {
                try { await update.mutateAsync({ id: l.id, stage: "novo_lead", lost_at: null, lost_reason: null }); toast.success("Reativado"); }
                catch (e:any) { toast.error(e?.message); }
              };
              return (
                <article key={l.id} className="glass-card ring-premium rounded-2xl p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 text-xs font-black text-destructive ring-1 ring-destructive/30">{initials(l.name)}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{l.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{l.service ?? "—"}</div>
                      </div>
                    </div>
                    <CRMStatusBadge tone="danger" size="xs">{l.lost_reason ?? "Outro"}</CRMStatusBadge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border-soft bg-background/40 p-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</div>
                      <div className="text-sm font-black text-destructive tabular-nums">{fmtMoney(l.potential_value)}</div>
                    </div>
                    <div className="rounded-xl border border-border-soft bg-background/40 p-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quando</div>
                      <div className="text-sm font-bold">{fmtDate(l.lost_at ?? l.updated_at)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={reactivate} className="flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground min-h-[40px]"><RefreshCcw className="h-3.5 w-3.5" /> Reativar</button>
                    <button onClick={onWa} className="flex flex-1 min-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[40px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}

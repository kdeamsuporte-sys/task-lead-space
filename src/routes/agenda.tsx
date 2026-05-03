import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMResponsiveTabs } from "@/components/crm/CRMResponsiveTabs";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { AppointmentDialog } from "@/components/crm/AppointmentDialog";
import { useAppointments, useUpdateAppointmentStatus, useDeleteAppointment } from "@/hooks/use-crm";
import { whatsappLink } from "@/lib/whatsapp";
import { fmtDate } from "@/lib/format";
import { MapPin, MessageCircle, Check, Plus, Calendar, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda — ALTUM CRM" }, { name: "description", content: "Compromissos." }] }),
  component: AgendaPage,
});

const tabs = ["Hoje", "Semana", "Mês", "Lista"];
const map: any = { Hoje: "hoje", Semana: "semana", Mês: "mes", Lista: "lista" };

function AgendaPage() {
  const [view, setView] = useState("Hoje");
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });
  const { data: list = [], isLoading } = useAppointments(map[view]);
  const upd = useUpdateAppointmentStatus();
  const del = useDeleteAppointment();

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Sua semana comercial"
          title="Agenda"
          description="Compromissos, visitas e pós-venda."
          actions={
            <button onClick={() => setDlg({ open: true, initial: null })} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Novo compromisso
            </button>
          }
        />

        <CRMResponsiveTabs tabs={tabs} value={view} onChange={setView} />

        <div className="glass-card rounded-3xl p-3 sm:p-4 md:p-6">
          {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : list.length === 0 ? (
            <CRMEmptyState icon={Calendar} title="Sem compromissos" description="Nada agendado para esse período." />
          ) : (
            <ol className="relative space-y-3 sm:space-y-4 border-l-2 border-border-soft pl-5 sm:pl-6">
              {list.map((a: any) => {
                const c = a.contact;
                const tone = a.status === "cancelado" ? "danger" : a.status === "realizado" ? "success" : a.status === "confirmado" ? "primary" : "warning";
                const onWa = () => {
                  const link = whatsappLink(c?.phone, c?.name ? `Olá ${c.name.split(" ")[0]}, confirmando nosso compromisso.` : "");
                  if (!link) return toast.error("Sem telefone válido");
                  window.open(link, "_blank");
                };
                return (
                  <li key={a.id} className="relative">
                    <span className={`absolute -left-[26px] sm:-left-[31px] top-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full ring-4 ring-background ${a.status === "cancelado" ? "bg-destructive" : a.status === "realizado" ? "bg-success" : a.status === "confirmado" ? "bg-primary" : "bg-warning"}`} />
                    <div className="glass-card ring-premium rounded-2xl p-3 sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="font-mono text-foreground">{fmtDate(a.scheduled_at)}</span>
                            <CRMStatusBadge tone={tone} size="xs">{a.status}</CRMStatusBadge>
                          </div>
                          <div className="mt-1.5 text-sm sm:text-base font-bold">{c?.name ?? "—"}</div>
                          {a.service && <div className="text-[11px] sm:text-xs text-muted-foreground">{a.service}</div>}
                          {a.address && <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {a.address}</div>}
                          {a.notes && <div className="mt-1 text-[11px] text-muted-foreground">{a.notes}</div>}
                        </div>
                        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                          <button onClick={onWa} className="flex flex-1 sm:flex-none min-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success ring-1 ring-success/30 min-h-[40px]"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                          {a.status !== "realizado" && (
                            <>
                              <button onClick={async () => { try { await upd.mutateAsync({ id: a.id, status: "confirmado" }); toast.success("Confirmado"); } catch(e:any){toast.error(e?.message);} }} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[40px]"><Check className="h-3.5 w-3.5" /> Confirmar</button>
                              <button onClick={async () => { try { await upd.mutateAsync({ id: a.id, status: "realizado" }); toast.success("Concluído"); } catch(e:any){toast.error(e?.message);} }} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-bold min-h-[40px]">Concluir</button>
                            </>
                          )}
                          <button onClick={() => setDlg({ open: true, initial: a })} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/60"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={async () => { if (confirm("Excluir?")) { try { await del.mutateAsync(a.id); toast.success("Excluído"); } catch(e:any){toast.error(e?.message);} } }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/60 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
      <AppointmentDialog open={dlg.open} onOpenChange={(v) => setDlg({ open: v, initial: null })} initial={dlg.initial} />
    </CRMLayout>
  );
}

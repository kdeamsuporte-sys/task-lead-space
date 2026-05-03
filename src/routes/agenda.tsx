import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

const WEEK_DAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function AgendaPage() {
  const [view, setView] = useState("Hoje");
  const [dlg, setDlg] = useState<{ open: boolean; initial: any }>({ open: false, initial: null });
  const [mobileDay, setMobileDay] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const { data: list = [], isLoading } = useAppointments(map[view]);
  const { data: weekList = [] } = useAppointments("semana");
  const upd = useUpdateAppointmentStatus();
  const del = useDeleteAppointment();

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  }), [weekStart]);
  const countsByDay = useMemo(() => {
    const m = new Map<string, number>();
    weekList.forEach((a: any) => {
      const k = new Date(a.scheduled_at); k.setHours(0,0,0,0);
      const key = k.toISOString();
      m.set(key, (m.get(key) || 0) + 1);
    });
    return m;
  }, [weekList]);
  const mobileItems = useMemo(() => {
    return weekList
      .filter((a: any) => sameDay(new Date(a.scheduled_at), mobileDay))
      .sort((a: any, b: any) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
  }, [weekList, mobileDay]);

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

        {/* Mobile: visão semanal horizontal */}
        <div className="md:hidden space-y-3">
          <div className="glass-card rounded-2xl p-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
              {weekDays.map((d) => {
                const key = d.toISOString();
                const isActive = sameDay(d, mobileDay);
                const isToday = sameDay(d, new Date());
                const count = countsByDay.get(key) || 0;
                return (
                  <button
                    key={key}
                    onClick={() => setMobileDay(d)}
                    className={`relative flex min-w-[56px] snap-start flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-bold transition ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    style={isActive ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    <span className="text-[10px] uppercase tracking-wider opacity-80">{WEEK_DAYS[d.getDay()]}</span>
                    <span className={`text-lg font-black ${isToday && !isActive ? "text-primary" : ""}`}>{d.getDate()}</span>
                    {count > 0 && (
                      <span className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary-foreground" : "bg-primary"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-2">
            {mobileItems.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-3 py-8 text-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div className="text-xs font-bold">Nada agendado</div>
                <div className="text-[11px] text-muted-foreground">{mobileDay.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}</div>
              </div>
            ) : (
              <ol className="space-y-1.5">
                {mobileItems.map((a: any) => {
                  const c = a.contact;
                  const tone = a.status === "cancelado" ? "danger" : a.status === "realizado" ? "success" : a.status === "confirmado" ? "primary" : "warning";
                  const dotColor = a.status === "cancelado" ? "bg-destructive" : a.status === "realizado" ? "bg-success" : a.status === "confirmado" ? "bg-primary" : "bg-warning";
                  const onWa = () => {
                    const link = whatsappLink(c?.phone, c?.name ? `Olá ${c.name.split(" ")[0]}, confirmando.` : "");
                    if (!link) return toast.error("Sem telefone");
                    window.open(link, "_blank");
                  };
                  return (
                    <li key={a.id} className="flex items-stretch gap-2 rounded-xl bg-background/40 p-2 ring-1 ring-border-soft">
                      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-background/60 px-1 py-1.5 ring-1 ring-border-soft">
                        <span className="font-mono text-sm font-black leading-none text-foreground">{fmtTime(a.scheduled_at)}</span>
                        <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{a.duration_minutes || 60}min</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                          <div className="truncate text-sm font-bold">{c?.name ?? "—"}</div>
                        </div>
                        {a.service && <div className="truncate text-[11px] text-muted-foreground">{a.service}</div>}
                        {a.address && <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground"><MapPin className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{a.address}</span></div>}
                        <div className="mt-1.5 flex items-center gap-1">
                          <CRMStatusBadge tone={tone} size="xs">{a.status}</CRMStatusBadge>
                          <div className="ml-auto flex gap-1">
                            <button onClick={onWa} aria-label="WhatsApp" className="flex h-7 w-7 items-center justify-center rounded-md bg-success/15 text-success ring-1 ring-success/30"><MessageCircle className="h-3 w-3" /></button>
                            {a.status !== "realizado" && (
                              <button onClick={async () => { try { await upd.mutateAsync({ id: a.id, status: "confirmado" }); toast.success("Confirmado"); } catch(e:any){toast.error(e?.message);} }} aria-label="Confirmar" className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/60"><Check className="h-3 w-3" /></button>
                            )}
                            <button onClick={() => setDlg({ open: true, initial: a })} aria-label="Editar" className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/60"><Pencil className="h-3 w-3" /></button>
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

        <div className="hidden md:block">
          <CRMResponsiveTabs tabs={tabs} value={view} onChange={setView} />
        </div>

        <div className="glass-card hidden rounded-3xl p-3 sm:p-4 md:block md:p-6">
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

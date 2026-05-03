import { useMemo, useState } from "react";
import { Calendar, ChevronRight, Clock, MapPin, MessageCircle, CheckCircle2, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAppointments, useFollowups, useUpdateAppointmentStatus, useCompleteFollowup } from "@/hooks/use-crm";
import { AppointmentDialog } from "@/components/crm/AppointmentDialog";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Item = { id: string; type: "ag" | "ret"; time: string; title: string; subtitle: string; phone?: string | null; status: string; raw: any };

export function ScheduleBar() {
  const navigate = useNavigate();
  const [dlg, setDlg] = useState(false);
  const { data: appts = [] } = useAppointments("hoje");
  const { data: followups = [] } = useFollowups("hoje");
  const updAppt = useUpdateAppointmentStatus();
  const compFu = useCompleteFollowup();

  const items: Item[] = useMemo(() => {
    const list: Item[] = [
      ...appts.map((a: any) => ({
        id: a.id, type: "ag" as const,
        time: new Date(a.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        title: a.contact?.name ?? "Agendamento",
        subtitle: a.service ?? a.address ?? "—",
        phone: a.contact?.phone, status: a.status, raw: a,
      })),
      ...followups.map((f: any) => ({
        id: f.id, type: "ret" as const,
        time: f.scheduled_at ? new Date(f.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—",
        title: f.contact?.name ?? "Retorno",
        subtitle: f.reason ?? "Follow-up",
        phone: f.contact?.phone, status: f.status, raw: f,
      })),
    ];
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [appts, followups]);

  const now = new Date();
  const today = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", weekday: "long" });
  const hhmm = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const onWa = (phone?: string | null, name?: string) => {
    const link = whatsappLink(phone, name ? `Olá ${name.split(" ")[0]}, tudo bem?` : undefined);
    if (!link) return toast.error("Sem telefone");
    window.open(link, "_blank");
  };

  return (
    <section className="glass-elevated relative overflow-hidden rounded-3xl p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "var(--gradient-radial-primary)" }} />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">Hoje no comercial</span>
                <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> ao vivo
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight capitalize">{today}</h2>
              <div className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{items.length} ações</span> programadas
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground md:inline-flex">
              <Clock className="h-3 w-3" /> {hhmm}
            </div>
            <button onClick={() => setDlg(true)} className="flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" /> Novo
            </button>
            <button onClick={() => navigate({ to: "/agenda" })} className="flex h-10 flex-1 sm:flex-none items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              Ver agenda <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border-soft bg-background/40 p-6 text-center text-xs text-muted-foreground">Nada programado para hoje.</div>
        ) : (
          <ul className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {items.map((s) => {
              const tone = s.type === "ag" ? "border-primary/40 bg-primary/10" : "border-warning/35 bg-warning/10";
              const Icon = s.type === "ag" ? MapPin : Clock;
              const completed = s.status === "concluido" || s.status === "realizado";
              return (
                <li key={`${s.type}-${s.id}`} className={cn("flex items-center gap-3 rounded-2xl border p-3", tone, completed && "opacity-60")}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/60 ring-1 ring-border">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-bold tabular-nums">{s.time}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.type === "ag" ? "Agendamento" : "Retorno"}</span>
                    </div>
                    <div className={cn("mt-0.5 truncate text-sm font-bold", completed && "line-through")}>{s.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{s.subtitle}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!completed && (
                      <button
                        onClick={async () => {
                          try {
                            if (s.type === "ag") await updAppt.mutateAsync({ id: s.id, status: "realizado" });
                            else await compFu.mutateAsync(s.id);
                            toast.success("Concluído");
                          } catch (e: any) { toast.error(e?.message); }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/30"
                        title="Concluir"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {s.phone && (
                      <button onClick={() => onWa(s.phone, s.title)} className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/30" title="WhatsApp">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <AppointmentDialog open={dlg} onOpenChange={setDlg} />
    </section>
  );
}

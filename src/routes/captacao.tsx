import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMMetricCard } from "@/components/crm/CRMMetricCard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Globe, Instagram, MessageCircle, Calendar, UserPlus, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ContactFormDialog } from "@/components/crm/ContactFormDialog";
import { AppointmentDialog } from "@/components/crm/AppointmentDialog";
import { fmtDate, STAGE_LABEL } from "@/lib/format";

export const Route = createFileRoute("/captacao")({
  head: () => ({ meta: [{ title: "Captação — ALTUM Portal" }, { name: "description", content: "Criação de leads, status de canal e agendamentos." }] }),
  component: Page,
});

function useCaptacao() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["captacao", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 30); since.setHours(0, 0, 0, 0);
      const [chR, fR, cR, aR] = await Promise.all([
        supabase.from("crm_channels").select("*").order("kind"),
        supabase.from("crm_capture_forms").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_contacts").select("id,name,phone,source,stage,created_at,service").order("created_at", { ascending: false }).limit(15),
        supabase.from("crm_appointments").select("*, contact:crm_contacts(id,name,phone)").gte("scheduled_at", since.toISOString()).order("scheduled_at", { ascending: true }),
      ]);
      return {
        channels: chR.data ?? [],
        forms: fR.data ?? [],
        recent: cR.data ?? [],
        appointments: aR.data ?? [],
      };
    },
  });
}

const CHANNELS = [
  { kind: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { kind: "instagram", label: "Instagram", icon: Instagram },
  { kind: "site", label: "Site / Formulário", icon: Globe },
];

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useCaptacao();
  const [contactOpen, setContactOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);

  const channelStatus = (kind: string) => data?.channels.find((c: any) => c.kind === kind);

  const toggleChannel = async (kind: string) => {
    if (!user) return;
    const existing = channelStatus(kind);
    const next = existing?.status === "conectado" ? "desconectado" : "conectado";
    if (existing) {
      await supabase.from("crm_channels").update({ status: next, last_sync_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("crm_channels").insert({ owner_id: user.id, kind, status: next, last_sync_at: new Date().toISOString() });
    }
    qc.invalidateQueries({ queryKey: ["captacao"] });
    toast.success(`Canal ${next === "conectado" ? "ativado" : "desativado"}`);
  };

  const last30Leads = data?.recent.filter((c: any) => new Date(c.created_at) >= new Date(Date.now() - 30 * 86400000)).length ?? 0;

  return (
    <CRMLayout>
      <div className="space-y-6">
        <CRMPageHeader
          eyebrow="Captação"
          title="Geração de leads"
          description="Crie leads, ative canais e acompanhe os agendamentos relacionados."
          actions={
            <>
              <button onClick={() => setApptOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-bold"><Calendar className="h-3.5 w-3.5" /> Novo agendamento</button>
              <button onClick={() => setContactOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><UserPlus className="h-3.5 w-3.5" /> Novo lead</button>
            </>
          }
        />

        {isLoading || !data ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <CRMMetricCard icon={UserPlus} label="Novos leads" value={last30Leads} hint="Últimos 30 dias" tone="primary" />
              <CRMMetricCard icon={Globe} label="Formulários" value={data.forms.length} hint={`${data.forms.filter((f: any) => f.status === "active").length} ativos`} tone="info" />
              <CRMMetricCard icon={MessageCircle} label="Canais conectados" value={data.channels.filter((c: any) => c.status === "conectado").length} hint={`de ${CHANNELS.length}`} tone="success" />
              <CRMMetricCard icon={Calendar} label="Agendamentos" value={data.appointments.length} hint="Últimos 30 dias" tone="warning" />
            </div>

            <section className="glass-card rounded-3xl p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Canais</div>
                <h3 className="mt-1 text-base font-bold">Status de captação</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {CHANNELS.map((ch) => {
                  const st = channelStatus(ch.kind);
                  const connected = st?.status === "conectado";
                  return (
                    <div key={ch.kind} className="rounded-2xl border border-border-soft bg-background/40 p-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${connected ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}><ch.icon className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold">{ch.label}</div>
                          <div className="text-[11px] text-muted-foreground">{connected ? `Sincronizado ${st?.last_sync_at ? fmtDate(st.last_sync_at) : ""}` : "Desconectado"}</div>
                        </div>
                      </div>
                      <button onClick={() => toggleChannel(ch.kind)} className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-bold ${connected ? "border border-destructive/30 bg-destructive/10 text-destructive" : "text-primary-foreground"}`} style={!connected ? { background: "var(--gradient-primary)" } : undefined}>
                        {connected ? "Desconectar" : "Conectar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="glass-card rounded-3xl p-4 sm:p-5">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Recentes</div>
                  <h3 className="mt-1 text-base font-bold">Últimos leads capturados</h3>
                </div>
                {data.recent.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Sem leads ainda.</div>
                ) : (
                  <ul className="space-y-2">
                    {data.recent.slice(0, 8).map((c: any) => (
                      <li key={c.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-background/40 px-3 py-2.5">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{c.name}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{c.source ?? "Origem indefinida"} · {STAGE_LABEL[c.stage]}</div>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{fmtDate(c.created_at)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="glass-card rounded-3xl p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Agenda</div>
                    <h3 className="mt-1 text-base font-bold">Próximos agendamentos</h3>
                  </div>
                  <button onClick={() => setApptOpen(true)} className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-bold"><Plus className="inline h-3 w-3" /> Novo</button>
                </div>
                {data.appointments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Nenhum agendamento.</div>
                ) : (
                  <ul className="space-y-2">
                    {data.appointments.slice(0, 8).map((a: any) => (
                      <li key={a.id} className="flex items-center justify-between rounded-xl border border-border-soft bg-background/40 px-3 py-2.5">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{a.contact?.name ?? "Sem contato"}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{a.service ?? "Serviço"} · {fmtDate(a.scheduled_at)}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
      <AppointmentDialog open={apptOpen} onOpenChange={setApptOpen} />
    </CRMLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMStatusBadge } from "@/components/crm/CRMStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Instagram, MessageCircle, Heart, Users, Plug, RefreshCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/operacao-instagram")({
  head: () => ({ meta: [{ title: "Operação Instagram — ALTUM Portal" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: channel } = useQuery({
    queryKey: ["channel_ig", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("crm_channels").select("*").eq("kind", "instagram").maybeSingle();
      return data;
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts_ig", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("crm_contacts").select("id,name,source,created_at,phone").eq("source", "instagram").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const connect = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (channel) {
        const next = channel.status === "conectado" ? "desconectado" : "conectado";
        const { error } = await supabase.from("crm_channels").update({ status: next, last_sync_at: new Date().toISOString() }).eq("id", channel.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("crm_channels").insert({ owner_id: user.id, kind: "instagram", status: "conectado", config: {}, last_sync_at: new Date().toISOString() });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["channel_ig"] }); toast.success("Canal atualizado"); },
  });

  const connected = channel?.status === "conectado";
  const stats = [
    { icon: Users, label: "Leads via IG", value: contacts.length },
    { icon: MessageCircle, label: "DMs no mês", value: (channel?.config as any)?.messages_month ?? 0 },
    { icon: Heart, label: "Engajamento", value: (channel?.config as any)?.engagement ?? "—" },
  ];

  return (
    <CRMLayout>
      <div className="space-y-4">
        <CRMPageHeader eyebrow="Inteligência" title="Operação Instagram" description="Status do canal Instagram, DMs e captação." />

        <div className="glass rounded-2xl p-5 ambient-glow flex flex-wrap items-center gap-4">
          <div className="h-14 w-14 rounded-2xl grid place-items-center glow-soft" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
            <Instagram className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">Instagram Business</h2>
              <CRMStatusBadge tone={connected ? "success" : "neutral"}>{connected ? "conectado" : "desconectado"}</CRMStatusBadge>
            </div>
            <div className="text-xs text-muted-foreground">{channel?.last_sync_at ? `Sincronizado em ${new Date(channel.last_sync_at).toLocaleString("pt-BR")}` : "Aguardando primeira sincronização"}</div>
          </div>
          <button onClick={() => connect.mutate()} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground glow-soft" style={{ background: "var(--gradient-primary)" }}>
            {connected ? <><RefreshCcw className="h-3.5 w-3.5" /> Sincronizar</> : <><Plug className="h-3.5 w-3.5" /> Conectar</>}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground"><s.icon className="h-3 w-3" /> {s.label}</div>
              <div className="mt-1 text-2xl font-black">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Últimos leads pelo Instagram</h3>
          {contacts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">Nenhum lead registrado pelo Instagram ainda.</div>
          ) : (
            <div className="divide-y divide-border-soft">
              {contacts.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.phone || "sem telefone"}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  );
}

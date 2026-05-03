import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";

type T = Database["public"]["Tables"];
export type Followup = T["crm_followups"]["Row"];
export type Quote = T["crm_quotes"]["Row"];
export type Appointment = T["crm_appointments"]["Row"];
export type Task = T["crm_tasks"]["Row"];
export type Automation = T["crm_automations"]["Row"];
export type Contact = T["crm_contacts"]["Row"];

/* ============ Followups ============ */
export function useFollowups(filter: "todos" | "hoje" | "atrasado" | "futuro" | "sem_data" | "concluido" = "todos") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["followups", user?.id, filter],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_followups")
        .select("*, contact:crm_contacts(id,name,phone,initials:name,stage)")
        .order("scheduled_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      const list = (data ?? []) as any as (Followup & { contact: Contact | null })[];
      const now = new Date();
      const startToday = new Date(now); startToday.setHours(0,0,0,0);
      const endToday = new Date(now); endToday.setHours(23,59,59,999);
      return list.filter((f) => {
        if (filter === "todos") return true;
        if (filter === "concluido") return f.status === "concluido";
        if (f.status === "concluido") return false;
        if (!f.scheduled_at) return filter === "sem_data";
        const d = new Date(f.scheduled_at);
        if (filter === "atrasado") return d < startToday && f.status === "pendente";
        if (filter === "hoje") return d >= startToday && d <= endToday;
        if (filter === "futuro") return d > endToday;
        return true;
      });
    },
  });
}

export function useUpsertFollowup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Followup> & { id?: string; contact_id: string; scheduled_at: string }) => {
      if (!user) throw new Error("Não autenticado");
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase.from("crm_followups").update(patch as any).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("crm_followups")
        .insert({ ...(input as any), owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followups"] }),
  });
}

export function useCompleteFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_followups").update({ status: "concluido", completed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followups"] }),
  });
}

export function useDeleteFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_followups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followups"] }),
  });
}

/* ============ Quotes ============ */
export function useQuotes(status?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quotes", user?.id, status ?? "all"],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("crm_quotes").select("*, contact:crm_contacts(id,name,phone)").order("created_at", { ascending: false });
      if (status && status !== "todos") q = q.eq("status", status as any);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any as (Quote & { contact: Contact | null })[];
    },
  });
}

export function useUpsertQuote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Quote> & { id?: string; contact_id: string; service: string; amount: number }) => {
      if (!user) throw new Error("Não autenticado");
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase.from("crm_quotes").update(patch as any).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("crm_quotes").insert({ ...(input as any), owner_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Quote["status"] }) => {
      const patch: any = { status };
      if (status === "enviado") patch.sent_at = new Date().toISOString();
      if (status === "aceito") patch.accepted_at = new Date().toISOString();
      const { error } = await supabase.from("crm_quotes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

/* ============ Appointments ============ */
export function useAppointments(range: "hoje" | "semana" | "mes" | "lista" = "hoje") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["appointments", user?.id, range],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("crm_appointments").select("*, contact:crm_contacts(id,name,phone,neighborhood)").order("scheduled_at", { ascending: true });
      const now = new Date();
      const start = new Date(now); start.setHours(0,0,0,0);
      const end = new Date(now);
      if (range === "hoje") end.setHours(23,59,59,999);
      else if (range === "semana") end.setDate(end.getDate() + 7);
      else if (range === "mes") end.setMonth(end.getMonth() + 1);
      if (range !== "lista") q = q.gte("scheduled_at", start.toISOString()).lte("scheduled_at", end.toISOString());
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any as (Appointment & { contact: Contact | null })[];
    },
  });
}

export function useUpsertAppointment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Appointment> & { id?: string; contact_id: string; scheduled_at: string }) => {
      if (!user) throw new Error("Não autenticado");
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase.from("crm_appointments").update(patch as any).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("crm_appointments").insert({ ...(input as any), owner_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment["status"] }) => {
      const { error } = await supabase.from("crm_appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

/* ============ Tasks ============ */
export function useTasks(filter: "todas" | "hoje" | "atrasadas" | "concluidas" = "todas") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", user?.id, filter],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_tasks").select("*, contact:crm_contacts(id,name)").order("due_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      const list = (data ?? []) as any as (Task & { contact: Contact | null })[];
      const now = new Date(); const start = new Date(now); start.setHours(0,0,0,0); const end = new Date(now); end.setHours(23,59,59,999);
      return list.filter((t) => {
        if (filter === "todas") return true;
        if (filter === "concluidas") return t.status === "concluida";
        if (t.status === "concluida") return false;
        if (!t.due_at) return false;
        const d = new Date(t.due_at);
        if (filter === "hoje") return d >= start && d <= end;
        if (filter === "atrasadas") return d < start;
        return true;
      });
    },
  });
}

export function useUpsertTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Task> & { id?: string; title: string }) => {
      if (!user) throw new Error("Não autenticado");
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase.from("crm_tasks").update(patch as any).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("crm_tasks").insert({ ...(input as any), owner_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const { error } = await supabase.from("crm_tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

/* ============ Automations ============ */
export function useAutomations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["automations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_automations").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Automation[];
    },
  });
}

export function useToggleAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("crm_automations").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}

export function useUpsertAutomation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Automation> & { id?: string; name: string; trigger_type: string; action_type: string }) => {
      if (!user) throw new Error("Não autenticado");
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase.from("crm_automations").update(patch as any).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("crm_automations").insert({ ...(input as any), owner_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_automations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}

/* ============ Dashboard / KPIs ============ */
export function useDashboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [contactsR, quotesR, followupsR, apptsR] = await Promise.all([
        supabase.from("crm_contacts").select("id,stage,temperature,potential_value,priority,created_at"),
        supabase.from("crm_quotes").select("id,status,amount,created_at"),
        supabase.from("crm_followups").select("id,status,scheduled_at"),
        supabase.from("crm_appointments").select("id,status,scheduled_at"),
      ]);
      if (contactsR.error) throw contactsR.error;
      const contacts = contactsR.data ?? [];
      const quotes = quotesR.data ?? [];
      const followups = followupsR.data ?? [];
      const appts = apptsR.data ?? [];
      const now = new Date(); const start = new Date(now); start.setHours(0,0,0,0); const end = new Date(now); end.setHours(23,59,59,999);
      const novosLeads = contacts.filter((c: any) => c.stage === "novo_lead").length;
      const orcParados = quotes.filter((q: any) => ["enviado","aguardando","visualizado"].includes(q.status)).length;
      const retornosAtrasados = followups.filter((f: any) => f.status === "pendente" && f.scheduled_at && new Date(f.scheduled_at) < start).length;
      const quentes = contacts.filter((c: any) => c.temperature === "quente" && c.stage !== "perdido" && c.stage !== "servico_realizado").length;
      const pot = contacts.filter((c: any) => !["perdido","servico_realizado"].includes(c.stage)).reduce((s: number, c: any) => s + (Number(c.potential_value) || 0), 0);
      const valorAberto = quotes.filter((q: any) => ["enviado","aguardando","visualizado"].includes(q.status)).reduce((s: number, q: any) => s + (Number(q.amount) || 0), 0);
      const valorVendido = quotes.filter((q: any) => q.status === "aceito").reduce((s: number, q: any) => s + (Number(q.amount) || 0), 0);
      const valorPerdido = quotes.filter((q: any) => ["recusado","expirado"].includes(q.status)).reduce((s: number, q: any) => s + (Number(q.amount) || 0), 0);
      const aceitos = quotes.filter((q: any) => q.status === "aceito").length;
      const closeRate = quotes.length ? Math.round((aceitos / quotes.length) * 100) : 0;
      const apptsHoje = appts.filter((a: any) => { const d = new Date(a.scheduled_at); return d >= start && d <= end; }).length;
      return {
        contacts: contacts.length,
        novosLeads, orcParados, retornosAtrasados, quentes, pot, valorAberto, valorVendido, valorPerdido, closeRate, apptsHoje,
        quotesAceitos: aceitos,
        quotesEnviados: quotes.filter((q:any) => q.status === "enviado").length,
        quotesAguardando: quotes.filter((q:any) => q.status === "aguardando").length,
        quotesExpirados: quotes.filter((q:any) => q.status === "expirado").length,
        leadsPerdidos: contacts.filter((c: any) => c.stage === "perdido").length,
      };
    },
  });
}

/* ============ Pipeline ============ */
export function usePipeline() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pipeline", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_contacts").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });
}

/* ============ Reports ============ */
export function useReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [c, q] = await Promise.all([
        supabase.from("crm_contacts").select("source,stage,lost_reason,potential_value,temperature,created_at"),
        supabase.from("crm_quotes").select("status,amount,created_at"),
      ]);
      if (c.error) throw c.error;
      const contacts = c.data ?? [];
      const quotes = q.data ?? [];
      const stages = ["novo_lead","aguardando_info","orcamento_enviado","followup","agendado","servico_realizado","pos_venda","perdido"];
      const total = contacts.length || 1;
      const funnel = [
        { stage: "Leads", value: contacts.length, pct: 100 },
        { stage: "Qualificados", value: contacts.filter((x: any) => x.stage !== "novo_lead").length, pct: 0 },
        { stage: "Orçamento", value: contacts.filter((x: any) => ["orcamento_enviado","followup","agendado","servico_realizado","pos_venda"].includes(x.stage)).length, pct: 0 },
        { stage: "Negociação", value: contacts.filter((x: any) => ["agendado","servico_realizado","pos_venda"].includes(x.stage)).length, pct: 0 },
        { stage: "Fechado", value: contacts.filter((x: any) => ["servico_realizado","pos_venda"].includes(x.stage)).length, pct: 0 },
      ].map((f) => ({ ...f, pct: Math.round((f.value / total) * 100) }));
      const originsMap = new Map<string, number>();
      contacts.forEach((x: any) => { const k = x.source || "Sem origem"; originsMap.set(k, (originsMap.get(k) ?? 0) + 1); });
      const origins = Array.from(originsMap.entries()).map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) })).sort((a, b) => b.value - a.value);
      const lostList = contacts.filter((x: any) => x.stage === "perdido");
      const lostMap = new Map<string, number>();
      lostList.forEach((x: any) => { const k = x.lost_reason || "Outro"; lostMap.set(k, (lostMap.get(k) ?? 0) + 1); });
      const lostTotal = lostList.length || 1;
      const lostReasons = Array.from(lostMap.entries()).map(([label, n]) => ({ label, pct: Math.round((n / lostTotal) * 100) })).sort((a, b) => b.pct - a.pct);
      const aceitos = quotes.filter((x:any) => x.status === "aceito");
      const valorVendido = aceitos.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
      const valorPerdido = quotes.filter((x:any) => ["recusado","expirado"].includes(x.status)).reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
      return {
        totals: {
          leads: contacts.length,
          orcEnviados: quotes.filter((x:any) => x.status !== "rascunho").length,
          aceitos: aceitos.length,
          closeRate: quotes.length ? Math.round((aceitos.length / quotes.length) * 100) : 0,
          valorVendido, valorPerdido,
          quentes: contacts.filter((x:any) => x.temperature === "quente").length,
        },
        funnel, origins, lostReasons, stages,
      };
    },
  });
}

/* ============ Search contacts ============ */
export function useContactPicker(search: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contact-picker", user?.id, search],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("crm_contacts").select("id,name,phone,service,stage").order("name", { ascending: true }).limit(20);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`name.ilike.${s},phone.ilike.${s},service.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
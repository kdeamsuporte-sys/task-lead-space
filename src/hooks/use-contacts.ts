import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";

export type Contact = Database["public"]["Tables"]["crm_contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["crm_contacts"]["Insert"];
export type ContactUpdate = Database["public"]["Tables"]["crm_contacts"]["Update"];
export type Note = Database["public"]["Tables"]["crm_contact_notes"]["Row"];
export type TimelineEvent = Database["public"]["Tables"]["crm_contact_timeline"]["Row"];

export function useContacts(search?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contacts", user?.id, search ?? ""],
    enabled: !!user,
    queryFn: async (): Promise<Contact[]> => {
      let q = supabase.from("crm_contacts").select("*").order("created_at", { ascending: false });
      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(
          `name.ilike.${s},phone.ilike.${s},email.ilike.${s},company.ilike.${s},service.ilike.${s},neighborhood.ilike.${s}`,
        );
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: ["contact", id],
    enabled: !!id,
    queryFn: async (): Promise<Contact | null> => {
      if (!id) return null;
      const { data, error } = await supabase.from("crm_contacts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Omit<ContactInsert, "owner_id">) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("crm_contacts")
        .insert({ ...input, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & ContactUpdate) => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["contact", vars.id] });
      qc.invalidateQueries({ queryKey: ["timeline", vars.id] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useNotes(contactId: string | null) {
  return useQuery({
    queryKey: ["notes", contactId],
    enabled: !!contactId,
    queryFn: async (): Promise<Note[]> => {
      if (!contactId) return [];
      const { data, error } = await supabase
        .from("crm_contact_notes")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ contactId, body }: { contactId: string; body: string }) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("crm_contact_notes")
        .insert({ contact_id: contactId, body, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["notes", vars.contactId] });
      qc.invalidateQueries({ queryKey: ["timeline", vars.contactId] });
    },
  });
}

export function useTimeline(contactId: string | null) {
  return useQuery({
    queryKey: ["timeline", contactId],
    enabled: !!contactId,
    queryFn: async (): Promise<TimelineEvent[]> => {
      if (!contactId) return [];
      const { data, error } = await supabase
        .from("crm_contact_timeline")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function logTimelineEvent(args: {
  contactId: string;
  ownerId: string;
  eventType: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("crm_contact_timeline").insert({
    contact_id: args.contactId,
    owner_id: args.ownerId,
    event_type: args.eventType,
    description: args.description ?? null,
    metadata: (args.metadata as any) ?? null,
  });
  if (error) console.warn("[timeline] insert failed", error.message);
}
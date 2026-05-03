import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMPageHeader } from "@/components/crm/CRMPageHeader";
import { CRMEmptyState } from "@/components/crm/CRMEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Trash2, Search, Tag, Save, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conhecimento")({
  head: () => ({ meta: [{ title: "Conhecimento — ALTUM Portal" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["kb_docs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_kb_docs").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = docs.filter((d: any) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return d.title.toLowerCase().includes(s) || (d.content ?? "").toLowerCase().includes(s) || (d.tags ?? []).some((t: string) => t.toLowerCase().includes(s));
  });

  const save = useMutation({
    mutationFn: async (input: { id?: string; title: string; content: string; tags: string[] }) => {
      if (!user) throw new Error("Não autenticado");
      if (input.id) {
        const { error } = await supabase.from("crm_kb_docs").update({ title: input.title, content: input.content, tags: input.tags }).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("crm_kb_docs").insert({ owner_id: user.id, title: input.title, content: input.content, tags: input.tags });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kb_docs"] }); setOpen(false); setEditing(null); toast.success("Documento salvo"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("crm_kb_docs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kb_docs"] }); toast.success("Removido"); },
  });

  return (
    <CRMLayout>
      <div className="space-y-4">
        <CRMPageHeader eyebrow="Inteligência" title="Conhecimento" description="Documentos que alimentam a IA do atendimento."
          actions={
            <button onClick={() => { setEditing({ title: "", content: "", tags: [] }); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-foreground glow-soft" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-3.5 w-3.5" /> Novo documento
            </button>
          } />

        <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 max-w-md">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar título, conteúdo ou tag…" className="flex-1 bg-transparent text-xs outline-none" />
        </div>

        {isLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> : filtered.length === 0 ? (
          <CRMEmptyState icon={BookOpen} title="Nenhum documento" description="Crie políticas, FAQs e respostas-padrão para a IA usar." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d: any) => (
              <article key={d.id} className="glass rounded-2xl p-4 group relative">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm leading-tight flex-1">{d.title}</h3>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                    <button onClick={() => { setEditing(d); setOpen(true); }} className="text-[10px] rounded-full glass px-2 py-0.5 font-bold">Editar</button>
                    <button onClick={() => { if (confirm("Remover?")) del.mutate(d.id); }} className="h-6 w-6 grid place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">{d.content || "Sem conteúdo"}</p>
                {d.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {d.tags.map((t: string) => (<span key={t} className="inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"><Tag className="h-2.5 w-2.5" />{t}</span>))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {open && editing && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-strong w-full max-w-xl rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{editing.id ? "Editar documento" : "Novo documento"}</h3>
              <button onClick={() => setOpen(false)} className="h-8 w-8 grid place-items-center rounded-full glass"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Título" className="w-full rounded-xl glass px-3 py-2 text-sm outline-none" />
              <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Conteúdo (políticas, FAQ, respostas)" rows={8} className="w-full rounded-xl glass px-3 py-2 text-sm outline-none resize-none" />
              <input value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} placeholder="Tags separadas por vírgula" className="w-full rounded-xl glass px-3 py-2 text-sm outline-none" />
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="rounded-full glass px-4 py-2 text-xs font-bold">Cancelar</button>
                <button onClick={() => save.mutate(editing)} disabled={!editing.title?.trim() || save.isPending} className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground glow-soft disabled:opacity-50")} style={{ background: "var(--gradient-primary)" }}>
                  <Save className="h-3.5 w-3.5" /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}

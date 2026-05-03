import { useState } from "react";
import { Search, Loader2, Check } from "lucide-react";
import { useContactPicker } from "@/hooks/use-crm";

export function ContactPicker({ value, onChange }: { value: string | null; onChange: (id: string, contact: any) => void }) {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useContactPicker(search);
  const selected = data.find((c: any) => c.id === value);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contato pelo nome, telefone ou serviço…"
          className="w-full bg-transparent text-sm outline-none"
        />
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      {selected && (
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary">
          <Check className="h-3 w-3" /> {selected.name}
        </div>
      )}
      <div className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border-soft bg-background/40 p-1">
        {data.length === 0 && !isLoading && (
          <div className="p-3 text-center text-xs text-muted-foreground">Nenhum contato</div>
        )}
        {data.map((c: any) => (
          <button
            type="button"
            key={c.id}
            onClick={() => onChange(c.id, c)}
            className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition hover:bg-secondary ${value === c.id ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}
          >
            <div className="min-w-0">
              <div className="truncate font-bold">{c.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{[c.phone, c.service].filter(Boolean).join(" · ")}</div>
            </div>
            {value === c.id && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
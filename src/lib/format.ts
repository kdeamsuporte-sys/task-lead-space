export function fmtMoney(v?: number | string | null) {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : v;
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(s?: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("pt-BR", opts ?? { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return s; }
}

export function fmtDateOnly(s?: string | null) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("pt-BR"); } catch { return s; }
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export const STAGE_LABEL: Record<string, string> = {
  novo_lead: "Novo lead",
  aguardando_info: "Aguardando info",
  orcamento_enviado: "Orçamento enviado",
  followup: "Follow-up",
  agendado: "Agendado",
  servico_realizado: "Serviço realizado",
  pos_venda: "Pós-venda",
  perdido: "Perdido",
};

export const QUOTE_STATUS_LABEL: Record<string, { label: string; tone: any }> = {
  rascunho: { tone: "neutral", label: "Rascunho" },
  enviado: { tone: "info", label: "Enviado" },
  visualizado: { tone: "primary", label: "Visualizado" },
  aguardando: { tone: "warning", label: "Aguardando" },
  aceito: { tone: "success", label: "Aceito" },
  recusado: { tone: "danger", label: "Recusado" },
  expirado: { tone: "danger", label: "Expirado" },
};
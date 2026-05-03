export type Temperature = "quente" | "morno" | "frio";
export type Urgency = "ok" | "atencao" | "critico";

export const kpis = [
  { id: "leads", label: "Leads novos", value: 7, hint: "Aguardando primeiro atendimento", delta: "+3", tone: "primary" as const },
  { id: "orc", label: "Orçamentos parados", value: 4, hint: "Sem resposta há mais de 24h", delta: "+1", tone: "warning" as const },
  { id: "ret", label: "Retornos atrasados", value: 2, hint: "Precisam de ação hoje", delta: "+1", tone: "danger" as const },
  { id: "hot", label: "Clientes quentes", value: 5, hint: "Alta chance de fechar", delta: "+2", tone: "success" as const },
  { id: "pot", label: "Potencial aberto", value: "R$ 4.380", hint: "Valor estimado no pipeline", delta: "+R$ 740", tone: "info" as const },
];

export const schedule = [
  { time: "09:00", type: "Retorno", name: "Maria Souza", urgency: "critico" as Urgency, icon: "phone" },
  { time: "10:30", type: "WhatsApp", name: "Pedro Lima", urgency: "atencao" as Urgency, icon: "message" },
  { time: "11:30", type: "Enviar orçamento", name: "João Mendes", urgency: "atencao" as Urgency, icon: "file" },
  { time: "13:15", type: "Confirmar agenda", name: "Ana Beatriz", urgency: "ok" as Urgency, icon: "calendar" },
  { time: "14:00", type: "Visita técnica", name: "Carla Reis", urgency: "ok" as Urgency, icon: "map" },
  { time: "16:00", type: "Pós-venda", name: "Carlos Tavares", urgency: "ok" as Urgency, icon: "star" },
  { time: "17:30", type: "Cobrar sinal", name: "Rafael Dias", urgency: "critico" as Urgency, icon: "wallet" },
];

export type Lead = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  service: string;
  origin: string;
  district: string;
  temperature: Temperature;
  lastTouch: string;
  estimate: string;
  estimateValue: number;
  stage: string;
  recommended?: string;
  daysIdle: number;
  budgetStatus?: "rascunho" | "enviado" | "visualizado" | "aguardando" | "aceito" | "recusado" | "expirado";
};

export const leads: Lead[] = [
  { id: "l1", name: "Maria Souza", initials: "MS", phone: "+55 31 9 8765-4321", service: "Sofá 3 lugares + colchão", origin: "WhatsApp", district: "Barreiro", temperature: "quente", lastTouch: "3 dias", estimate: "R$ 420", estimateValue: 420, stage: "Orçamento enviado", recommended: "Fazer follow-up", daysIdle: 3, budgetStatus: "aguardando" },
  { id: "l2", name: "Darlene Robertson", initials: "DR", phone: "+55 31 9 8211-0090", service: "Limpeza de poltrona + tapete", origin: "Instagram", district: "Savassi", temperature: "morno", lastTouch: "1 dia", estimate: "R$ 280", estimateValue: 280, stage: "Aguardando informações", recommended: "Pedir fotos", daysIdle: 1, budgetStatus: "rascunho" },
  { id: "l3", name: "Wade Warren", initials: "WW", phone: "+55 31 9 9120-7711", service: "Higienização sofá retrátil", origin: "Indicação", district: "Buritis", temperature: "quente", lastTouch: "2h", estimate: "R$ 360", estimateValue: 360, stage: "Novo lead", recommended: "Abrir WhatsApp", daysIdle: 0, budgetStatus: "rascunho" },
  { id: "l4", name: "Jonah Jude", initials: "JJ", phone: "+55 31 9 8002-3344", service: "Cadeiras de jantar (6)", origin: "Anúncio", district: "Pampulha", temperature: "frio", lastTouch: "5 dias", estimate: "R$ 180", estimateValue: 180, stage: "Follow-up", recommended: "Reativar lead", daysIdle: 5, budgetStatus: "visualizado" },
  { id: "l5", name: "Alesha Hyacinth", initials: "AH", phone: "+55 31 9 7600-1212", service: "Tapete grande sala", origin: "Site", district: "Lourdes", temperature: "morno", lastTouch: "4h", estimate: "R$ 220", estimateValue: 220, stage: "Orçamento enviado", recommended: "Confirmar agendamento", daysIdle: 0, budgetStatus: "enviado" },
  { id: "l6", name: "Pedro Lima", initials: "PL", phone: "+55 31 9 8800-2211", service: "Sofá de canto + 2 poltronas", origin: "WhatsApp", district: "Castelo", temperature: "quente", lastTouch: "1h", estimate: "R$ 540", estimateValue: 540, stage: "Agendado", daysIdle: 0, budgetStatus: "aceito" },
  { id: "l7", name: "Ana Beatriz", initials: "AB", phone: "+55 31 9 7711-4422", service: "Higienização colchão queen", origin: "Indicação", district: "Cidade Nova", temperature: "morno", lastTouch: "6h", estimate: "R$ 190", estimateValue: 190, stage: "Agendado", daysIdle: 0, budgetStatus: "aceito" },
  { id: "l8", name: "Carlos Tavares", initials: "CT", phone: "+55 31 9 9001-5566", service: "Sofá retrátil 2,80m", origin: "Site", district: "Anchieta", temperature: "morno", lastTouch: "1 dia", estimate: "R$ 380", estimateValue: 380, stage: "Pós-venda", daysIdle: 1, budgetStatus: "aceito" },
];

export type Task = {
  id: string;
  type: "follow" | "orcamento" | "agenda" | "sinal" | "fotos" | "posvenda" | "review";
  title: string;
  client: string;
  service: string;
  meta?: string;
  priority: "alta" | "media" | "baixa";
  highlight?: boolean;
};

export const tasks: Task[] = [
  { id: "t1", type: "agenda", title: "Confirmar agendamento", client: "Peter Thomas", service: "Sofá + tapete", meta: "28.03 · 14:00", priority: "alta", highlight: true },
  { id: "t2", type: "orcamento", title: "Enviar orçamento", client: "João Mendes", service: "Sofá + tapete", meta: "Estimado R$ 320", priority: "alta" },
  { id: "t3", type: "follow", title: "Fazer follow-up", client: "Miriam Fannie", service: "Cadeiras de jantar", meta: "Sem resposta · 3 dias", priority: "media" },
  { id: "t4", type: "sinal", title: "Cobrar sinal", client: "Rafael Dias", service: "Higienização colchão", meta: "50% · R$ 240", priority: "alta" },
  { id: "t5", type: "fotos", title: "Pedir fotos", client: "Beatriz Alves", service: "Poltrona + tapete", meta: "Antes do orçamento", priority: "baixa" },
  { id: "t6", type: "posvenda", title: "Pós-venda", client: "Carlos Tavares", service: "Sofá retrátil", meta: "Serviço D+3", priority: "media" },
];

// Pipeline stages (in order)
export const pipelineStages = [
  { id: "novo", label: "Novo lead", tone: "primary" },
  { id: "info", label: "Aguardando informações", tone: "warning" },
  { id: "orcamento", label: "Orçamento enviado", tone: "info" },
  { id: "follow", label: "Follow-up", tone: "warning" },
  { id: "agendado", label: "Agendado", tone: "success" },
  { id: "realizado", label: "Serviço realizado", tone: "success" },
  { id: "posvenda", label: "Pós-venda", tone: "info" },
  { id: "perdido", label: "Perdido", tone: "danger" },
] as const;

export const pipelineMap: Record<string, string[]> = {
  novo: ["l3"],
  info: ["l2"],
  orcamento: ["l1", "l5"],
  follow: ["l4"],
  agendado: ["l6", "l7"],
  realizado: [],
  posvenda: ["l8"],
  perdido: [],
};

// Retornos
export type Retorno = {
  id: string;
  leadId: string;
  reason: string;
  due: string;
  priority: "alta" | "media" | "baixa";
  status: "hoje" | "atrasado" | "futuro" | "sem-data" | "concluido";
};

export const retornos: Retorno[] = [
  { id: "r1", leadId: "l1", reason: "Confirmar fechamento do orçamento", due: "Hoje · 09:00", priority: "alta", status: "hoje" },
  { id: "r2", leadId: "l4", reason: "Reativar lead frio", due: "Há 2 dias", priority: "alta", status: "atrasado" },
  { id: "r3", leadId: "l5", reason: "Confirmar agenda do sábado", due: "Hoje · 13:15", priority: "media", status: "hoje" },
  { id: "r4", leadId: "l2", reason: "Pedir fotos da poltrona", due: "Amanhã · 10:00", priority: "baixa", status: "futuro" },
  { id: "r5", leadId: "l3", reason: "Validar endereço para visita", due: "Em 3 dias", priority: "media", status: "futuro" },
  { id: "r6", leadId: "l8", reason: "Sem data definida", due: "Sem data", priority: "baixa", status: "sem-data" },
];

// Perdidos
export type Lost = {
  id: string;
  name: string;
  initials: string;
  service: string;
  value: number;
  reason: "Sem resposta" | "Preço alto" | "Fora da região" | "Fechou com outro" | "Sem interesse" | "Outro";
  date: string;
  lastInteraction: string;
};

export const lost: Lost[] = [
  { id: "p1", name: "Esther Howard", initials: "EH", service: "Sofá 4 lugares", value: 480, reason: "Preço alto", date: "20.03", lastInteraction: "Orçamento enviado" },
  { id: "p2", name: "Robert Fox", initials: "RF", service: "Tapete + poltrona", value: 240, reason: "Sem resposta", date: "18.03", lastInteraction: "WhatsApp lido" },
  { id: "p3", name: "Cody Fisher", initials: "CF", service: "Higienização colchão", value: 190, reason: "Fechou com outro", date: "15.03", lastInteraction: "Negociação" },
  { id: "p4", name: "Annette Black", initials: "AB", service: "Cadeiras (8)", value: 320, reason: "Fora da região", date: "12.03", lastInteraction: "Primeiro contato" },
  { id: "p5", name: "Theresa Webb", initials: "TW", service: "Sofá + tapete", value: 410, reason: "Sem resposta", date: "10.03", lastInteraction: "Follow-up enviado" },
];

// Automações
export const automations = [
  { id: "a1", name: "Lead novo sem resposta", desc: "Cria alerta urgente quando um lead novo passa de 10 min sem primeiro atendimento.", trigger: "Lead novo · +10 min", action: "Notificar responsável", active: true, runs: 124 },
  { id: "a2", name: "Orçamento sem resposta 24h", desc: "Cria retorno automático quando o orçamento enviado não recebe resposta em 24h.", trigger: "Orçamento enviado · +24h", action: "Criar retorno follow-up", active: true, runs: 87 },
  { id: "a3", name: "Retorno atrasado", desc: "Notifica o responsável quando um retorno passa do horário programado.", trigger: "Retorno · vencido", action: "Notificar + marcar urgência", active: true, runs: 41 },
  { id: "a4", name: "Pós-venda 24h", desc: "Cria tarefa de pós-venda 24h após o serviço realizado.", trigger: "Serviço · +24h", action: "Criar tarefa pós-venda", active: true, runs: 56 },
  { id: "a5", name: "Pedido de avaliação Google", desc: "Cria tarefa para pedir avaliação no Google após cliente confirmar satisfação.", trigger: "Pós-venda · positivo", action: "Criar tarefa de review", active: false, runs: 22 },
];

// Agenda items
export type Appointment = {
  id: string;
  time: string;
  type: "Retorno" | "Visita técnica" | "Serviço" | "Pós-venda" | "Agendamento";
  client: string;
  service: string;
  district: string;
  status: "confirmado" | "pendente" | "atrasado";
};

export const appointments: Appointment[] = [
  { id: "ag1", time: "09:00", type: "Retorno", client: "Maria Souza", service: "Sofá + colchão", district: "Barreiro", status: "atrasado" },
  { id: "ag2", time: "11:30", type: "Agendamento", client: "João Mendes", service: "Limpeza completa", district: "Savassi", status: "pendente" },
  { id: "ag3", time: "13:15", type: "Retorno", client: "Ana Beatriz", service: "Colchão queen", district: "Cidade Nova", status: "confirmado" },
  { id: "ag4", time: "14:00", type: "Visita técnica", client: "Carla Reis", service: "Sofá retrátil", district: "Pampulha", status: "confirmado" },
  { id: "ag5", time: "16:00", type: "Pós-venda", client: "Carlos Tavares", service: "Sofá retrátil 2,80m", district: "Anchieta", status: "confirmado" },
  { id: "ag6", time: "17:30", type: "Serviço", client: "Rafael Dias", service: "Cobrar sinal + agendar", district: "Castelo", status: "atrasado" },
];

// Relatórios mock
export const reports = {
  metrics: [
    { id: "leads_recv", label: "Leads recebidos", value: 84, delta: "+12%", tone: "primary" },
    { id: "resp_rate", label: "Taxa de resposta", value: "92%", delta: "+4%", tone: "success" },
    { id: "budgets_sent", label: "Orçamentos enviados", value: 47, delta: "+8", tone: "info" },
    { id: "close_rate", label: "Taxa de fechamento", value: "38%", delta: "+3%", tone: "success" },
    { id: "sold", label: "Valor vendido", value: "R$ 14.820", delta: "+R$ 2.110", tone: "success" },
    { id: "lost_value", label: "Valor perdido", value: "R$ 3.640", delta: "-R$ 410", tone: "danger" },
    { id: "avg_resp", label: "Tempo médio de resposta", value: "9 min", delta: "-2 min", tone: "success" },
    { id: "top_channel", label: "Canal que mais converte", value: "WhatsApp", delta: "62% leads", tone: "primary" },
  ],
  funnel: [
    { stage: "Leads", value: 84, pct: 100 },
    { stage: "Qualificados", value: 71, pct: 84 },
    { stage: "Orçamento", value: 47, pct: 56 },
    { stage: "Negociação", value: 32, pct: 38 },
    { stage: "Fechado", value: 26, pct: 31 },
  ],
  origins: [
    { label: "WhatsApp", pct: 52, value: 44 },
    { label: "Instagram", pct: 22, value: 18 },
    { label: "Indicação", pct: 14, value: 12 },
    { label: "Site", pct: 8, value: 7 },
    { label: "Anúncio", pct: 4, value: 3 },
  ],
  lostReasons: [
    { label: "Preço alto", pct: 38 },
    { label: "Sem resposta", pct: 31 },
    { label: "Fechou com outro", pct: 16 },
    { label: "Fora da região", pct: 9 },
    { label: "Sem interesse", pct: 6 },
  ],
};

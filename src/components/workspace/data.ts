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

export const leads = [
  {
    id: "l1",
    name: "Maria Souza",
    initials: "MS",
    service: "Sofá 3 lugares + colchão",
    origin: "WhatsApp",
    district: "Barreiro",
    temperature: "quente" as Temperature,
    lastTouch: "3 dias",
    estimate: "R$ 420",
  },
  {
    id: "l2",
    name: "Darlene Robertson",
    initials: "DR",
    service: "Limpeza de poltrona + tapete",
    origin: "Instagram",
    district: "Savassi",
    temperature: "morno" as Temperature,
    lastTouch: "1 dia",
    estimate: "R$ 280",
  },
  {
    id: "l3",
    name: "Wade Warren",
    initials: "WW",
    service: "Higienização sofá retrátil",
    origin: "Indicação",
    district: "Buritis",
    temperature: "quente" as Temperature,
    lastTouch: "2h",
    estimate: "R$ 360",
  },
  {
    id: "l4",
    name: "Jonah Jude",
    initials: "JJ",
    service: "Cadeiras de jantar (6)",
    origin: "Anúncio",
    district: "Pampulha",
    temperature: "frio" as Temperature,
    lastTouch: "5 dias",
    estimate: "R$ 180",
  },
  {
    id: "l5",
    name: "Alesha Hyacinth",
    initials: "AH",
    service: "Tapete grande sala",
    origin: "Site",
    district: "Lourdes",
    temperature: "morno" as Temperature,
    lastTouch: "4h",
    estimate: "R$ 220",
  },
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

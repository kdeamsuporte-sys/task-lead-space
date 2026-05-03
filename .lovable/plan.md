# ALTUM Portal do Cliente — Reestruturação completa

Vou transformar o CRM atual no **Portal do Cliente ALTUM** com base nas referências enviadas: sidebar expansível agrupada, topbar com modos (Essencial / Conforto / Claro), e todas as novas rotas funcionais conectadas ao banco.

## 1. Nova Shell (CRMLayout reescrito)

**Sidebar expansível e organizada por grupos** (collapsable em desktop, drawer no mobile):

```text
ALTUM · Portal do cliente              [<]  ← toggle collapse
─────────────────────────────────────
CONTA  [SAVIO CIPRIANO]
Prontidão · Estrutura em implantação    [2 pend.]
─────────────────────────────────────
OPERAÇÃO
  ▢ Visão geral
ATENDIMENTO E VENDAS
  💬 Conversas    👥 CRM      ⏱ Retornos
  📅 Agenda       🪜 Funil    💲 Comercial
CRESCIMENTO
  📣 Captação     ✨ Campanhas [novo]
INTELIGÊNCIA
  🤖 IA           📚 Conhecimento
  🔁 Transferências  ⚡ Automações
  📷 Op. Instagram   📊 Métricas
GOVERNANÇA
  🚀 Lançamento   📜 Logs     ⚙ Configurações
─────────────────────────────────────
[card] Conta organizada — agency owner
```

**Topbar nova:** breadcrumb (ALTUM · Portal · Página · Operação em tempo real) + busca global ⌘/ + chips de modo (Essencial/Conforto/Modo claro) + chip usuário + Suporte + Sair.

Estado de collapse persistido em `localStorage`. Em mobile: drawer + bottom-nav existente.

## 2. Novas rotas (TanStack file-based)

Cada rota com `head()` próprio + `CRMLayout` + `CRMPageHeader`. Reaproveito hooks existentes (`useDashboard`, `usePipeline`, etc.) e adiciono os novos abaixo.

| Rota | Página | Origem dos dados |
|------|--------|-----------------|
| `/` | **Visão geral** (redesenhada como dashboard ALTUM) | KPIs reais + funil visual + leitura de hoje |
| `/conversas` | Inbox unificada (estilo image-10) | `crm_contacts` + notas/timeline |
| `/comercial` | Mesa comercial (image-14) | `crm_quotes` + agregados |
| `/captacao` | Formulários de captação (image-15) | nova tabela `crm_capture_forms` |
| `/campanhas` | Campanhas WhatsApp (image-16) | nova tabela `crm_campaigns` |
| `/ia` | Configuração de IA + guardrails | nova tabela `crm_ai_settings` |
| `/conhecimento` | Base de docs | nova tabela `crm_kb_docs` |
| `/transferencias` | Handoff IA→humano | nova tabela `crm_handoffs` |
| `/operacao-instagram` | Status Instagram | nova tabela `crm_channels` |
| `/metricas` | Métricas consolidadas | agregação dos dados |
| `/lancamento` | Checklist go-live | nova tabela `crm_launch_checklist` |
| `/logs` | Auditoria | leitura de `crm_contact_timeline` |
| `/configuracoes` | Perfil + preferências do portal | `profiles` + nova `crm_portal_prefs` |

Mantenho rotas atuais (`/inbox`, `/pipeline`, `/contatos`, `/agenda`, `/orcamentos`, `/retornos`, `/perdidos`, `/automacoes`, `/relatorios`) e renomeio labels do menu para casar com a referência (CRM = `/contatos`, Funil = `/pipeline`, Comercial = `/comercial`, Retornos = `/retornos`).

## 3. Banco — novas tabelas (todas com RLS `owner_id = auth.uid()`)

```sql
crm_capture_forms (id, owner_id, name, source, initial_stage, default_assignee,
  description, tags[], status, success_message, cta_label, launcher_label,
  initial_message, require_phone, require_email, collect_company,
  collect_message, submissions_count, created_at, updated_at)

crm_campaigns (id, owner_id, name, status, message, max_recipients,
  filters jsonb, last_run_at, runs_count, created_at, updated_at)

crm_ai_settings (id, owner_id, is_active, guardrails jsonb, tone, base_prompt,
  updated_at)

crm_kb_docs (id, owner_id, title, content, tags[], created_at, updated_at)

crm_handoffs (id, owner_id, contact_id, from_agent, to_user, reason, status,
  created_at, resolved_at)

crm_channels (id, owner_id, kind ('whatsapp'|'instagram'|'webchat'),
  status, config jsonb, last_sync_at)

crm_launch_checklist (id, owner_id, item, status, due_at, completed_at)

crm_portal_prefs (id, owner_id unique, ui_mode ('essencial'|'conforto'),
  theme ('dark'|'light'), sidebar_collapsed bool, updated_at)
```

Triggers: `tg_set_updated_at` em todas. RLS `ALL` por `owner_id`.

## 4. Design system (mantém base oklch atual)

Reaproveito tokens existentes (`--primary` laranja, `--gradient-primary`, `--success`, `glass-card`). Adiciono:
- `--ui-mode-essencial` / `--ui-mode-conforto` (controla densidade — gap, padding, font-scale via classe no `<html>`)
- `--theme-light` (modo claro): swap de `--background`, `--card`, `--foreground` em `.theme-light` no root
- Componentes novos: `SidebarGroup`, `SidebarItem`, `TopBarModeToggle`, `PortalAccountCard`, `ReadinessChip`, `MetricTile` (image-9 style)

## 5. Conectividade real (sem mocks)

- **Visão geral**: lê `useDashboard` (já existe) + agrega `crm_contacts` por stage para "Funil visual" + `crm_appointments`/`crm_followups` para "Agenda imediata".
- **Captação**: CRUD em `crm_capture_forms` + endpoint público `/api/public/capture/:formId` (server route) que insere `crm_contacts` com `owner_id` resolvido pelo form.
- **Campanhas**: CRUD em `crm_campaigns` + ação "Disparar" que abre WhatsApp em massa (links `wa.me`) iterando contatos filtrados.
- **Configurações**: salva `ui_mode`, `theme`, `sidebar_collapsed` em `crm_portal_prefs` (ou `localStorage` quando não logado).
- **Logs**: lista paginada de `crm_contact_timeline`.
- **Métricas**: agrega counts/valores de `crm_quotes`, `crm_contacts`, `crm_appointments`.

Todos os botões "Salvar", "Ativar", "Disparar", "Concluir item" chamam mutations React Query reais com toast de sucesso/erro.

## 6. UX — modos Essencial / Conforto / Claro

- **Essencial** (padrão da referência): esconde formulários avançados, mostra resumos + CTA "Abrir modo completo".
- **Conforto**: mostra todos os campos e tabelas detalhadas.
- **Modo claro**: aplica tema claro globalmente.

Toggle no topbar persiste em `crm_portal_prefs`.

## 7. Ordem de implementação

1. Migration com 8 novas tabelas + RLS + triggers.
2. Reescrita do `CRMLayout` (sidebar agrupada/expansível + topbar nova + theme/mode providers).
3. Página `/` Visão geral redesenhada (estilo image-9).
4. Páginas novas: `/comercial`, `/captacao`, `/campanhas` (criação + listagem real).
5. Páginas leves: `/ia`, `/conhecimento`, `/transferencias`, `/operacao-instagram`, `/metricas`, `/lancamento`, `/logs`, `/configuracoes`.
6. Endpoint público de captação (`/api/public/capture/$formId`).
7. Ajuste de labels e ordem do menu (CRM, Funil, Comercial).
8. QA: cada botão/card/menu testado clicando — modais, navegação, save, toasts.

Resultado: portal completo, navegação fluida, todas as ações funcionais e persistidas.
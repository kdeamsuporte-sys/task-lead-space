-- Capture forms (público de captação)
CREATE TABLE public.crm_capture_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  source text,
  initial_stage crm_stage NOT NULL DEFAULT 'novo_lead',
  default_assignee uuid,
  description text,
  tags text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'draft',
  success_message text DEFAULT 'Contato recebido com sucesso.',
  cta_label text DEFAULT 'Enviar',
  launcher_label text DEFAULT 'Abrir chat',
  initial_message text,
  require_phone boolean NOT NULL DEFAULT false,
  require_email boolean NOT NULL DEFAULT false,
  collect_company boolean NOT NULL DEFAULT false,
  collect_message boolean NOT NULL DEFAULT true,
  submissions_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_capture_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own capture forms" ON public.crm_capture_forms FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "public read active forms" ON public.crm_capture_forms FOR SELECT TO anon USING (status = 'active');
CREATE TRIGGER capture_forms_updated BEFORE UPDATE ON public.crm_capture_forms FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Campaigns (disparo segmentado)
CREATE TABLE public.crm_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'rascunho',
  message text NOT NULL DEFAULT '',
  max_recipients integer NOT NULL DEFAULT 50,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_run_at timestamptz,
  runs_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own campaigns" ON public.crm_campaigns FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER campaigns_updated BEFORE UPDATE ON public.crm_campaigns FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- AI Settings (1 por owner)
CREATE TABLE public.crm_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT false,
  guardrails jsonb NOT NULL DEFAULT '[]'::jsonb,
  tone text DEFAULT 'profissional',
  base_prompt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ai settings" ON public.crm_ai_settings FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER ai_settings_updated BEFORE UPDATE ON public.crm_ai_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- KB docs
CREATE TABLE public.crm_kb_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_kb_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own kb docs" ON public.crm_kb_docs FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER kb_docs_updated BEFORE UPDATE ON public.crm_kb_docs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Handoffs (transferências IA -> humano)
CREATE TABLE public.crm_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  contact_id uuid,
  from_agent text NOT NULL DEFAULT 'ia',
  to_user uuid,
  reason text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.crm_handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own handoffs" ON public.crm_handoffs FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Channels
CREATE TABLE public.crm_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'desconectado',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own channels" ON public.crm_channels FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER channels_updated BEFORE UPDATE ON public.crm_channels FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Launch checklist
CREATE TABLE public.crm_launch_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  item text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  due_at timestamptz,
  completed_at timestamptz,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_launch_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own launch checklist" ON public.crm_launch_checklist FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Portal preferences (1 por owner)
CREATE TABLE public.crm_portal_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  ui_mode text NOT NULL DEFAULT 'essencial',
  theme text NOT NULL DEFAULT 'dark',
  sidebar_collapsed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_portal_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own portal prefs" ON public.crm_portal_prefs FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER portal_prefs_updated BEFORE UPDATE ON public.crm_portal_prefs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
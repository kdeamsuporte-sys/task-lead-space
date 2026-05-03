
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enums
CREATE TYPE public.crm_stage AS ENUM ('novo_lead','aguardando_info','orcamento_enviado','followup','agendado','servico_realizado','pos_venda','perdido');
CREATE TYPE public.crm_priority AS ENUM ('baixa','media','alta','urgente');
CREATE TYPE public.crm_temperature AS ENUM ('frio','morno','quente');
CREATE TYPE public.crm_followup_status AS ENUM ('pendente','concluido','reagendado','cancelado');
CREATE TYPE public.crm_quote_status AS ENUM ('rascunho','enviado','visualizado','aguardando','aceito','recusado','expirado');
CREATE TYPE public.crm_appointment_status AS ENUM ('agendado','confirmado','realizado','cancelado','reagendado');
CREATE TYPE public.crm_task_status AS ENUM ('pendente','em_andamento','concluida','cancelada');

-- Contacts
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  source TEXT,
  service TEXT,
  neighborhood TEXT,
  city TEXT,
  stage public.crm_stage NOT NULL DEFAULT 'novo_lead',
  priority public.crm_priority NOT NULL DEFAULT 'media',
  temperature public.crm_temperature NOT NULL DEFAULT 'morno',
  potential_value NUMERIC(12,2),
  assignee_id UUID REFERENCES auth.users(id),
  next_step TEXT,
  next_step_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  notes TEXT,
  lost_reason TEXT,
  lost_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_contacts(owner_id);
CREATE INDEX ON public.crm_contacts(stage);
CREATE INDEX ON public.crm_contacts(temperature);
CREATE INDEX ON public.crm_contacts(priority);
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts" ON public.crm_contacts FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Notes
CREATE TABLE public.crm_contact_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_contact_notes(contact_id);
ALTER TABLE public.crm_contact_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.crm_contact_notes FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Timeline
CREATE TABLE public.crm_contact_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_contact_timeline(contact_id, created_at DESC);
ALTER TABLE public.crm_contact_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own timeline select" ON public.crm_contact_timeline FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own timeline insert" ON public.crm_contact_timeline FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- Followups
CREATE TABLE public.crm_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  priority public.crm_priority NOT NULL DEFAULT 'media',
  notes TEXT,
  status public.crm_followup_status NOT NULL DEFAULT 'pendente',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_followups(owner_id, scheduled_at);
CREATE INDEX ON public.crm_followups(contact_id);
ALTER TABLE public.crm_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own followups" ON public.crm_followups FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_followups FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Quotes
CREATE TABLE public.crm_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  deposit NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT,
  valid_until DATE,
  status public.crm_quote_status NOT NULL DEFAULT 'rascunho',
  observations TEXT,
  rejection_reason TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_quotes(owner_id, status);
CREATE INDEX ON public.crm_quotes(contact_id);
ALTER TABLE public.crm_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quotes" ON public.crm_quotes FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_quotes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Appointments
CREATE TABLE public.crm_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  service TEXT,
  address TEXT,
  notes TEXT,
  status public.crm_appointment_status NOT NULL DEFAULT 'agendado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_appointments(owner_id, scheduled_at);
CREATE INDEX ON public.crm_appointments(contact_id);
ALTER TABLE public.crm_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own appointments" ON public.crm_appointments FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_appointments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Tasks
CREATE TABLE public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  priority public.crm_priority NOT NULL DEFAULT 'media',
  status public.crm_task_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.crm_tasks(owner_id, due_at);
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.crm_tasks FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Automations
CREATE TABLE public.crm_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own automations" ON public.crm_automations FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_automations FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Lost reasons (catalog)
CREATE TABLE public.crm_lost_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_lost_reasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lost reasons" ON public.crm_lost_reasons FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Auto timeline on contact create
CREATE OR REPLACE FUNCTION public.tg_contact_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.crm_contact_timeline (owner_id, contact_id, event_type, description)
  VALUES (NEW.owner_id, NEW.id, 'contato_criado', 'Contato criado');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_contact_created AFTER INSERT ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.tg_contact_created();

-- Auto timeline on note insert
CREATE OR REPLACE FUNCTION public.tg_note_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.crm_contact_timeline (owner_id, contact_id, event_type, description, metadata)
  VALUES (NEW.owner_id, NEW.contact_id, 'nota_adicionada', 'Nota adicionada', jsonb_build_object('note_id', NEW.id, 'preview', left(NEW.body, 120)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_note_created AFTER INSERT ON public.crm_contact_notes FOR EACH ROW EXECUTE FUNCTION public.tg_note_created();

-- Auto timeline on stage / lost change
CREATE OR REPLACE FUNCTION public.tg_contact_updated()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    INSERT INTO public.crm_contact_timeline (owner_id, contact_id, event_type, description, metadata)
    VALUES (NEW.owner_id, NEW.id, 'etapa_alterada', 'Etapa: '||OLD.stage||' → '||NEW.stage, jsonb_build_object('from', OLD.stage, 'to', NEW.stage));
  END IF;
  IF NEW.priority IS DISTINCT FROM OLD.priority THEN
    INSERT INTO public.crm_contact_timeline (owner_id, contact_id, event_type, description)
    VALUES (NEW.owner_id, NEW.id, 'prioridade_alterada', 'Prioridade: '||NEW.priority);
  END IF;
  IF NEW.temperature IS DISTINCT FROM OLD.temperature THEN
    INSERT INTO public.crm_contact_timeline (owner_id, contact_id, event_type, description)
    VALUES (NEW.owner_id, NEW.id, 'temperatura_alterada', 'Temperatura: '||NEW.temperature);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_contact_updated AFTER UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.tg_contact_updated();

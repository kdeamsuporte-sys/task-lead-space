
ALTER TABLE public.crm_tasks ADD COLUMN IF NOT EXISTS sort_order double precision NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS crm_tasks_sort_order_idx ON public.crm_tasks (owner_id, sort_order);

-- Inicializa a ordenação por created_at para tarefas existentes
UPDATE public.crm_tasks t
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at DESC) AS rn
  FROM public.crm_tasks
) sub
WHERE t.id = sub.id AND t.sort_order = 0;

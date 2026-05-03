
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_contact_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_note_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_contact_updated() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.tg_set_updated_at() SET search_path = public;

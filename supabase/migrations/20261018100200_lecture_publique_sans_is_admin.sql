-- Le rôle anon n'a pas le droit d'appeler private.is_admin() : la lecture publique
-- ne doit pas en dépendre. Les parents lisent déjà tout via les règles *_admin_write (for all).
alter policy chapters_public_read on public.chapters
  using (status <> 'a_venir');

alter policy items_public_read on public.items
  using (exists (select 1 from public.chapters c where c.id = chapter_id and c.status <> 'a_venir'));

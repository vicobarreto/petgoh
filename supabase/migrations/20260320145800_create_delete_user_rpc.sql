CREATE OR REPLACE FUNCTION delete_user_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate that the calling user is an admin
  IF (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' THEN
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem excluir usuários.';
  END IF;
END;
$$;

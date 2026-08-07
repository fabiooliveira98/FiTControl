-- Remove somente triggers legados de auth.users que ainda dependem de profiles.
-- O FitControl mantem credenciais apenas em auth.users e nao usa public.profiles.

do $$
declare
  v_trigger record;
  v_total integer := 0;
begin
  for v_trigger in
    select trigger_info.tgname
    from pg_trigger as trigger_info
    join pg_class as tabela on tabela.oid = trigger_info.tgrelid
    join pg_namespace as schema_tabela on schema_tabela.oid = tabela.relnamespace
    join pg_proc as funcao on funcao.oid = trigger_info.tgfoid
    where schema_tabela.nspname = 'auth'
      and tabela.relname = 'users'
      and trigger_info.tgisinternal = false
      and pg_get_functiondef(funcao.oid) ilike '%profiles%'
  loop
    execute format('drop trigger if exists %I on auth.users', v_trigger.tgname);
    v_total := v_total + 1;
    raise notice 'Trigger legado removido de auth.users: %', v_trigger.tgname;
  end loop;

  if v_total = 0 then
    raise notice 'Nenhum trigger de auth.users dependente de profiles foi encontrado.';
  end if;
end;
$$;

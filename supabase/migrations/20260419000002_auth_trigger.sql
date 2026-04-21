-- Trigger to automatically create a parent record when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.parents (id, full_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
-- Note: auth.users is in a different schema, but we can create triggers on it if we have superuser/admin rights,
-- which Supabase Dashboard migrations do.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- We must also make sure the Parents table can be inserted into by this trigger.
-- Since the function is SECURITY DEFINER, it bypasses RLS, so it will successfully insert the parent record.

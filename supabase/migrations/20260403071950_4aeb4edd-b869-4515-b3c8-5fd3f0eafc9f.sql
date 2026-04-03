-- Remove the broad public SELECT policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Restore owner-only SELECT policy  
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Recreate view with security_invoker=false (SECURITY DEFINER behavior)
-- This is safe because the view explicitly excludes whatsapp_number
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
  WITH (security_invoker = false) AS
  SELECT user_id, name, avatar_url, location, shop_name,
         shop_description, is_verified, is_seller_mode
  FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
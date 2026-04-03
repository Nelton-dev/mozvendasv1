-- 1. Recreate public_profiles view as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
  WITH (security_invoker = true) AS
  SELECT user_id, name, avatar_url, location, shop_name,
         shop_description, is_verified, is_seller_mode
  FROM public.profiles;

-- Add public SELECT policy on profiles so the INVOKER view works for everyone
CREATE POLICY "Public can view basic profile info"
  ON public.profiles FOR SELECT TO public
  USING (true);

-- Drop the old owner-only SELECT policy since public access is now allowed
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 2. Fix conversations INSERT policy: restrict to authenticated only
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = buyer_id) AND (EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.user_id = conversations.seller_id
    ))
  );
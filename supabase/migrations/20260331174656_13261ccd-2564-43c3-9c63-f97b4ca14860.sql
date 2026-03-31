
-- 1. Create public_profiles view (no whatsapp_number, bypasses RLS)
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT user_id, name, avatar_url, is_verified, shop_name, shop_description, location, is_seller_mode
  FROM public.profiles;

-- 2. Create RPC to get seller WhatsApp (authenticated only)
CREATE OR REPLACE FUNCTION public.get_seller_whatsapp(p_seller_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT whatsapp_number FROM public.profiles WHERE user_id = p_seller_id;
$$;

-- 3. Restrict profiles SELECT to own profile only
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 4. Fix product-images storage INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

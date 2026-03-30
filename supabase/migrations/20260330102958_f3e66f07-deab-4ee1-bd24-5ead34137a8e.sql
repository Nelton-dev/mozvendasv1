
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS shop_description text,
  ADD COLUMN IF NOT EXISTS is_seller_mode boolean DEFAULT false;

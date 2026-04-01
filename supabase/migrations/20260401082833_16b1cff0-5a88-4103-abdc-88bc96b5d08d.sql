
-- OTP codes table for SMS verification
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can verify (edge function handles security)
CREATE POLICY "Service role only" ON public.otp_codes FOR ALL USING (false);

-- Account deletion requests table
CREATE TABLE public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  scheduled_deletion_at timestamp with time zone NOT NULL DEFAULT (now() + interval '3 days'),
  status text NOT NULL DEFAULT 'pending',
  cancelled_at timestamp with time zone
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests" ON public.account_deletion_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deletion requests" ON public.account_deletion_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own deletion requests" ON public.account_deletion_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Product videos table
CREATE TABLE public.product_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  views_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active videos" ON public.product_videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can create videos" ON public.product_videos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own videos" ON public.product_videos
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own videos" ON public.product_videos
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- Enable realtime for product_videos
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_videos;

-- Storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-videos', 'product-videos', true);

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-videos');

CREATE POLICY "Users can delete own videos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

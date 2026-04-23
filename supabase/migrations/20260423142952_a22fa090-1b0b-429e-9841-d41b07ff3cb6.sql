-- Add UPDATE policies for product-images and product-videos storage buckets
-- so users can only update files in their own folder

CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING ((bucket_id = 'product-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))
WITH CHECK ((bucket_id = 'product-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text));

CREATE POLICY "Users can update their own product videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING ((bucket_id = 'product-videos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))
WITH CHECK ((bucket_id = 'product-videos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text));
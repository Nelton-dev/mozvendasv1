-- 1) Restrict video_likes SELECT to authenticated users only
-- (was previously USING true / public — exposed user_id enumeration to anonymous visitors)
DROP POLICY IF EXISTS "Users can view all likes" ON public.video_likes;

CREATE POLICY "Authenticated users can view likes"
ON public.video_likes
FOR SELECT
TO authenticated
USING (true);

-- 2) Add WITH CHECK to the avatar UPDATE policy so users cannot swap an
-- avatar object to point at another user's folder after passing USING.
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))
WITH CHECK ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text));
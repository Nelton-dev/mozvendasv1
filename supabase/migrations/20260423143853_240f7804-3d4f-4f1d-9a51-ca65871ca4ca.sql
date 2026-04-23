-- 1) Enable RLS on realtime.messages and restrict to authenticated users.
-- Our app uses postgres_changes (already RLS-protected via public.messages),
-- not broadcast/presence on realtime.messages. We still lock it down to prevent
-- anonymous subscribers from receiving any broadcast traffic.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can receive realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- 2) Tighten video_likes SELECT policy — owner-only.
-- Aggregate counts come from product_videos.views_count / separate aggregations,
-- so per-user like rows do not need to be visible to other users.
DROP POLICY IF EXISTS "Authenticated users can view likes" ON public.video_likes;

CREATE POLICY "Users can view their own likes"
ON public.video_likes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

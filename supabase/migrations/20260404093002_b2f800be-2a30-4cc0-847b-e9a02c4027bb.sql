
-- Create video_likes table
CREATE TABLE public.video_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  video_id uuid NOT NULL REFERENCES public.product_videos(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON public.video_likes
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can like" ON public.video_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes" ON public.video_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add DELETE policy for conversations
CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE TO authenticated
  USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- Add DELETE policy for messages (when conversation is deleted)
CREATE POLICY "Users can delete messages in their conversations"
  ON public.messages FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Replace the overly-broad realtime SELECT policy on public.messages
-- with a scoped policy that only allows users to receive realtime updates
-- for conversations they participate in.

DROP POLICY IF EXISTS "Authenticated users can receive realtime" ON public.messages;

CREATE POLICY "Users can receive realtime for their conversations"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

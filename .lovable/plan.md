

## Plan: Address Remaining Security Findings

The fresh scan returned 7 findings. Here's how I propose to handle each — splitting into **fix**, **harden**, and **ignore (with justification)**.

### 1. Fix — Realtime channel authorization (ERROR)

`realtime.messages` has no RLS, so any authenticated user can subscribe to any conversation channel.

- Add RLS policies on `realtime.messages` scoping `SELECT` to topics the user actually participates in (look up the conversation by `topic` and check `buyer_id = auth.uid()` OR `seller_id = auth.uid()`).
- Ensure `realtime.messages` has RLS enabled.

### 2. Fix — Tighten `video_likes` SELECT (WARN)

Currently `USING (true)` for authenticated users — exposes per-user like activity.

- Drop the broad policy.
- Replace with: `auth.uid() = user_id` (users see only their own likes).
- Aggregate like counts on each video are already stored via `videos.likes_count`, so the feed UI is unaffected.

### 3. Harden — Profiles exposure guidance (WARN)

The finding flags risk that a future broad policy could leak `whatsapp_number`. Today, `profiles` is owner-only and a `public_profiles` view is used for public reads. This is already correctly designed.

- Verify `public_profiles` view excludes `whatsapp_number` and is the only public-facing surface.
- No code change required if confirmed; mark as **ignored** with rationale documenting the existing safe pattern.

### 4. Ignore — Security Definer View (ERROR, intentional)

`public_profiles` view is intentionally `SECURITY DEFINER` so anonymous browsers can see sanitized seller info without exposing `profiles` directly. This is the documented Lovable pattern for safe public profiles.

- Mark as ignored with explanation.

### 5. Ignore ×3 — Public bucket listing (WARN, intentional)

`product-images`, `product-videos`, `avatars` are public marketplace buckets — listing is acceptable since URLs are already public and content is meant to be discoverable.

- Mark all three as ignored with the same rationale.

### Files / Operations

| Item | Action |
|------|--------|
| New migration | RLS on `realtime.messages` scoped to conversation participants |
| Same migration | Replace `video_likes` SELECT policy with owner-only |
| Security findings | Mark Realtime + video_likes as fixed after migration |
| Security findings | Ignore: SECURITY DEFINER view, 3× public bucket listing, profiles WhatsApp warning |
| Re-scan | Run final security scan to confirm clean state |

### Technical Detail — Realtime RLS

```sql
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can subscribe to their own conversations"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = realtime.messages.topic
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);
```

(Topic naming in `useMessages.ts` will be verified to match `conversation.id` before applying.)


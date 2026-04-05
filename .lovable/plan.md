

## Plan: Client Account Restrictions, Reels Sound & Auth Guard

### Changes

**1. Hide "Anunciar" for non-seller accounts**

- **`src/components/BottomNav.tsx`**: Fetch `is_seller_mode` from the `profiles` table for the current user. If `false` or no user, filter out the "Anunciar" nav item entirely (4 items instead of 5).
- **`src/pages/AddProduct.tsx`**: Add a guard — fetch `is_seller_mode`, if not a seller, redirect to `/` with a toast warning.

**2. Reels: sound ON by default**

- **`src/pages/VideoReels.tsx`**: Change the `muted` state default from `true` to `false`.

**3. Reels: auth guard on like and message**

- **`src/pages/VideoReels.tsx`**: In the like handler, check if user exists — if not, show toast and redirect to `/auth`. Same for the message/chat button.

### Files to Edit

| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | Fetch `is_seller_mode`; conditionally exclude "Anunciar" |
| `src/pages/AddProduct.tsx` | Seller-only guard with redirect |
| `src/pages/VideoReels.tsx` | `muted` default `false`; auth guards on like & message |


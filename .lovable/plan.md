

## Plan: Client Account Restrictions, Reels Sound & Auth Guard

### Changes

**1. Hide "Anunciar" (create product) for non-seller accounts**

- **`src/components/BottomNav.tsx`**: Conditionally render the "Anunciar" button only when the user's profile has `is_seller_mode = true`. For clients (non-sellers), replace it with a neutral item or skip it entirely. This requires fetching the profile's `is_seller_mode` flag.
- **`src/pages/AddProduct.tsx`**: Add a guard at the top — if user is not a seller, redirect to home.

**2. Reels: sound ON by default**

- **`src/pages/VideoReels.tsx`**: Change `useState(true)` → `useState(false)` for the `muted` state (line 35). This makes videos play with sound enabled by default.

**3. Reels: require login to send message**

- **`src/pages/VideoReels.tsx`**: The Chat button (line 311) already redirects to `/auth` if no user. However, the like button does not guard for auth. Will add an auth check on like as well, and ensure the message button toast warns unauthenticated users.

### Files to Edit

| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | Fetch `is_seller_mode` from profiles; hide "Anunciar" for clients |
| `src/pages/VideoReels.tsx` | Set `muted` default to `false`; add auth guard on like button |
| `src/pages/AddProduct.tsx` | Add seller-only guard redirect |


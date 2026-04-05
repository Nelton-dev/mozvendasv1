

## Plan: Account Deletion 24h Countdown + SMS OTP Fix

### Problem Analysis

1. **Account deletion**: Currently uses 3-day grace period. User wants 24 hours with a live countdown timer.
2. **SMS OTP error**: The logs show `'From' +15005550006 is not a Twilio phone number`. The fallback number `+15005550006` is a Twilio test number that only works in test mode. The user needs to provide their real Twilio phone number, or we need to store it as a secret.

### Changes

**1. Change deletion period from 3 days to 24 hours**

- **DB Migration**: Alter the `account_deletion_requests` table default for `scheduled_deletion_at` from `now() + '3 days'` to `now() + '24 hours'`.
- **Edge Function** (`supabase/functions/manage-account-deletion/index.ts`): Update message text from "3 dias" to "24 horas".
- **Frontend** (`src/pages/AccountSettings.tsx`):
  - Update all "3 dias" references to "24 horas".
  - Add a live countdown timer using `setInterval` that updates every second, showing hours, minutes, and seconds remaining (e.g., "23h 45m 12s").
  - Display the countdown prominently in the deletion status card.

**2. Fix SMS OTP "From" number**

- The Twilio connector requires a valid "From" phone number (a number you purchased in Twilio). The current fallback `+15005550006` is a test-only number.
- **Add a secret** `TWILIO_FROM_NUMBER` for the user to input their real Twilio phone number.
- **Update** `supabase/functions/send-otp-sms/index.ts` to read `TWILIO_FROM_NUMBER` from env instead of using the hardcoded test fallback.

### Files to Edit

| File | Change |
|------|--------|
| DB Migration | Change `scheduled_deletion_at` default to `now() + '24 hours'` |
| `supabase/functions/manage-account-deletion/index.ts` | Update "3 dias" to "24 horas" in messages |
| `src/pages/AccountSettings.tsx` | Update text to "24 horas"; add live countdown with `setInterval` showing HH:MM:SS |
| `supabase/functions/send-otp-sms/index.ts` | Use `TWILIO_FROM_NUMBER` env var instead of hardcoded test number |
| New secret: `TWILIO_FROM_NUMBER` | User must provide their purchased Twilio phone number |

### Technical Details

- The countdown timer will use `useEffect` with a 1-second interval, computing the difference between `scheduled_deletion_at` and `Date.now()`, formatting as `XXh XXm XXs`.
- The interval clears on unmount or when deletion is cancelled.
- For the SMS fix, the user will be prompted to enter their Twilio phone number as a secret before the function can work.


ALTER TABLE public.account_deletion_requests 
ALTER COLUMN scheduled_deletion_at SET DEFAULT (now() + '24 hours'::interval);

-- Update existing pending requests to use the new shorter window
UPDATE public.account_deletion_requests
SET scheduled_deletion_at = requested_at + '24 hours'::interval
WHERE status = 'pending';
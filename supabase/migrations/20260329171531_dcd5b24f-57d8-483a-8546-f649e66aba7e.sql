
-- 1. Fix profiles UPDATE policy to prevent users from changing is_verified
DROP POLICY "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_verified IS NOT DISTINCT FROM (SELECT p.is_verified FROM profiles p WHERE p.user_id = auth.uid())
  );

-- 2. Fix conversations INSERT policy to validate seller_id exists in profiles
DROP POLICY "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (SELECT 1 FROM profiles WHERE user_id = seller_id)
  );

-- 3. Restrict profiles SELECT to authenticated users only
DROP POLICY "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Enable Realtime RLS authorization
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- ============================================================
-- ENSURE_RLS.sql
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- to add the missing RLS policies that block login from working.
--
-- Problem: Without a SELECT policy on public.users, the app
-- can't read the logged-in user's role after sign-in, which
-- causes fetchUserRole() to fail silently and the redirect
-- destination to default incorrectly.
-- ============================================================

-- 1. Ensure RLS is ON for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Allow each user to SELECT their own row
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 3. Allow each user to UPDATE their own row (for profile edits)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Allow the trigger (SECURITY DEFINER) to INSERT new user rows
--    This policy covers inserts from authenticated context;
--    the trigger uses SECURITY DEFINER so it bypasses RLS anyway,
--    but this is belt-and-braces.
DROP POLICY IF EXISTS "Service can insert users" ON public.users;
CREATE POLICY "Service can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- 5. Verify the policies were applied
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public'
ORDER BY policyname;

-- Expected output: at least 3 rows:
--   "Service can insert users"   | INSERT | true
--   "Users can update own profile" | UPDATE | (auth.uid() = id)
--   "Users can view own profile"   | SELECT | (auth.uid() = id)

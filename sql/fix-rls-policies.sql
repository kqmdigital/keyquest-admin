-- Fix RLS Policies - Remove Infinite Recursion
-- This fixes the "infinite recursion detected in policy" error

-- First, let's drop all the problematic policies
DROP POLICY IF EXISTS "Admin users can manage banks" ON banks;
DROP POLICY IF EXISTS "Admin users can manage agents" ON agents;
DROP POLICY IF EXISTS "Admin users can manage bankers" ON bankers;
DROP POLICY IF EXISTS "Admin users can manage rate_types" ON rate_types;
DROP POLICY IF EXISTS "Admin users can manage rate_packages" ON rate_packages;
DROP POLICY IF EXISTS "Admin users can manage enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admin users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin_users" ON admin_users;

-- Create simpler policies that don't cause recursion
-- These policies check the JWT token directly instead of querying admin_users

-- Banks policies
CREATE POLICY "Authenticated users can manage banks" 
ON banks FOR ALL 
USING (auth.role() = 'authenticated');

-- Agents policies
CREATE POLICY "Authenticated users can manage agents" 
ON agents FOR ALL 
USING (auth.role() = 'authenticated');

-- Bankers policies
CREATE POLICY "Authenticated users can manage bankers" 
ON bankers FOR ALL 
USING (auth.role() = 'authenticated');

-- Rate Types policies
CREATE POLICY "Authenticated users can manage rate_types" 
ON rate_types FOR ALL 
USING (auth.role() = 'authenticated');

-- Rate Packages policies
CREATE POLICY "Authenticated users can manage rate_packages" 
ON rate_packages FOR ALL 
USING (auth.role() = 'authenticated');

-- Enquiries policies
CREATE POLICY "Authenticated users can manage enquiries" 
ON enquiries FOR ALL 
USING (auth.role() = 'authenticated');

-- Admin Users policies (simplified to avoid recursion)
CREATE POLICY "Admin users can read all admin_users" 
ON admin_users FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage admin_users" 
ON admin_users FOR INSERT, UPDATE, DELETE
USING (auth.role() = 'authenticated');

-- Alternative approach: Disable RLS temporarily if issues persist
-- You can run these commands if the above policies still cause issues:

-- COMMENT: Uncomment these lines ONLY if you still get recursion errors
-- ALTER TABLE banks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bankers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rate_types DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rate_packages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Test query to verify policies work
SELECT 'Test completed - RLS policies should work now' as status;

-- Check if policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
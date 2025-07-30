-- Security Updates for Keyquest Admin Database
-- Run these commands to update your existing database with security enhancements

-- 1. Update admin_users table to support Supabase Auth
-- =====================================================

-- Add missing columns to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing admin users to be active
UPDATE admin_users SET is_active = true WHERE is_active IS NULL;

-- 2. Enhanced RLS Policies with better security
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users full access to banks" ON banks;
DROP POLICY IF EXISTS "Allow authenticated users full access to agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated users full access to bankers" ON bankers;
DROP POLICY IF EXISTS "Allow authenticated users full access to rate_types" ON rate_types;
DROP POLICY IF EXISTS "Allow authenticated users full access to rate_packages" ON rate_packages;
DROP POLICY IF EXISTS "Allow authenticated users full access to enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;

-- Create more secure policies that check admin_users table
CREATE POLICY "Admin users can manage banks" 
ON banks FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

CREATE POLICY "Admin users can manage agents" 
ON agents FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

CREATE POLICY "Admin users can manage bankers" 
ON bankers FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

CREATE POLICY "Admin users can manage rate_types" 
ON rate_types FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

CREATE POLICY "Admin users can manage rate_packages" 
ON rate_packages FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

CREATE POLICY "Admin users can manage enquiries" 
ON enquiries FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- Admin users can only read their own data and super_admins can read all
CREATE POLICY "Admin users can read admin_users" 
ON admin_users FOR SELECT 
USING (
    email = auth.jwt() ->> 'email' 
    OR 
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

-- Only super_admins can create/update/delete admin users
CREATE POLICY "Super admins can insert admin_users" 
ON admin_users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

CREATE POLICY "Super admins can update admin_users" 
ON admin_users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

CREATE POLICY "Super admins can delete admin_users" 
ON admin_users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

-- 3. Create function to create Supabase Auth user and admin record
-- ==============================================================

CREATE OR REPLACE FUNCTION create_admin_with_auth(
    user_email text,
    user_name text,
    user_role text DEFAULT 'admin'
)
RETURNS json AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Validate role
    IF user_role NOT IN ('super_admin', 'admin', 'editor') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid role specified'
        );
    END IF;
    
    -- Check if email already exists in admin_users
    IF EXISTS (SELECT 1 FROM admin_users WHERE email = user_email) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Admin user already exists'
        );
    END IF;
    
    -- Insert new admin user (without password_hash - will be handled by Supabase Auth)
    INSERT INTO admin_users (email, name, role, is_active)
    VALUES (user_email, user_name, user_role, true)
    RETURNING id INTO new_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Admin user created successfully. Please create the corresponding Supabase Auth user.',
        'user_id', new_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_admin_with_auth(text, text, text) TO authenticated;

-- 4. Create function to sync admin user status
-- ===========================================

CREATE OR REPLACE FUNCTION sync_admin_user_status(
    user_email text,
    is_active_status boolean
)
RETURNS json AS $$
BEGIN
    -- Update admin user status
    UPDATE admin_users 
    SET is_active = is_active_status,
        updated_at = NOW()
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Admin user not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Admin user status updated successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sync_admin_user_status(text, boolean) TO authenticated;

-- 5. Insert initial admin user if not exists
-- =========================================

INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('admin@keyquestmortgage.com.sg', 'Super Admin', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    role = 'super_admin',
    updated_at = NOW();

-- 6. Add additional security indexes
-- =================================

CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_email_active ON admin_users(email, is_active);

-- 7. Verification Query
-- ====================

SELECT 
    'admin_users' as table_name,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'super_admin') as super_admins
FROM admin_users;

-- SUCCESS! Security updates applied.
-- Next steps:
-- 1. Create a Supabase Auth user with email: admin@keyquestmortgage.com.sg
-- 2. Set a secure password in Supabase Auth dashboard
-- 3. Test login with the new secure authentication system
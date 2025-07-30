-- Step-by-step Security Updates
-- Run these one section at a time to avoid any issues

-- STEP 1: Update admin_users table structure
-- =========================================
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing admin users to be active
UPDATE admin_users SET is_active = true WHERE is_active IS NULL;

-- STEP 2: Drop old policies
-- ========================
DROP POLICY IF EXISTS "Allow authenticated users full access to banks" ON banks;
DROP POLICY IF EXISTS "Allow authenticated users full access to agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated users full access to bankers" ON bankers;
DROP POLICY IF EXISTS "Allow authenticated users full access to rate_types" ON rate_types;
DROP POLICY IF EXISTS "Allow authenticated users full access to rate_packages" ON rate_packages;
DROP POLICY IF EXISTS "Allow authenticated users full access to enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;

-- STEP 3: Create new secure policies for banks
-- ===========================================
CREATE POLICY "Admin users can manage banks" 
ON banks FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- STEP 4: Create new secure policies for agents
-- ============================================
CREATE POLICY "Admin users can manage agents" 
ON agents FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- STEP 5: Create new secure policies for bankers
-- ==============================================
CREATE POLICY "Admin users can manage bankers" 
ON bankers FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- STEP 6: Create new secure policies for rate_types
-- ================================================
CREATE POLICY "Admin users can manage rate_types" 
ON rate_types FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- STEP 7: Create new secure policies for rate_packages
-- ===================================================
CREATE POLICY "Admin users can manage rate_packages" 
ON rate_packages FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- STEP 8: Create new secure policies for enquiries
-- ===============================================
CREATE POLICY "Admin users can manage enquiries" 
ON enquiries FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);

-- STEP 9: Create admin_users policies
-- ==================================
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

-- STEP 10: Insert/update initial admin user
-- ========================================
INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('admin@keyquestmortgage.com.sg', 'Super Admin', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    role = 'super_admin',
    updated_at = NOW();

-- STEP 11: Add security indexes
-- ============================
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_email_active ON admin_users(email, is_active);

-- STEP 12: Verification
-- ====================
SELECT 
    'admin_users' as table_name,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'super_admin') as super_admins
FROM admin_users;
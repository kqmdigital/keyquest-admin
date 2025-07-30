-- Admin User Management Functions
-- Functions for super admin to manage other admin users

-- 1. Function to create a new admin user (only for super admin)
CREATE OR REPLACE FUNCTION create_admin_user(
    creator_email text,
    new_name text,
    new_email text,
    new_password text,
    new_role text DEFAULT 'admin'
)
RETURNS json AS $$
DECLARE
    creator_record admin_users%ROWTYPE;
    result json;
BEGIN
    -- Check if creator is super admin
    SELECT * INTO creator_record 
    FROM admin_users 
    WHERE email = creator_email AND role = 'super_admin' AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Unauthorized: Only super admin can create users'
        );
    END IF;
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM admin_users WHERE email = new_email) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Email already exists'
        );
    END IF;
    
    -- Insert new user
    INSERT INTO admin_users (name, email, password_hash, role, is_active, created_at)
    VALUES (
        new_name,
        new_email,
        hash_password(new_password),
        new_role,
        true,
        NOW()
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'User created successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Error creating user: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to reset user password (only for super admin)
CREATE OR REPLACE FUNCTION reset_user_password(
    admin_email text,
    target_email text,
    new_password text
)
RETURNS json AS $$
DECLARE
    admin_record admin_users%ROWTYPE;
    target_record admin_users%ROWTYPE;
BEGIN
    -- Check if admin is super admin
    SELECT * INTO admin_record 
    FROM admin_users 
    WHERE email = admin_email AND role = 'super_admin' AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Unauthorized: Only super admin can reset passwords'
        );
    END IF;
    
    -- Check if target user exists
    SELECT * INTO target_record 
    FROM admin_users 
    WHERE email = target_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Target user not found'
        );
    END IF;
    
    -- Prevent super admin from resetting their own password this way
    IF admin_email = target_email THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Cannot reset your own password using this method'
        );
    END IF;
    
    -- Update password
    UPDATE admin_users 
    SET 
        password_hash = hash_password(new_password),
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
    WHERE email = target_email;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Password reset successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Error resetting password: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to delete/deactivate user (only for super admin)
CREATE OR REPLACE FUNCTION deactivate_admin_user(
    admin_email text,
    target_email text
)
RETURNS json AS $$
DECLARE
    admin_record admin_users%ROWTYPE;
    target_record admin_users%ROWTYPE;
BEGIN
    -- Check if admin is super admin
    SELECT * INTO admin_record 
    FROM admin_users 
    WHERE email = admin_email AND role = 'super_admin' AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Unauthorized: Only super admin can deactivate users'
        );
    END IF;
    
    -- Check if target user exists
    SELECT * INTO target_record 
    FROM admin_users 
    WHERE email = target_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Target user not found'
        );
    END IF;
    
    -- Prevent super admin from deactivating themselves
    IF admin_email = target_email THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Cannot deactivate your own account'
        );
    END IF;
    
    -- Deactivate user
    UPDATE admin_users 
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE email = target_email;
    
    RETURN json_build_object(
        'success', true,
        'message', 'User deactivated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Error deactivating user: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to reactivate user (only for super admin)
CREATE OR REPLACE FUNCTION reactivate_admin_user(
    admin_email text,
    target_email text
)
RETURNS json AS $$
DECLARE
    admin_record admin_users%ROWTYPE;
    target_record admin_users%ROWTYPE;
BEGIN
    -- Check if admin is super admin
    SELECT * INTO admin_record 
    FROM admin_users 
    WHERE email = admin_email AND role = 'super_admin' AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Unauthorized: Only super admin can reactivate users'
        );
    END IF;
    
    -- Check if target user exists
    SELECT * INTO target_record 
    FROM admin_users 
    WHERE email = target_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Target user not found'
        );
    END IF;
    
    -- Reactivate user
    UPDATE admin_users 
    SET 
        is_active = true,
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
    WHERE email = target_email;
    
    RETURN json_build_object(
        'success', true,
        'message', 'User reactivated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Error reactivating user: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to get all admin users (only for super admin)
CREATE OR REPLACE FUNCTION get_admin_users(admin_email text)
RETURNS json AS $$
DECLARE
    admin_record admin_users%ROWTYPE;
    users_data json;
BEGIN
    -- Check if admin is super admin
    SELECT * INTO admin_record 
    FROM admin_users 
    WHERE email = admin_email AND role = 'super_admin' AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Unauthorized: Only super admin can view users'
        );
    END IF;
    
    -- Get all users (excluding password hash)
    SELECT json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'email', email,
            'role', role,
            'is_active', is_active,
            'created_at', created_at,
            'updated_at', updated_at,
            'last_login', last_login,
            'failed_login_attempts', failed_login_attempts,
            'locked_until', locked_until
        )
        ORDER BY created_at DESC
    ) INTO users_data
    FROM admin_users;
    
    RETURN json_build_object(
        'success', true,
        'data', users_data
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Error fetching users: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
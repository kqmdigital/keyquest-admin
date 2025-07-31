-- Authentication Functions for admin_users table
-- This file contains secure database functions for password-based authentication

-- 1. Create extension for password hashing (if not exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Main authentication function
CREATE OR REPLACE FUNCTION authenticate_admin(user_email text, user_password text)
RETURNS json AS $$
DECLARE
    user_record admin_users%ROWTYPE;
    result json;
BEGIN
    -- Check if user exists and is active
    SELECT * INTO user_record 
    FROM admin_users 
    WHERE email = user_email AND is_active = true;
    
    -- User not found or inactive
    IF NOT FOUND THEN
        -- Add delay to prevent timing attacks
        PERFORM pg_sleep(0.5);
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid credentials'
        );
    END IF;
    
    -- Check if account is locked
    IF user_record.locked_until IS NOT NULL AND user_record.locked_until > NOW() THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Account is temporarily locked. Please try again later.'
        );
    END IF;
    
    -- Verify password
    IF verify_password(user_password, user_record.password_hash) THEN
        -- Password correct - reset failed attempts
        UPDATE admin_users 
        SET failed_login_attempts = 0, 
            locked_until = NULL,
            last_login = NOW()
        WHERE id = user_record.id;
        
        -- Return success with user data (excluding password_hash)
        RETURN json_build_object(
            'success', true,
            'user', json_build_object(
                'id', user_record.id,
                'email', user_record.email,
                'name', user_record.name,
                'role', user_record.role,
                'last_login', user_record.last_login
            )
        );
    ELSE
        -- Password incorrect - increment failed attempts
        UPDATE admin_users 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
                WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
                ELSE locked_until
            END
        WHERE id = user_record.id;
        
        -- Add delay to prevent timing attacks
        PERFORM pg_sleep(0.5);
        
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid credentials'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to create admin user with hashed password
CREATE OR REPLACE FUNCTION create_admin_user(
    user_email text,
    user_name text,
    user_password text,
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
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM admin_users WHERE email = user_email) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Email already exists'
        );
    END IF;
    
    -- Insert new user
    INSERT INTO admin_users (email, name, password_hash, role)
    VALUES (user_email, user_name, hash_password(user_password), user_role)
    RETURNING id INTO new_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'User created successfully',
        'user_id', new_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to change password
CREATE OR REPLACE FUNCTION change_admin_password(
    user_id uuid,
    old_password text,
    new_password text
)
RETURNS json AS $$
DECLARE
    user_record admin_users%ROWTYPE;
BEGIN
    -- Get user record
    SELECT * INTO user_record 
    FROM admin_users 
    WHERE id = user_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
    -- Verify old password
    IF NOT verify_password(old_password, user_record.password_hash) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Current password is incorrect'
        );
    END IF;
    
    -- Update password
    UPDATE admin_users 
    SET password_hash = hash_password(new_password),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Password updated successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION authenticate_admin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password(uuid, text, text) TO authenticated;

-- 8. Create initial admin user (run this manually with your desired credentials)
-- SELECT create_admin_user('your-email@domain.com', 'Admin User', 'secure-password', 'super_admin');

-- 9. Test the authentication (run this manually to test)
-- SELECT authenticate_admin('your-email@domain.com', 'your-password');

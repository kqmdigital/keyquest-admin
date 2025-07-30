-- Fix Authentication Function
-- This will work with your existing password hashes

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS authenticate_admin(text, text);

-- Create updated authenticate_admin function that works with existing hashes
CREATE OR REPLACE FUNCTION authenticate_admin(user_email text, user_password text)
RETURNS json AS $$
DECLARE
    user_record admin_users%ROWTYPE;
    input_hash text;
    result json;
BEGIN
    -- Get user record
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
    
    -- Create hash of input password (simple SHA256 to match existing hashes)
    input_hash := encode(sha256(user_password::bytea), 'hex');
    
    -- Verify password (check both bcrypt and simple hash formats)
    IF user_record.password_hash = input_hash OR 
       (user_record.password_hash LIKE '$2%' AND crypt(user_password, user_record.password_hash) = user_record.password_hash) THEN
        
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
                'last_login', NOW()
            )
        );
    ELSE
        -- Password incorrect - increment failed attempts
        UPDATE admin_users 
        SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
            locked_until = CASE 
                WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION authenticate_admin(text, text) TO anon, authenticated;

-- Test the function with one of your users (replace with actual password)
-- SELECT authenticate_admin('digital@keyquestmortgage.com.sg', 'your_actual_password');

-- Check current admin users
SELECT email, name, role, is_active, failed_login_attempts, locked_until 
FROM admin_users 
WHERE is_active = true 
ORDER BY email;
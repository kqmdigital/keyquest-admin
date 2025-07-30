# 🔐 Authentication Setup Guide

## Overview
Your authentication system has been updated to use the custom `admin_users` table with password hashing instead of Supabase's built-in auth system.

## ✅ What Was Updated

### 1. **Enhanced Login Page UI**
- Modern gradient background with glass-morphism effects
- Smooth animations and improved user experience
- Better visual feedback for form validation

### 2. **Custom Authentication System** 
- Updated to use your `admin_users` table with `password_hash` field
- Secure password hashing using PostgreSQL's `pgcrypto` extension
- Session management with localStorage (24-hour expiry)
- Account lockout after 5 failed attempts (15-minute cooldown)

### 3. **Security Features**
- Bcrypt password hashing with salt
- Timing attack protection
- Failed login attempt tracking
- Account lockout mechanism
- Secure database functions

## 🛠 Setup Instructions

### Step 1: Run Database Functions
Execute the SQL functions in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of auth-functions.sql
-- This creates the authentication functions and password hashing capabilities
```

### Step 2: Create Admin User
Run this command in your Supabase SQL Editor to create your first admin:

```sql
SELECT create_admin_user(
    'admin@keyquestmortgage.com.sg',  -- Email
    'Admin User',                      -- Name  
    'your_secure_password_here',       -- Password
    'super_admin'                      -- Role
);
```

### Step 3: Test Authentication
Test the login function:

```sql
SELECT authenticate_admin('admin@keyquestmortgage.com.sg', 'your_secure_password_here');
```

## 🔧 Configuration Files Updated

### `config/supabase.js`
- ✅ Updated `AuthService` class to use custom authentication
- ✅ Added session management with localStorage
- ✅ Added security features (account lockout, timing protection)

### `login.html`
- ✅ Enhanced UI with modern design
- ✅ Updated to work with new authentication system
- ✅ Improved error handling and user feedback

### `index.html`
- ✅ Updated authentication checks
- ✅ Updated sign-out functionality
- ✅ Updated user display from session data

## 🔒 Security Features

### Password Security
- **Bcrypt hashing** with automatic salt generation
- **Secure storage** of password hashes in database
- **No plaintext passwords** ever stored or transmitted

### Account Protection
- **Failed login tracking** - counts failed attempts per user
- **Account lockout** - 15-minute cooldown after 5 failed attempts
- **Timing attack protection** - consistent response times
- **Session expiry** - 24-hour automatic logout

### Database Security
- **RLS (Row Level Security)** enabled on admin_users table
- **Secure functions** using `SECURITY DEFINER`
- **Minimal permissions** for database operations

## 🧪 Testing the System

1. **Create Admin User**: Use the SQL command above
2. **Test Login**: Try logging in with correct credentials
3. **Test Security**: Try wrong password (should increment failed attempts)
4. **Test Lockout**: Try 5 wrong passwords (should lock account)
5. **Test Session**: Login and refresh page (should stay logged in)
6. **Test Logout**: Use sign out button (should clear session)

## 🚀 Default Credentials
After running the setup, you can login with:
- **Email**: admin@keyquestmortgage.com.sg  
- **Password**: (whatever you set in the create_admin_user function)

## 📋 Next Steps

1. **Run the database functions** (`auth-functions.sql`)
2. **Create your admin user** with the SQL command
3. **Test the login process**
4. **Update the default credentials** to your preferred ones
5. **Add more admin users** as needed using the `create_admin_user` function

## 🔄 Migration from Old System

The old Supabase auth system has been completely replaced. All authentication now goes through:
- Custom `admin_users` table
- Password hash verification
- Local session storage
- Secure database functions

Your enhanced login page now works with this secure, custom authentication system!
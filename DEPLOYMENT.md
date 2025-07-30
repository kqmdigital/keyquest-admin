# 🚀 Keyquest Admin Deployment Guide

## Pre-Deployment Security Checklist ✅

- [x] **Hard-coded credentials removed** - Environment variables implemented
- [x] **XSS vulnerabilities fixed** - SecurityUtils implemented
- [x] **Authentication enhanced** - Supabase Auth integration
- [x] **Input validation added** - Form validation with sanitization
- [x] **Database security improved** - Enhanced RLS policies
- [x] **Rate limiting implemented** - Login attempt protection
- [x] **Secure session management** - Encrypted storage with expiration

## 📋 Deployment Steps for Render

### 1. Database Setup (Supabase)

1. **Run security updates in Supabase SQL Editor:**
   ```sql
   -- Copy and paste contents of sql/security-updates.sql
   ```

2. **Create Supabase Auth User:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Create user"
   - Email: `admin@keyquestmortgage.com.sg`
   - Set a secure password (NOT admin123!)
   - Confirm email if required

3. **Verify admin_users table:**
   ```sql
   SELECT * FROM admin_users WHERE email = 'admin@keyquestmortgage.com.sg';
   ```

### 2. Render Deployment

1. **Connect your GitHub repository to Render**

2. **Create a new Static Site:**
   - Name: `keyquest-admin`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Set Environment Variables in Render:**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_NAME=Keyquest Mortgage Admin
   VITE_SESSION_TIMEOUT=3600000
   VITE_MAX_LOGIN_ATTEMPTS=5
   ```

4. **Deploy**
   - Push changes to your GitHub repository
   - Render will automatically build and deploy

### 3. Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in your Supabase credentials in .env**

4. **Run development server:**
   ```bash
   npm run dev
   ```

## 🔒 Security Configuration

### Content Security Policy (CSP)
The render.yaml includes a strict CSP header:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self'
```

### Security Headers Applied:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🚨 Post-Deployment Security Tasks

### Immediate Actions:
1. **Change default admin password** in Supabase Auth
2. **Test login functionality** thoroughly
3. **Verify all pages load** without console errors
4. **Test rate limiting** by attempting multiple failed logins
5. **Check browser developer tools** for any security warnings

### Ongoing Security:
1. **Regular dependency updates**
2. **Monitor Supabase logs** for suspicious activity
3. **Rotate credentials** periodically
4. **Review and update RLS policies** as needed

## 🔧 Troubleshooting

### Common Issues:

1. **Login fails with "Admin access required":**
   - Verify admin_users table has your email
   - Check is_active = true in admin_users
   - Ensure Supabase Auth user exists with same email

2. **Environment variables not loading:**
   - Verify VITE_ prefix on all variables
   - Check Render environment variable settings
   - Restart deployment after adding variables

3. **Build fails:**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json
   - Check build logs for specific errors

4. **Database connection issues:**
   - Verify Supabase URL and key
   - Check RLS policy permissions
   - Test database connection in Supabase dashboard

## 📊 Performance Monitoring

After deployment, monitor:
- Page load times
- Database query performance
- Authentication success rates
- Error rates in browser console

## 🛡️ Security Monitoring

Watch for:
- Multiple failed login attempts
- Unusual database query patterns
- Console errors related to authentication
- HTTPS certificate issues

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase dashboard for database issues
3. Check Render deployment logs
4. Verify all environment variables are set correctly

---

**🎉 Your Keyquest Admin Panel is now secure and ready for production!**
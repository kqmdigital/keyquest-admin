#!/bin/bash

echo "========================================"
echo " KEYQUEST ADMIN - Security Updates"
echo "========================================"
echo

echo "1. Adding all new and modified files..."
git add .

echo
echo "2. Creating commit with security updates..."
git commit -m "🔒 Security updates for production deployment

✅ Critical security fixes:
- Remove hard-coded credentials (use environment variables)
- Implement proper Supabase Auth integration
- Add XSS protection with input sanitization
- Enhance database security with improved RLS policies
- Add rate limiting for login attempts
- Implement secure session management

✅ Production ready:
- Vite build configuration
- Render deployment config with security headers
- Environment variable system
- Comprehensive deployment guide

🛡️ Security improvements:
- SecurityUtils class for input validation
- Enhanced authentication flow
- Secure storage with expiration
- Content Security Policy headers
- SQL injection prevention
- Admin privilege verification

🚀 Generated with Claude Code"

echo
echo "3. Pushing to GitHub..."
git push origin main

echo
echo "========================================"
echo " DEPLOYMENT COMPLETE!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Render will automatically build and deploy"
echo "2. Test the application at your Render URL"
echo "3. Verify login functionality"
echo
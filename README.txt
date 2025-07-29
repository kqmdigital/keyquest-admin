# Keyquest Mortgage Admin Panel

A comprehensive admin panel for managing mortgage rates, banks, agents, bankers, and customer enquiries.

## 🚀 Features

- **Dashboard** - Real-time statistics and overview
- **Rate Package Management** - Complete CRUD for loan packages
- **Rate Types** - Interest rate management
- **Banks Management** - Bank directory
- **Bankers Management** - Banker profiles with access control
- **Agents Management** - Mortgage agent directory
- **Enquiry Management** - Customer inquiry tracking
- **Authentication** - Secure login/logout
- **Responsive Design** - Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide Icons
- **Deployment**: Render (Static Site)

## 📋 Prerequisites

1. **Supabase Account** - [Create account](https://supabase.com)
2. **GitHub Account** - For version control
3. **Render Account** - For deployment

## 🔧 Setup Instructions

### 1. Supabase Database Setup

1. Create a new Supabase project
2. Go to SQL Editor and run the database schema (see below)
3. Get your API keys from Settings → API

### 2. Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create tables (see full schema in setup guide)
CREATE TABLE banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all other tables...
-- (Full schema provided in documentation)
```

### 3. Configuration

1. Update `config/supabase.js` with your Supabase credentials:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
};
```

### 4. Authentication Setup

1. In Supabase Dashboard → Authentication → Settings
2. Set Site URL: `https://your-app.onrender.com`
3. Add redirect URLs if needed

### 5. Deployment on Render

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Connect repository to Render

2. **Configure Render Settings**
   - **Build Command**: Leave empty (static site)
   - **Publish Directory**: `.` (root)
   - **Environment**: Static Site

3. **Environment Variables** (if using)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

## 🔑 Default Login Credentials

```
Email: admin@keyquestmortgage.com.sg
Password: admin123
```

*Note: Change these credentials in production*

## 📁 File Structure

```
keyquest-admin/
├── index.html              # Dashboard (main page)
├── login.html               # Authentication page
├── rate-packages.html       # Rate packages management
├── rate-types.html          # Rate types management
├── banks.html               # Banks management
├── bankers.html             # Bankers management
├── agents.html              # Agents management
├── enquiry.html             # Enquiry management
├── config/
│   └── supabase.js          # Database configuration
└── README.md                # This file
```

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authentication required** for all admin pages
- **HTTPS only** in production
- **Input validation** and sanitization
- **CSRF protection** via Supabase

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, mobile
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages
- **Success Notifications** - Confirmation messages
- **Modern Interface** - Clean, professional design

## 🔄 API Integration

The system uses Supabase JavaScript client for all database operations:

```javascript
// Example usage
const { data, error } = await supabaseClient
  .from('banks')
  .select('*')
  .order('name');
```

## 📊 Database Tables

1. **banks** - Bank directory
2. **agents** - Mortgage agents
3. **bankers** - Bankers with access control
4. **rate_types** - Interest rate types
5. **rate_packages** - Complete loan packages
6. **enquiries** - Customer inquiries
7. **admin_users** - Admin authentication

## 🛡️ Production Checklist

- [ ] Update Supabase credentials
- [ ] Enable RLS policies
- [ ] Change default admin password
- [ ] Configure CORS settings
- [ ] Set up backup strategy
- [ ] Enable monitoring/logging
- [ ] Test all functionality
- [ ] Deploy to Render

## 🐛 Troubleshooting

### Authentication Issues
- Check Supabase URL and keys
- Verify Site URL in Supabase settings
- Clear browser cache/cookies

### Database Errors
- Ensure RLS policies are configured
- Check table permissions
- Verify data types match schema

### Deployment Issues
- Check build logs in Render
- Verify all files are committed to Git
- Ensure static site configuration

## 📞 Support

For technical support or questions:
- Create an issue in GitHub repository
- Check Supabase documentation
- Review Render deployment logs

## 📄 License

This project is proprietary software for Keyquest Mortgage.

---

**Deployed Successfully!** 🎉

Your admin panel should now be live and fully functional with authentication, real-time data, and all CRUD operations working seamlessly.

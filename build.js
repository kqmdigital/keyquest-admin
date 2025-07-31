#!/usr/bin/env node

// build.js - Clean environment variable injection for Render deployment
const fs = require('fs');

console.log('🚀 Starting secure build process...');

// Get environment variables from Render
const envVars = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_NAME: process.env.VITE_APP_NAME || 'Keyquest Mortgage Admin',
    VITE_MAX_LOGIN_ATTEMPTS: process.env.VITE_MAX_LOGIN_ATTEMPTS || '5',
    VITE_SESSION_TIMEOUT: process.env.VITE_SESSION_TIMEOUT || '3600000'
};

console.log('📋 Environment variables loaded:');
Object.entries(envVars).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? (key.includes('KEY') ? '***HIDDEN***' : value) : '❌ MISSING'}`);
});

// Validate critical environment variables
if (!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ Critical environment variables missing!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render dashboard');
    process.exit(1);
}

// Replace placeholders directly in supabase.js
try {
    console.log('🔧 Injecting environment variables into config/supabase.js...');
    
    let supabaseContent = fs.readFileSync('config/supabase.js', 'utf8');
    
    // Replace the placeholders with actual values
    supabaseContent = supabaseContent.replace(
        "'{{RENDER_SUPABASE_URL}}'", 
        JSON.stringify(envVars.VITE_SUPABASE_URL)
    );
    supabaseContent = supabaseContent.replace(
        "'{{RENDER_SUPABASE_ANON_KEY}}'", 
        JSON.stringify(envVars.VITE_SUPABASE_ANON_KEY)
    );
    
    fs.writeFileSync('config/supabase.js', supabaseContent, 'utf8');
    console.log('✅ Environment variables injected successfully');
    
} catch (error) {
    console.error('❌ Failed to inject environment variables:', error.message);
    process.exit(1);
}

console.log('✅ Build process completed successfully!');
console.log('🔒 Secure credentials injected at build time');
#!/usr/bin/env node

// build.js - Create environment configuration file for Render deployment
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

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

// Create the environment configuration file
const configContent = `// config/env.js - Environment configuration generated at build time
// This file is generated automatically by build.js - DO NOT EDIT MANUALLY

// Environment variables injected by Render build process
window.ENV_CONFIG = {
    SUPABASE_URL: ${JSON.stringify(envVars.VITE_SUPABASE_URL)},
    SUPABASE_ANON_KEY: ${JSON.stringify(envVars.VITE_SUPABASE_ANON_KEY)},
    APP_NAME: ${JSON.stringify(envVars.VITE_APP_NAME)},
    MAX_LOGIN_ATTEMPTS: ${parseInt(envVars.VITE_MAX_LOGIN_ATTEMPTS)},
    SESSION_TIMEOUT: ${parseInt(envVars.VITE_SESSION_TIMEOUT)}
};

// Debug logging
console.log('🔧 Environment configuration loaded:', {
    SUPABASE_URL: window.ENV_CONFIG.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_ANON_KEY: window.ENV_CONFIG.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    APP_NAME: window.ENV_CONFIG.APP_NAME
});

console.log('✅ Build-time environment configuration ready');
`;

// Write the configuration file
try {
    fs.writeFileSync('config/env.js', configContent, 'utf8');
    console.log('✅ Created config/env.js with environment variables');
} catch (error) {
    console.error('❌ Failed to create config/env.js:', error.message);
    process.exit(1);
}

console.log('✅ Build process completed successfully!');
console.log('🔒 Environment configuration file created with secure credentials');
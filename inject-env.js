// Environment variable injection script for browser compatibility
// This script will be run during build to inject environment variables

const fs = require('fs');
const path = require('path');

// Get environment variables
const env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_SESSION_TIMEOUT: process.env.VITE_SESSION_TIMEOUT || '3600000',
    VITE_MAX_LOGIN_ATTEMPTS: process.env.VITE_MAX_LOGIN_ATTEMPTS || '5'
};

// Create environment script
const envScript = `
// Environment variables injected at build time
window._env_ = ${JSON.stringify(env, null, 2)};
`;

// Write to env.js file
fs.writeFileSync(path.join(__dirname, 'env.js'), envScript);

console.log('Environment variables injected successfully');
console.log('Environment:', env);
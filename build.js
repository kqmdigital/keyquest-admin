#!/usr/bin/env node

// build.js - Inject environment variables into HTML files for Render deployment
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

// Function to inject environment variables into HTML content
const injectEnvVars = (content) => {
    // Create the environment injection script
    const envScript = `
    <script>
        // Environment variables injected at build time by Render
        ${Object.entries(envVars).map(([key, value]) => 
            `window.${key} = ${JSON.stringify(value)};`
        ).join('\n        ')}
        
        console.log('🔧 Environment variables loaded:', {
            VITE_SUPABASE_URL: window.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
            VITE_SUPABASE_ANON_KEY: window.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
            VITE_APP_NAME: window.VITE_APP_NAME
        });
    </script>`;
    
    // Inject before the first script tag
    return content.replace(
        /(<script[^>]*>)/i,
        `${envScript}\n    $1`
    );
};

// Get all HTML files in the current directory
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.startsWith('_')); // Exclude any template files

console.log(`📄 Processing ${htmlFiles.length} HTML files...`);

// Process each HTML file
htmlFiles.forEach(file => {
    try {
        console.log(`   Processing: ${file}`);
        
        // Read the original file
        const originalContent = fs.readFileSync(file, 'utf8');
        
        // Inject environment variables
        const processedContent = injectEnvVars(originalContent);
        
        // Write back to the same file
        fs.writeFileSync(file, processedContent, 'utf8');
        
        console.log(`   ✅ Updated: ${file}`);
    } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error.message);
        process.exit(1);
    }
});

console.log('✅ Build process completed successfully!');
console.log('🔒 All sensitive credentials are now environment-based');
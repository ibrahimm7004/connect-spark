#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Networking MVP...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here

# Optional: OpenAI API Key for future features
VITE_OPENAI_API_KEY=your_openai_api_key_here
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created! Please update it with your Supabase credentials.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies already installed.\n');
}

console.log('🎯 Next steps:');
console.log('1. Update .env file with your Supabase credentials');
console.log('2. Run: npm install');
console.log('3. Set up your Supabase database using DATABASE_SCHEMA.md');
console.log('4. Run: npm run dev');
console.log('\n📚 For detailed instructions, see setup.md');

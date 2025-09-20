# 🚀 Quick Installation Guide

## Option 1: Automatic Setup (Windows)
1. Double-click `install.bat`
2. Follow the prompts

## Option 2: Manual Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a file named `.env` in the root directory with this content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here

# Optional: OpenAI API Key for future features
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_KEY`

### 4. Set up Database
1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the entire contents of `DATABASE_SCHEMA.md`
3. Click "Run" to create all tables and policies

### 5. Start the App
```bash
npm run dev
```

## 🧪 Test the App
1. Open http://localhost:3000
2. Sign up for a new account
3. Try joining an event with code: `1234`

## 📚 Full Documentation
See `SETUP_GUIDE.md` for detailed instructions.

## ❓ Need Help?
- Check browser console for errors
- Verify your .env file has correct Supabase credentials
- Make sure database schema was created successfully

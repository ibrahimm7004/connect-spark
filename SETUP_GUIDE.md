# 🚀 Complete Setup Guide

## Prerequisites
- Node.js 16+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Database

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/login with GitHub
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - Name: `networking-mvp`
   - Database Password: (generate a strong password)
   - Region: Choose closest to you
7. Click "Create new project"

#### Step 2: Set up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `DATABASE_SCHEMA.md`
4. Click "Run" to execute all SQL commands
5. Verify tables were created in **Table Editor**

#### Step 3: Configure Authentication
1. Go to **Authentication** > **Settings**
2. Enable **Email** provider
3. For LinkedIn OAuth (optional):
   - Go to **Authentication** > **Providers**
   - Enable **LinkedIn**
   - Add your LinkedIn app credentials

#### Step 4: Set up Row Level Security
1. Go to **Authentication** > **Policies**
2. Enable RLS on all tables:
   - users
   - events  
   - event_attendees
   - connections
3. The policies from `DATABASE_SCHEMA.md` should already be applied

### 3. Configure Environment Variables

#### Option A: Use the setup script
```bash
npm run setup
```

#### Option B: Create .env manually
Create a `.env` file in the root directory:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here

# Optional: OpenAI API Key for future features
VITE_OPENAI_API_KEY=your-openai-key-here
```

**How to find your Supabase credentials:**
1. In Supabase dashboard, go to **Settings** > **API**
2. Copy the **Project URL** → `VITE_SUPABASE_URL`
3. Copy the **anon public** key → `VITE_SUPABASE_KEY`

### 4. Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the Application

### Test User Registration
1. Go to `/signup`
2. Create a new account
3. Complete the onboarding flow
4. You should be redirected to the home page

### Test Event Joining
1. On the home page, click "Join Event"
2. Use one of these test codes:
   - `1234` - Tech Networking Meetup
   - `5678` - Marketing Mixer
   - `9012` - Startup Pitch Night

### Test Connections
1. Create a second user account
2. Go to `/connections`
3. Send connection requests between users
4. Accept/reject requests

## 🔧 Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
- Check your `.env` file exists
- Verify the variable names are correct
- Make sure there are no spaces around the `=` sign

#### "Failed to load user profile"
- Check your Supabase URL and key
- Verify the database schema was created
- Check browser console for specific errors

#### "Invalid event code"
- Make sure you're using the correct test codes
- Check that sample data was inserted
- Verify the events table has data

#### Authentication not working
- Check Supabase authentication settings
- Verify RLS policies are enabled
- Check browser console for auth errors

### Getting Help

1. **Check the console**: Open browser dev tools (F12) and look for errors
2. **Verify Supabase**: Check your Supabase dashboard for any issues
3. **Check environment**: Ensure all environment variables are set
4. **Database schema**: Verify all tables and policies were created

## 📁 Project Structure

```
intro/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # External service configs
│   ├── pages/         # Page components
│   └── ...
├── .env               # Environment variables (create this)
├── package.json       # Dependencies and scripts
├── DATABASE_SCHEMA.md # Database setup instructions
└── SETUP_GUIDE.md    # This file
```

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Netlify
1. Run `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Look at the browser console for errors
3. Verify your Supabase setup
4. Check the GitHub issues (if applicable)

---

**Happy coding! 🎉**

# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to the SQL Editor
3. Copy and paste the entire contents of `DATABASE_SCHEMA.md` and run it
4. Go to Authentication > Settings and enable:
   - Email provider
   - LinkedIn OAuth provider (configure with your LinkedIn app credentials)
5. Go to Authentication > URL Configuration and add your localhost URL

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key_optional
```

You can find these values in your Supabase project settings.

## 4. Start Development Server

```bash
npm run dev
```

## 5. Test the Application

1. Open http://localhost:3000
2. Try signing up with a new account
3. Complete the onboarding flow
4. Test joining an event with code "1234" (from sample data)
5. Test the connection features

## Sample Event Codes

The database schema includes sample events with these codes:
- 1234 - Tech Networking Meetup
- 5678 - Marketing Mixer  
- 9012 - Startup Pitch Night

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your environment variables
2. **Authentication not working**: Ensure RLS policies are set up correctly
3. **Build errors**: Make sure all dependencies are installed with `npm install`

### Getting Help

- Check the console for error messages
- Verify your Supabase project is active
- Ensure all environment variables are set correctly
- Check that the database schema was created successfully

# Networking MVP

A modern networking platform built with React and Supabase that allows professionals to connect, join events, and build meaningful relationships.

## Features

- **User Authentication**: Email/password and LinkedIn OAuth
- **Event Management**: Join events via QR code or 4-digit codes
- **Professional Networking**: Send, accept, and manage connection requests
- **Profile Management**: Comprehensive user profiles with skills and interests
- **Real-time Updates**: Live connection status and event updates
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL commands from `DATABASE_SCHEMA.md` in your Supabase SQL editor
   - Enable Row Level Security and configure policies
   - Set up authentication providers (email/password and LinkedIn OAuth)

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_KEY=your_supabase_anon_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
intro/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.jsx
│   ├── lib/                # External service configurations
│   │   └── supabaseClient.js
│   ├── pages/              # Page components
│   │   ├── IntroPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── SignupQuestionsPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── JoinEventPage.jsx
│   │   ├── EventFeedbackPage.jsx
│   │   ├── ConnectionsPage.jsx
│   │   ├── MyProfilePage.jsx
│   │   ├── UserProfilePage.jsx
│   │   └── WhyJoinPage.jsx
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── figma_screens/          # Design references
├── DATABASE_SCHEMA.md      # Database setup instructions
└── README.md              # This file
```

## Pages

1. **Intro Page** (`/`) - Landing page with features and CTA
2. **Signup Page** (`/signup`) - User registration and login
3. **Signup Questions** (`/signup-questions`) - Profile onboarding
4. **Home Page** (`/home`) - Dashboard with events and quick actions
5. **Join Event** (`/join-event`) - Join events via QR code or 4-digit code
6. **Event Feedback** (`/event-feedback/:eventId`) - Rate and review events
7. **Connections** (`/connections`) - Manage professional connections
8. **My Profile** (`/my-profile`) - Edit personal profile
9. **User Profile** (`/user-profile/:userId`) - View other user profiles
10. **Why Join** (`/why-join`) - Benefits and testimonials

## Key Features

### Authentication
- Email/password registration and login
- LinkedIn OAuth integration
- Protected routes and session management
- Profile creation and onboarding flow

### Event Management
- Join events using 4-digit codes
- QR code scanning (placeholder for future implementation)
- View event attendees and details
- Event feedback and rating system

### Networking
- Send connection requests to other users
- Accept/reject incoming requests
- View connection status and manage network
- Profile viewing and discovery

### User Profiles
- Comprehensive profile management
- Skills, interests, and professional information
- Bio and location details
- Profile editing and updates

## Database Schema

The application uses the following main tables:

- **users**: User profile information
- **events**: Event details and metadata
- **event_attendees**: Many-to-many relationship between users and events
- **connections**: Connection requests and status between users

See `DATABASE_SCHEMA.md` for detailed schema and setup instructions.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Use TypeScript-style prop validation

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Netlify
3. Set environment variables in Netlify dashboard

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_KEY` | Your Supabase anon key | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for future features | No |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@networking-mvp.com or create an issue in the repository.

## Roadmap

- [ ] QR code scanning functionality
- [ ] Real-time notifications
- [ ] Event creation (admin feature)
- [ ] Advanced search and filtering
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Integration with calendar apps
- [ ] AI-powered event recommendations

# Magic Mastery Quiz - Educational Quiz Application

## Overview
An educational quiz application featuring adaptive challenges, quiz battles, leaderboards, practice schedules, and admin question management. Migrated from Lovable/Supabase to Replit's fullstack environment.

## Tech Stack
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM

## Project Structure
```
client/               # Frontend source (React)
  src/
    components/       # UI components
    hooks/           # Custom React hooks
    lib/             # Utilities (API client, query client)
    pages/           # Route pages
    services/        # Service layer (API calls)
    types/           # TypeScript types
server/               # Backend source
  routes.ts          # API routes
  storage.ts         # Database storage layer
  vite.ts            # Vite middleware
shared/               # Shared types and schemas
  schema.ts          # Drizzle database schema
```

## Key Features
1. **Practice Mode** - Topic-based levels with progression
2. **Skill Assessment** - Adaptive 20-question test
3. **Olympiad Test** - Timed competition-style exams
4. **Leaderboard** - Global rankings
5. **Admin Panel** - Question bank management

## Authentication
Currently uses a simplified auth system with localStorage-stored UUIDs (no full auth provider). Users are identified by generated UUIDs stored locally.

## API Endpoints
- `GET /api/questions/:subject/:topic/:level` - Fetch questions
- `GET /api/subjects` - List subjects
- `GET /api/topics/:subjectId` - List topics for subject
- `POST /api/adaptive-results` - Save assessment results
- `GET /api/adaptive-results/:userId` - Get user results
- `GET /api/profiles/:userId` - Get user profile
- `POST /api/profiles` - Create profile
- `PATCH /api/profiles/:userId` - Update profile
- `GET /api/leaderboard` - Get adaptive challenge leaderboard
- `GET /api/profiles-leaderboard` - Get profiles leaderboard

## Running the Project
```bash
npm run dev    # Start development server on port 5000
npm run db:push   # Push database schema changes
```

## Migration Notes
- Migrated from Supabase (auth + database + edge functions) to Express/PostgreSQL
- Real-time features (friends, quiz battles) are stubbed and marked for future implementation
- Admin authentication simplified to use useAuth hook instead of Supabase auth
- Property naming uses camelCase throughout (e.g., `displayName`, `totalStars`)

## User Preferences
- None documented yet

## Recent Changes
- 2026-01-31: Completed migration from Supabase to Express/PostgreSQL
- Created API client layer (src/lib/api.ts)
- Simplified authentication system
- Updated all services to use REST API
- Fixed Express 5 route syntax compatibility

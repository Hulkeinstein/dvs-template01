# Architecture Overview

## Tech Stack
- **Next.js 14** with App Router
- **Supabase** for database and authentication
- **NextAuth.js** for OAuth (Google) authentication
- **Bootstrap 5** with custom SCSS
- **Redux + Context API** for state management

## Project Structure
```
app/                    # Next.js App Router pages
├── (dashboard)/        # Role-based dashboard routes
├── (courses)/          # Course and lesson management
├── (pages)/            # General pages
├── lib/                # Server actions and utilities
│   └── actions/        # Server actions for Supabase
└── api/                # API routes (NextAuth)

components/             # React components organized by feature
├── Instructor/         # Instructor dashboard components
├── Student/           # Student dashboard components
├── Lesson/            # Quiz and lesson components
├── Auth/              # Authentication components
└── create-course/     # Course creation components

supabase/              # Database files
└── migrations/        # SQL migration files
```

## Database Schema (Supabase)
Current tables:
- `user` - User profiles with role field
- `courses` - Course information with instructor_id
- `lessons` - Course lessons with order_index
- `course_settings` - Course configuration
- `enrollments` - Student course enrollments with progress
- `orders` - Payment/enrollment records
- `lesson_progress` - Individual lesson completion tracking
- `phone_verifications` - Phone number verification
- `course_topics` - Course topics/chapters
- `quiz_attempts` - Quiz attempt records

## Key Architecture Patterns

### Authentication & Authorization
- **NextAuth.js** handles OAuth with Google
- **Role-based access control** (instructor/student roles)
- **Phone verification** required for certain actions
- Users are automatically created in Supabase on first login with 'student' role

### Data Flow
- **Server Components** for data fetching
- **Server Actions** in `app/lib/actions/` for Supabase operations
- **Client Components** for interactive features
- **Named exports** for Supabase client (`export { supabase }`)

### API Response Format
- `/api/user/profile` returns user object directly (not wrapped)

## Environment Variables Required
```
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Critical Development Rules
- **NEVER modify CSS files directly**. This project uses SCSS exclusively.
- **ALWAYS use SCSS files** for styling. CSS files are generated automatically from SCSS.
- When making style changes:
  1. Find or create the appropriate SCSS file in `/public/scss/`
  2. Import new SCSS files in `/public/scss/styles.scss`
  3. Remove any CSS imports from component files
- Do NOT import CSS files in `app/layout.js` or component files

## Development Notes
- **Hydration error prevention**: Use `useState` with `useEffect` for client-only features
- **Theme management**: Cookie-based persistence with server-side detection
- **Role-based routing**: Protected routes redirect based on user role
- **Performance**: Server components for data fetching, client components minimized
- **File uploads**: Use Base64 conversion for server actions, then upload to Supabase Storage
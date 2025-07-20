# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
This project does not currently have a test suite configured. Consider adding testing framework if implementing new features.

## Architecture Overview

### Tech Stack
- **Next.js 14** with App Router
- **Supabase** for database and authentication
- **NextAuth.js** for OAuth (Google) authentication
- **Bootstrap 5** with custom SCSS
- **Redux + Context API** for state management

### Project Structure
```
app/                    # Next.js App Router pages
├── (dashboard)/        # Role-based dashboard routes
├── (courses)/          # Course and lesson management
├── (pages)/            # General pages
├── lib/                # Server actions and utilities
└── api/                # API routes (NextAuth)

components/             # React components organized by feature
├── Instructor/         # Instructor dashboard components
├── Student/           # Student dashboard components
├── Lesson/            # Quiz and lesson components
├── Auth/              # Authentication components
└── [feature]/         # Feature-specific components

data/                  # Static JSON data files
context/               # React Context providers
redux/                 # Redux store and reducers
```

### Key Architecture Patterns

#### Authentication & Authorization
- **NextAuth.js** handles OAuth with Google
- **Role-based access control** (instructor/student roles)
- **RoleProtection component** prevents hydration errors by mounting client-side only
- Users are automatically created in Supabase on first login with 'student' role

#### Data Flow
- **Server Components** for data fetching (instructor dashboard uses server actions)
- **Client Components** for interactive features
- **Server Actions** in `app/lib/actions/` for Supabase operations
- **Named exports** for Supabase client (`export { supabase }`)

#### Theme System
- **Cookie-based theme persistence** prevents dark mode flicker
- **Server-side theme detection** in root layout
- **Context API** manages theme state client-side

### Database Schema (Supabase)
Key tables:
- `user` - User profiles with role field
- `courses` - Course information with instructor_id
- `enrollments` - Course enrollments
- `orders` - Payment/enrollment records

### Component Guidelines

#### Dashboard Components
- **Instructor Dashboard**: Uses dynamic data from server actions
- **Student Dashboard**: Uses static data from JSON files
- **CounterWidget**: Animated statistics using Odometer library

#### Quiz System
- **8 question types**: Single/multiple choice, true/false, fill-in-blanks, ordering, etc.
- **Drag & drop** using @dnd-kit for ordering questions
- **Timer functionality** with configurable time limits
- **Rich text editor** with Jodit React

#### State Management
- **Redux** for cart functionality
- **Context API** for global UI state (theme, mobile menu, etc.)
- **NextAuth session** for authentication state

### Environment Variables Required
```
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Import Patterns
- Use `@/` alias for absolute imports (configured in jsconfig.json)
- Server actions use named imports: `import { supabase } from '@/app/lib/supabase/client'`
- Components follow feature-based organization

### Development Notes
- **Hydration error prevention**: Use `useState` with `useEffect` for client-only features
- **Theme management**: Cookie-based persistence with server-side detection
- **Role-based routing**: Protected routes redirect based on user role
- **Performance**: Server components for data fetching, client components minimized

This is a comprehensive educational platform supporting multiple templates (26+ variations) for different educational contexts like universities, language schools, coaching centers, etc.
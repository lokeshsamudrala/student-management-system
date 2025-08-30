# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Student Management System built with React and Supabase. The application allows instructors to manage student profiles, view them in different layouts (cards and room layout), and track student information including their favorite movies and TV shows.

## Development Commands

### Core React Scripts
- `npm start` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm test` - Run tests in interactive watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

## Technology Stack
- **Frontend**: React 18.3.1 with Create React App
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom Apple-inspired design system
- **UI Libraries**: Framer Motion for animations, Lucide React for icons
- **Drag & Drop**: @dnd-kit for sortable interactions
- **Forms**: React Hook Form for form handling
- **Notifications**: React Hot Toast
- **Flow Diagrams**: @xyflow/react for room layout visualization
- **PDF Generation**: jsPDF for exporting features
- **HTTP Client**: Axios

## Architecture & Key Components

### Database Integration
- Supabase client configured in `src/lib/supabase.js`
- Environment variables required: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`
- Authentication handled through Supabase Auth

### Main Components Structure
- **App.js**: Main router and authentication state management
- **Dashboard**: Primary instructor interface with stats and two view modes
  - **CardsView**: Card-based student display
  - **RoomLayout**: Spatial room layout using @xyflow/react
- **StudentProfile**: Profile creation and editing forms
- **Auth/Login**: Authentication component
- **Header**: Navigation and user controls

### Key Features
- Student profile management with rich data (movies, TV shows, hobbies)
- Dual view modes: Cards and Room Layout
- Real-time statistics including popular movies/TV shows across students
- Drag-and-drop room arrangement
- PDF export capabilities
- Responsive design with Apple-inspired aesthetics

### Database Schema (Supabase Tables)
- `students`: Student profile data including personal info and preferences
- `professor_notes`: Instructor notes associated with students

### Custom Design System
- Apple-inspired color palette with custom `apple` color scale
- San Francisco font family (`font-sf`)
- Custom shadows (`shadow-apple`) and border radius (`rounded-apple`)
- Tailwind CSS configuration in `tailwind.config.js`

### Performance Optimizations
- Memoized calculations for movie statistics using `useMemo`
- Optimized database queries with specific field selection
- Map-based lookups for O(1) performance
- Callback optimization with `useCallback` to prevent unnecessary re-renders

## Development Notes
- Uses Create React App, so standard CRA patterns apply
- State management primarily through React hooks
- Authentication state managed at App level and passed down
- Environment variables stored in `.env.local`
- Custom Tailwind configuration with extended color palette and typography
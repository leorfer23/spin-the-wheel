# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fortune Wheel Platform - A comprehensive React-based spin wheel application platform with both public demo and full SaaS dashboard functionality. Built with React 19, TypeScript, Vite, Tailwind CSS, and Supabase.

PLEASE REMEMBER: NO TYPESCRIPT ERRORS SHOULD BE PRESENT IN THE CODEBASE. ALL CODE MUST PASS TYPE CHECKS.

Always User Facing Text is in Spanish.

USE CLEAN CODE PRINCIPLES: Write clear, maintainable, and well-structured code. Follow best practices for React and TypeScript development. NO FILES SHOULD HAVE UNNECESSARY COMPLEXITY OR BE OVERLY COMPLICATED.

ALL FILES SMALLER THAN 300 LINES: Keep files concise and focused. Each file should ideally contain a single component or closely related functionality.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server (with increased header size for Node.js)
npm run build      # Build for production (runs TypeScript check first)
npm run lint       # Run ESLint
npm run preview    # Preview production build
npm run build:widget  # Build embeddable widget bundle
npm run widget:test   # Test widget in development mode
```

## Architecture

### Core Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling (v4 with PostCSS)
- **Framer Motion** for animations
- **Radix UI** for UI primitives
- **Supabase** for backend (auth, database)
- **React Query** (@tanstack/react-query) for data fetching
- **React Router** (v7) for routing
- **Zustand** for state management (where needed)
- **Zod** for validation
- **Recharts** for analytics charts
- **Canvas Confetti** for celebration effects

### Project Structure

```
src/
├── components/
│   ├── wheel/           # Core wheel components
│   │   ├── FortuneWheel.tsx    # Main wheel component
│   │   ├── Segment.tsx         # Individual wheel segments
│   │   ├── CenterCircle.tsx    # Center button/logo
│   │   ├── Pointer.tsx         # Wheel pointer/indicator
│   │   ├── PegRing.tsx         # Outer decorative pegs
│   │   └── WheelContainer.tsx  # Container with styling
│   ├── ui/              # Radix UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── scheduling/      # Scheduling components
│   ├── widget/          # Widget-specific components
│   ├── ConfigPanel.tsx  # Wheel configuration panel
│   ├── CelebrationPopup.tsx    # Win celebration modal
│   └── ProtectedRoute.tsx      # Auth route wrapper
├── pages/
│   ├── auth/            # Login/Signup/ForgotPassword pages
│   ├── dashboard/       # Dashboard pages (ModularDashboard, WheelSchedulingDemo, etc.)
│   └── Landing.tsx      # Landing page
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── hooks/
│   └── useWheelSpin.ts  # Wheel spinning logic hook
├── services/            # API service layers (wheelService, storeService, etc.)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── widget/              # Embeddable widget version
├── api/                 # API utilities and dev server
├── lib/                 # Library configurations (supabase.ts, utils.ts)
├── App.tsx              # Demo app component
├── Router.tsx           # Main routing configuration
└── main.tsx             # App entry point
```

### Key Components

- `FortuneWheel.tsx` - Main wheel component with drag/click spinning
- `ConfigPanel.tsx` - Real-time wheel configuration interface
- `CelebrationPopup.tsx` - Animated prize display modal
- `Router.tsx` - Application routing with public/protected routes (lazy-loaded)
- `AuthContext.tsx` - Authentication state management
- `ModularDashboard` - Main dashboard interface with product selector

### Application Modes

1. **Landing Page** (`/`) - Public landing page
2. **Public Demo** (`/demo`) - Showcases wheel functionality
3. **Dashboard** (`/dashboard`) - Full SaaS platform for managing wheels, stores, campaigns (protected route)
4. **Widget** - Embeddable version built separately via `vite.widget.config.ts`

### Path Aliases

The project uses `@/` as an alias for `./src/` directory. This is configured in:

- `tsconfig.json` for TypeScript
- `vite.config.ts` for Vite bundling

### Environment Variables

Required environment variables (set in `.env` file):

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

The application gracefully handles missing Supabase configuration for development without backend.

### Widget Development

The project includes an embeddable widget that can be integrated into external websites:

- Built using separate Vite config (`vite.widget.config.ts`)
- Outputs to `public/widget-bundle.iife.js` and `public/widget.css`
- Includes widget API dev server plugin for testing
- Test pages available in `public/tiendanube-test.html`

### Wheel Features

- Weighted probability-based segment selection
- Drag-to-spin and click-to-spin functionality
- Smooth animations with configurable physics
- Real-time configuration updates
- Customizable segments, colors, and styling
- Animated pointer with peg collision effects
- Celebration animations with confetti
- Email capture integration
- Scheduling capabilities
- Theme presets and custom designs

### State Management

- Local state for demo mode
- React Query for dashboard data fetching and caching
- Context API for authentication
- Component-level state for UI interactions
- Zustand for complex state management where needed

### Code Quality

- TypeScript strict mode enabled
- ESLint configured with React hooks and refresh plugins
- Code splitting with lazy loading for better performance
- Manual chunks configured for optimal bundle sizes
- CORS enabled for widget development

### Database & Store Management

**IMPORTANT**: When working with stores and wheels:

- The `stores` table has both `id` (UUID) and `tiendanube_store_id` (TEXT)
- The `wheels` table references stores using `tiendanube_store_id`, NOT the store's UUID `id`
- Always use `tiendanube_store_id` when:
  - Loading wheels for a store: `WheelService.getWheels(tiendanube_store_id)`
  - Creating wheels for a store: `WheelService.createWheel(tiendanube_store_id, ...)`
  - Querying any wheel-related data by store
- The store's `id` is only used for store management operations
- This is a critical distinction that affects wheel loading and display

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

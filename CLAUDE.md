# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fortune Wheel Platform - A comprehensive React-based spin wheel application platform with both public demo and full SaaS dashboard functionality. Built with React 19, TypeScript, Vite, Tailwind CSS, and Supabase.

PLEASE REMEMBER: NO TYPESCRIPT ERRORS SHOULD BE PRESENT IN THE CODEBASE. ALL CODE MUST PASS TYPE CHECKS.

USE CLEAN CODE PRINCIPLES: Write clear, maintainable, and well-structured code. Follow best practices for React and TypeScript development. NO FILES SHOULD HAVE UNNECESSARY COMPLEXITY OR BE OVERLY COMPLICATED.

ALL FILES SMALLER THAN 300 LINES: Keep files concise and focused. Each file should ideally contain a single component or closely related functionality.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production (runs TypeScript check first)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Architecture

### Core Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for UI primitives
- **Supabase** for backend (auth, database)
- **React Query** for data fetching
- **React Router** for routing

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
│   ├── ConfigPanel.tsx  # Wheel configuration panel
│   ├── CelebrationPopup.tsx    # Win celebration modal
│   └── ProtectedRoute.tsx      # Auth route wrapper
├── pages/
│   ├── auth/            # Login/Signup pages
│   └── dashboard/       # Dashboard pages (stores, wheels, analytics, etc.)
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── hooks/
│   └── useWheelSpin.ts  # Wheel spinning logic hook
├── services/            # API service layers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── widget/              # Embeddable widget version
├── App.tsx              # Demo app component
├── Router.tsx           # Main routing configuration
└── main.tsx             # App entry point
```

### Key Components

- `FortuneWheel.tsx` - Main wheel component with drag/click spinning
- `ConfigPanel.tsx` - Real-time wheel configuration interface
- `CelebrationPopup.tsx` - Animated prize display modal
- `Router.tsx` - Application routing with public/protected routes
- `AuthContext.tsx` - Authentication state management

### Application Modes

1. **Public Demo** (`/demo`) - Showcases wheel functionality
2. **Dashboard** (`/dashboard/*`) - Full SaaS platform for managing wheels, stores, campaigns

### Wheel Features

- Weighted probability-based segment selection
- Drag-to-spin and click-to-spin functionality
- Smooth animations with configurable physics
- Real-time configuration updates
- Customizable segments, colors, and styling
- Animated pointer with peg collision effects
- Celebration animations with confetti

### State Management

- Local state for demo mode
- React Query for dashboard data fetching
- Context API for authentication
- Component-level state for UI interactions

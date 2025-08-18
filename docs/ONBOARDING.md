# 🎓 Onboarding System Documentation

## Overview

The SpinWheel platform features a comprehensive onboarding system built with React Joyride that guides new users through the initial setup process. The onboarding follows an iOS-inspired design with floating UI elements and smooth animations.

**Important:** The onboarding system only activates for:
- Authenticated users (logged in)
- When visiting the `/dashboard` routes
- Users who haven't completed the onboarding yet

It will NOT appear on:
- Landing/marketing pages
- Login/signup pages
- Public routes
- For users who have already completed it

## Architecture

### Core Components

#### 1. OnboardingProvider (`/src/components/onboarding/OnboardingProvider.tsx`)
The main context provider that manages the entire onboarding flow.

**Key Features:**
- Manages onboarding state (current step, completion status)
- Persists progress to database
- Provides methods to start, skip, and navigate through steps
- Shows initial welcome modal before tutorial starts
- Route detection to only activate on dashboard pages
- Authentication check to ensure user is logged in

**Context API:**
```typescript
interface OnboardingContextType {
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  isOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
}
```

#### 2. User Preferences Service (`/src/services/userPreferencesService.ts`)
Handles database operations for user preferences and onboarding state.

**Methods:**
- `getUserPreferences(userId)` - Fetch user's preferences
- `updateOnboardingStep(userId, step)` - Save current progress
- `completeOnboarding(userId)` - Mark onboarding as complete
- `resetOnboarding(userId)` - Reset to start tutorial again

#### 3. Database Schema (`/supabase/migrations/002_user_preferences.sql`)
Stores user preferences and onboarding progress.

**Table Structure:**
```sql
user_preferences {
  id: UUID
  user_id: UUID (references auth.users)
  onboarding_completed: BOOLEAN
  onboarding_current_step: INTEGER
  onboarding_started_at: TIMESTAMPTZ
  onboarding_completed_at: TIMESTAMPTZ
  preferred_language: VARCHAR(10)
  theme_preference: VARCHAR(20)
  notification_preferences: JSONB
}
```

## Onboarding Flow

### Step 1: Welcome Screen
- **Target:** `.onboarding-welcome`
- **Content:** Introduction to SpinWheel platform
- **Features:** Progress indicator showing 3 main steps
- **Icon:** Sparkles (purple gradient)

### Step 2: Store Connection
- **Target:** `.store-connection` 
- **Location:** TopBar "Agregar tu primera tienda" button
- **Content:** Step-by-step guide to connect TiendaNube:
  1. Click "Conectar TiendaNube"
  2. Login to TiendaNube account
  3. Authorize the connection
  4. Confirmation of successful connection
- **Icon:** Store (blue)

### Step 3: Wheel Creation
- **Target:** `.wheel-creation`
- **Location:** WheelSelector "Crear Nueva Rueda" button
- **Content:** Instructions for creating first wheel
- **Options:** Pre-designed templates or custom design
- **Icon:** Palette (green)

### Step 4: Wheel Preview
- **Target:** `.wheel-preview`
- **Location:** Main wheel display area
- **Content:** Explanation of wheel components:
  - Floating button appearance in store
  - Email capture functionality
  - Spin mechanics (click or drag)
  - Prize display system
- **Icon:** Trophy (yellow)

### Step 5: Segments Configuration
- **Target:** `.config-segments`
- **Location:** Configuration panel segments tab
- **Content:** How to customize prizes:
  - Prize text (e.g., "20% de descuento")
  - Win probability settings
  - Colors and design options
  - Winner messages
- **Icon:** Palette (indigo)

### Step 6: Scheduling Configuration
- **Target:** `.config-scheduling`
- **Location:** Configuration panel scheduling tab
- **Content:** Campaign scheduling options:
  - Start and end dates
  - Specific time ranges
  - Days of the week
  - Spin limits per user
- **Icon:** Clock (orange)

### Step 7: Completion
- **Target:** `.onboarding-complete`
- **Content:** Congratulations message with tips
- **Advice:** Check statistics regularly to optimize campaigns
- **Icon:** Rocket (purple-pink gradient)

## Design System

### Visual Style
```javascript
const customStyles = {
  primaryColor: '#8B5CF6',        // Purple accent
  backgroundColor: '#FFFFFF',      // White backgrounds
  textColor: '#1F2937',           // Dark gray text
  borderRadius: '24px',           // Rounded corners
  shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  backdropFilter: 'blur(16px)',   // Glass morphism effect
}
```

### Tooltip Dimensions
- Width: 420px
- Padding: 24px
- Font Size: 16px (content), 20px (titles)
- Z-index: 10000 (ensures visibility above all elements)

## Implementation Details

### CSS Class Markers
Components are marked with specific CSS classes for Joyride targeting:

```javascript
// Store connection button
<button className="store-connection ...">

// Wheel creation button  
<button className="wheel-creation ...">

// Wheel preview area
<div className="wheel-preview">

// Config tabs
<button className="config-segments ...">
<button className="config-scheduling ...">

// Welcome and complete markers
<div className="onboarding-welcome" />
<div className="onboarding-complete" />
```

### State Persistence
The system automatically:
1. Creates user preferences on signup (via database trigger)
2. Saves progress after each step
3. Resumes from last incomplete step on return
4. Records completion timestamp

### Restart Functionality
Users can restart the tutorial anytime from:
- **Location:** User Settings Dialog → Account Tab
- **Button:** "Reiniciar Tutorial" with GraduationCap icon
- **Action:** Resets onboarding state and launches tutorial

## Integration Points

### Router Integration
```javascript
// In Router.tsx
<BrowserRouter>
  <OnboardingProvider> {/* Must be inside BrowserRouter to use useLocation */}
    {/* Application routes */}
  </OnboardingProvider>
</BrowserRouter>
```

**Route Detection:**
The OnboardingProvider uses `useLocation()` from React Router to detect the current route and only activates when:
```javascript
if (!user || !location.pathname.startsWith('/dashboard')) {
  // Don't show onboarding
  return;
}
```

### Dashboard Integration
The ModularDashboard component includes all necessary onboarding markers and automatically checks onboarding status on mount.

### Auth Integration
- Uses AuthContext to get current user
- Triggers on successful login/signup
- Skips for users who completed onboarding

## Internationalization

All text is in Spanish with clear, grandmother-friendly instructions:
- Simple, step-by-step guidance
- Visual icons for each step
- Progress indicators
- Encouraging messages

## Testing Onboarding

### Manual Testing
1. Create new user account
2. Onboarding should start automatically
3. Test skip functionality
4. Test step navigation
5. Verify state persistence (refresh page mid-tutorial)
6. Test restart from settings

### Database Verification
```sql
-- Check user's onboarding status
SELECT * FROM spinawheel.user_preferences 
WHERE user_id = '[USER_ID]';

-- Reset onboarding for testing
UPDATE spinawheel.user_preferences 
SET onboarding_completed = false,
    onboarding_current_step = 0
WHERE user_id = '[USER_ID]';
```

## Future Enhancements

### Potential Improvements
- [ ] Add onboarding analytics tracking
- [ ] A/B test different onboarding flows
- [ ] Add video tutorials option
- [ ] Implement contextual help tooltips
- [ ] Add achievement/gamification system
- [ ] Multi-language support beyond Spanish
- [ ] Onboarding completion rewards (free credits, badges)

### Customization Options
The system is designed to be easily customizable:
- Steps can be added/removed/reordered in the `steps` array
- Styles can be modified in `customStyles` object
- Content can be updated without code changes
- New target elements just need appropriate CSS classes

## Troubleshooting

### Common Issues

**Onboarding not starting:**
- Check if user_preferences record exists
- Verify OnboardingProvider is wrapping the app
- Check browser console for errors

**Steps not highlighting correctly:**
- Verify CSS class names match between steps and components
- Check z-index conflicts with other modals
- Ensure target elements are rendered before step triggers

**Progress not saving:**
- Check Supabase connection
- Verify RLS policies allow user updates
- Check network tab for failed requests

**Tutorial restarting unexpectedly:**
- Check if onboarding_completed is properly set
- Verify no duplicate user_preferences records
- Check for auth state changes

## Dependencies

- **react-joyride**: ^2.9.3 - Core tour functionality
- **framer-motion**: Animation for welcome modal
- **@supabase/supabase-js**: Database operations
- **React Context API**: State management
- **Lucide React**: Icons for visual appeal
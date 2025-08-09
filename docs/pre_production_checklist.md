# 🎯 SpinWheel Pro – Production QA Checklist

**Target Date**: August 9, 2025  
**Deployment Platform**: Vercel  
**Testing Framework**: Vitest + Testing Library + Playwright  

---

## 🧪 Testing Stack & Setup

### Selected Testing Libraries
```bash
# Install testing dependencies
npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D @playwright/test msw @faker-js/faker
npm install -D @testing-library/react-hooks happy-dom
```

### Test Configuration Files Required
- `vitest.config.ts` - Unit/Integration test config
- `playwright.config.ts` - E2E test config  
- `src/test/setup.ts` - Test environment setup
- `src/test/mocks/` - MSW handlers for API mocking

---

## 📋 0. Pre-Flight Checks

### Environment & Configuration
- [ ] `.env` file contains all required variables:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_WIDGET_BASE_URL=
  VITE_API_RATE_LIMIT=
  ```
- [ ] `.env.production` configured for Vercel deployment
- [ ] Supabase project accessible and migrations applied
- [ ] RLS policies enabled and tested
- [ ] All secret keys stored in Vercel environment variables

### Code Quality Gates
```bash
# Must pass with zero errors
npm run type-check     # TypeScript strict mode
npm run lint           # ESLint with React hooks
npm run build          # Production build
npm run build:widget   # Widget bundle build
```

### Unit Test Requirements
```typescript
// vitest.config.ts setup
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
})
```

---

## 1. Landing Page & Public Routes

### Functional Requirements
- [ ] Landing page loads in <3s on 3G
- [ ] All CTAs navigate correctly
- [ ] Responsive design 320px-4K
- [ ] SEO meta tags present
- [ ] Analytics tracking initialized

### Unit Tests Required
```typescript
describe('Landing Page', () => {
  test('renders without crashing')
  test('displays hero section with correct content')
  test('CTA buttons navigate to /signup and /demo')
  test('responsive menu works on mobile')
  test('lazy loads below-fold content')
  test('tracks page view analytics event')
})
```

---

## 2. Authentication Flow

### Signup Flow Testing
- [ ] Email validation (format, uniqueness)
- [ ] Password strength requirements enforced
- [ ] Password confirmation matching
- [ ] Terms acceptance required
- [ ] Supabase user creation successful
- [ ] Welcome email triggered
- [ ] Auto-login after signup
- [ ] Redirect to dashboard

### Unit Tests - Signup
```typescript
describe('Signup Component', () => {
  test('validates email format')
  test('enforces password minimum 8 chars')
  test('requires password confirmation match')
  test('shows password strength indicator')
  test('handles duplicate email error')
  test('handles network error gracefully')
  test('creates user in Supabase')
  test('sets auth context after success')
  test('redirects to dashboard on success')
  test('tracks signup analytics event')
})
```

### Login Flow Testing
- [ ] Email/password validation
- [ ] Remember me functionality
- [ ] Session persistence
- [ ] Failed attempt rate limiting
- [ ] Password reset link works
- [ ] Social login (if enabled)

### Unit Tests - Login
```typescript
describe('Login Component', () => {
  test('validates credentials format')
  test('handles invalid credentials error')
  test('implements rate limiting after 5 attempts')
  test('remember me stores session')
  test('forgot password sends reset email')
  test('redirects to intended page after login')
  test('shows loading state during auth')
})
```

### Protected Routes
- [ ] Unauthenticated users redirected to /login
- [ ] Auth token refresh works
- [ ] Logout clears all session data
- [ ] Multi-tab session sync

### Unit Tests - Auth Context
```typescript
describe('AuthContext', () => {
  test('provides user session to children')
  test('refreshes token before expiry')
  test('handles token refresh failure')
  test('syncs logout across tabs')
  test('persists session in localStorage')
  test('clears session on logout')
})
```

---

## 3. Store Management

### Store Connection
- [ ] Platform selection (Shopify/TiendaNube/Custom)
- [ ] OAuth flow completion
- [ ] API credentials validation
- [ ] Store data sync
- [ ] Webhook registration

### Critical Database Logic
⚠️ **IMPORTANT**: Wheels reference `tiendanube_store_id` (TEXT), NOT store UUID `id`

### Unit Tests - Store Service
```typescript
describe('StoreService', () => {
  test('creates store with correct platform')
  test('validates API credentials format')
  test('encrypts sensitive credentials')
  test('links store to user account')
  test('handles OAuth callback correctly')
  test('registers required webhooks')
  test('uses tiendanube_store_id for wheel queries')
  test('validates store domain uniqueness')
})
```

---

## 4. Wheel Configuration

### Wheel Creation
- [ ] Name and description saved
- [ ] Segments configuration (min 2, max 12)
- [ ] Probability weights sum to 100%
- [ ] Color scheme applied
- [ ] Prize types configured
- [ ] Inventory limits set
- [ ] Spin physics configured

### Unit Tests - Wheel Creation
```typescript
describe('WheelService.createWheel', () => {
  test('validates wheel name required')
  test('enforces minimum 2 segments')
  test('enforces maximum 12 segments')
  test('validates weights sum to 100%')
  test('generates unique embed_code')
  test('saves to correct tiendanube_store_id')
  test('initializes with is_active=false')
  test('validates segment prize types')
  test('sets default physics config')
})
```

### Wheel Configuration Panel
- [ ] Real-time preview updates
- [ ] Segment CRUD operations
- [ ] Color picker works
- [ ] Weight distribution visual
- [ ] Theme presets apply correctly

### Unit Tests - Configuration Panel
```typescript
describe('WheelConfiguration', () => {
  test('updates preview on config change')
  test('adds segment with default values')
  test('removes segment (min 2 required)')
  test('updates segment weight')
  test('redistributes weights proportionally')
  test('applies theme preset')
  test('validates before save')
  test('shows unsaved changes warning')
})
```

---

## 5. Wheel Spinning Mechanics

### Physics & Animation
- [ ] Click to spin works
- [ ] Drag to spin works
- [ ] Momentum calculation correct
- [ ] Easing function applied
- [ ] Pointer collision animation
- [ ] Sound effects trigger (if enabled)

### Unit Tests - Spin Logic
```typescript
describe('useWheelSpin Hook', () => {
  test('calculates winning segment by weight')
  test('respects segment availability')
  test('generates random within weight range')
  test('calculates spin duration')
  test('applies friction coefficient')
  test('triggers onSpinComplete callback')
  test('prevents spin during animation')
  test('handles edge case: single segment')
})
```

### Winning Logic
- [ ] Weighted random selection
- [ ] Out-of-stock segments excluded
- [ ] Result logging to database
- [ ] Inventory decrement
- [ ] User limit enforcement

### Unit Tests - Winning Selection
```typescript
describe('selectWinningSegment', () => {
  test('selects based on probability weights')
  test('excludes zero inventory segments')
  test('handles equal weight distribution')
  test('never selects disabled segments')
  test('logs selection for audit')
  test('decrements inventory atomically')
})
```

---

## 6. Widget Integration

### Widget Loading
- [ ] Script loads asynchronously
- [ ] CSS injection works
- [ ] No global namespace pollution
- [ ] CORS headers configured
- [ ] CSP compatible

### Unit Tests - Widget Loader
```typescript
describe('Widget Initialization', () => {
  test('loads with data-wheel-id attribute')
  test('injects styles without conflicts')
  test('respects trigger configuration')
  test('handles missing wheel ID')
  test('validates domain whitelist')
  test('implements rate limiting')
})
```

### Widget Behavior
- [ ] Trigger types work (exit intent, button, timer)
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Analytics tracking
- [ ] Error boundary catches crashes

### Unit Tests - Widget Behavior
```typescript
describe('SpinWheelWidget', () => {
  test('shows on exit intent trigger')
  test('shows after configured delay')
  test('closes on backdrop click')
  test('prevents multiple instances')
  test('tracks widget events')
  test('handles network errors gracefully')
  test('respects user dismiss preference')
})
```

---

## 7. Campaign Management

### Campaign Rules
- [ ] Date range enforcement
- [ ] Daily spin limits
- [ ] Per-user limits
- [ ] Total campaign limits
- [ ] Geographic restrictions
- [ ] Time zone handling

### Unit Tests - Campaign Service
```typescript
describe('CampaignService', () => {
  test('enforces campaign start date')
  test('enforces campaign end date')
  test('limits daily spins per user')
  test('limits total campaign spins')
  test('checks user eligibility')
  test('handles timezone conversions')
  test('validates geographic restrictions')
  test('prevents duplicate spins')
})
```

---

## 8. Email Capture & Integration

### Email Collection
- [ ] Form validation
- [ ] Consent checkbox required
- [ ] GDPR compliance
- [ ] Double opt-in flow
- [ ] Duplicate prevention

### Unit Tests - Email Capture
```typescript
describe('EmailCaptureForm', () => {
  test('validates email format')
  test('requires consent checkbox')
  test('stores consent timestamp')
  test('prevents duplicate submissions')
  test('handles submission errors')
  test('shows success confirmation')
  test('triggers welcome email')
})
```

### Provider Integration
- [ ] Mailchimp sync
- [ ] Klaviyo sync
- [ ] SendGrid sync
- [ ] Webhook delivery
- [ ] Retry mechanism

### Unit Tests - Integration Service
```typescript
describe('IntegrationService', () => {
  test('validates provider credentials')
  test('maps fields correctly')
  test('handles API rate limits')
  test('implements exponential backoff')
  test('logs sync failures')
  test('marks records as synced')
})
```

---

## 9. Analytics & Reporting

### Metrics Collection
- [ ] Spin count tracking
- [ ] Conversion rates
- [ ] Email capture rate
- [ ] Prize claim rate
- [ ] Geographic distribution
- [ ] Device analytics

### Unit Tests - Analytics
```typescript
describe('WheelAnalytics', () => {
  test('aggregates spin data correctly')
  test('calculates conversion rates')
  test('filters by date range')
  test('groups by segment')
  test('exports to CSV format')
  test('respects data retention policy')
})
```

---

## 10. Performance Testing

### Load Testing Requirements
```bash
# Using k6 for load testing
k6 run --vus 100 --duration 30s tests/load/spin-endpoint.js
```

### Performance Targets
- [ ] Landing page: <3s FCP, <4s LCP
- [ ] Dashboard: <2s TTI
- [ ] Widget load: <500ms
- [ ] Spin animation: 60fps
- [ ] API response: <200ms p95

### Performance Tests
```javascript
// tests/load/spin-endpoint.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.1'],
  },
};
```

---

## 11. Security Testing

### Security Checklist
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implemented
- [ ] Rate limiting active
- [ ] Input sanitization
- [ ] Secure headers configured
- [ ] HTTPS enforcement
- [ ] Secrets not in code

### Security Tests
```typescript
describe('Security', () => {
  test('sanitizes user input')
  test('escapes HTML in outputs')
  test('validates JWT signatures')
  test('implements rate limiting')
  test('blocks suspicious patterns')
  test('logs security events')
})
```

### OWASP Top 10 Coverage
- [ ] Broken Access Control
- [ ] Cryptographic Failures
- [ ] Injection
- [ ] Insecure Design
- [ ] Security Misconfiguration
- [ ] Vulnerable Components
- [ ] Authentication Failures
- [ ] Data Integrity Failures
- [ ] Security Logging Failures
- [ ] SSRF

---

## 12. E2E Testing

### Playwright Test Scenarios
```typescript
// tests/e2e/critical-path.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Journey', () => {
  test('new user can signup and create first wheel', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Get Started');
    // ... complete signup
    // ... create store
    // ... create wheel
    // ... embed widget
    // ... test spin
  });
  
  test('widget loads and captures email', async ({ page }) => {
    await page.goto('/test-store.html');
    await page.waitForSelector('#spin-wheel-widget');
    // ... spin wheel
    // ... enter email
    // ... verify capture
  });
});
```

### E2E Test Coverage
- [ ] Complete signup flow
- [ ] Store connection flow
- [ ] Wheel creation flow
- [ ] Widget embedding flow
- [ ] End-user spin flow
- [ ] Analytics viewing flow
- [ ] Billing upgrade flow

---

## 13. Vercel Deployment

### Pre-Deployment Checklist
- [ ] Environment variables configured in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node.js version: 20.x
- [ ] Install command: `npm ci`

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/widget-bundle.iife.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ],
  "functions": {
    "api/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### Deployment Steps
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Post-Deployment Verification
- [ ] Production URL accessible
- [ ] SSL certificate valid
- [ ] Environment variables loaded
- [ ] Database connections work
- [ ] Widget CDN URL works
- [ ] Analytics tracking active
- [ ] Error tracking enabled

---

## 14. Monitoring & Observability

### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Custom metrics dashboard

### Required Metrics
```typescript
// Metrics to track
interface ProductionMetrics {
  // Performance
  pageLoadTime: number;
  apiResponseTime: number;
  widgetLoadTime: number;
  
  // Business
  dailyActiveUsers: number;
  totalSpins: number;
  conversionRate: number;
  emailCaptureRate: number;
  
  // Technical
  errorRate: number;
  apiAvailability: number;
  dbConnectionPool: number;
}
```

### Alert Configuration
- [ ] Error rate > 1%
- [ ] API response time > 500ms
- [ ] Database connection failures
- [ ] Memory usage > 90%
- [ ] Failed deployments

---

## 15. Rollback Plan

### Rollback Procedures
1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Feature Flag Disable**
   ```typescript
   // Disable specific features
   const FEATURE_FLAGS = {
     NEW_WHEEL_UI: false,
     EMAIL_SYNC: false
   };
   ```

3. **Database Rollback**
   ```sql
   -- Prepared rollback migrations
   -- Located in: supabase/rollback/
   ```

4. **CDN Cache Purge**
   ```bash
   # Purge widget cache
   vercel purge-cache
   ```

---

## 16. Go/No-Go Checklist

### Final Sign-off Requirements
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Browser testing complete (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing complete (iOS Safari, Chrome Android)
- [ ] Load testing passed (1000 concurrent users)
- [ ] Staging environment stable for 48hrs
- [ ] Rollback plan tested
- [ ] Team sign-off obtained

### Launch Commands
```bash
# Final production deployment
npm run test:unit
npm run test:integration  
npm run test:e2e
npm run build
npm run build:widget
vercel --prod

# Post-deployment smoke tests
npm run test:smoke:production
```

---

## 📝 Notes

### Critical Reminders
- **Database**: Always use `tiendanube_store_id` for wheel-store operations
- **TypeScript**: Zero errors policy - no `any` types allowed
- **File Size**: Keep all files under 300 lines
- **Security**: Never commit secrets, always use env variables
- **Testing**: Write tests before fixing bugs
- **Performance**: Profile before optimizing

### Support Contacts
- **DevOps Lead**: [Contact]
- **Security Team**: [Contact]  
- **Database Admin**: [Contact]
- **On-call Engineer**: [Contact]

### Documentation
- API Documentation: `/docs/api`
- Widget Integration Guide: `/docs/widget`
- Troubleshooting Guide: `/docs/troubleshooting`
- Runbook: `/docs/runbook`

---

**Last Updated**: August 9, 2025  
**Version**: 1.0.0  
**Status**: READY FOR PRODUCTION
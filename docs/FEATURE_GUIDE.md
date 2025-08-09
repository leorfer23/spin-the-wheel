# SpinWheel Pro - Feature Implementation Guide

## 🎯 Current Implementation Status

### ✅ Completed Features

#### 1. Authentication System
- **Supabase Auth Integration**
  - Email/password authentication
  - Session management with auto-refresh
  - Protected route system
  - Password reset flow

#### 2. Database Architecture
- **8 Core Tables** with relationships
  - `users` - Managed by Supabase Auth
  - `stores` - Multi-tenant store management
  - `wheels` - Wheel configurations
  - `segments` - Prize segments with weights
  - `campaigns` - Time-based campaigns
  - `spins` - Spin history and results
  - `email_captures` - Marketing consent tracking
  - `integrations` - Email provider connections

#### 3. Type System
- **Full TypeScript Coverage**
  - Database types auto-generated
  - Business model interfaces
  - Zod validation schemas
  - API response types

#### 4. API Service Layer
- **CRUD Operations** for all entities
- **Error Handling** with consistent responses
- **Type Safety** throughout

#### 5. Admin Dashboard Shell
- **Routing Structure** with React Router v7
- **Responsive Layout** with sidebar navigation
- **Component Library** based on Radix UI

### 🚧 Features In Progress

#### 1. Store Management (Task 7)
**Current State**: Basic CRUD implemented

**To Complete**:
```typescript
// Store onboarding wizard
interface StoreOnboarding {
  step1: BasicInfo;        // Name, URL, platform
  step2: ApiCredentials;   // Platform-specific API setup
  step3: BrandSettings;    // Logo, colors, defaults
  step4: Verification;     // Test connection
}

// Platform-specific integrations
interface ShopifyIntegration {
  shopDomain: string;
  accessToken: string;
  webhooks: {
    orderCreated: boolean;
    customerCreated: boolean;
  };
}

// Store dashboard
interface StoreStats {
  totalWheels: number;
  activeCapaigns: number;
  monthlySpins: number;
  conversionRate: number;
  topPrizes: Prize[];
}
```

#### 2. Wheel Configuration Management (Task 8)
**Current State**: Type definitions complete

**To Complete**:
```typescript
// Visual wheel builder
interface WheelBuilder {
  canvas: {
    preview: React.Component;      // Live preview
    segmentEditor: React.Component; // Drag to reorder
    colorPicker: React.Component;  // Theme customization
  };
  
  templates: WheelTemplate[];      // Pre-built designs
  
  physics: {
    spinDuration: Slider;          // 1-10 seconds
    friction: Slider;              // 0-1 deceleration
    soundEffects: Toggle;          // Enable/disable
  };
}

// Segment management
interface SegmentEditor {
  addSegment(): void;
  removeSegment(id: string): void;
  updateWeight(id: string, weight: number): void;
  reorderSegments(segments: Segment[]): void;
  
  prizeConfiguration: {
    type: 'discount' | 'product' | 'custom';
    discountSetup: {
      percentage: number;
      code: string;
      autoGenerate: boolean;
    };
  };
}
```

#### 3. Email Capture & Integration (Task 9)
**Current State**: Database schema ready

**To Complete**:
```typescript
// Email capture flow
interface EmailCaptureWidget {
  modal: {
    title: string;
    description: string;
    gdprConsent: boolean;
    marketingOptIn: boolean;
  };
  
  validation: {
    emailFormat: boolean;
    duplicatePrevention: boolean;
    blacklist: string[];
  };
}

// Provider integrations
interface EmailProviderSync {
  mailchimp: {
    apiKey: string;
    listId: string;
    tags: string[];
    customFields: Record<string, any>;
  };
  
  klaviyo: {
    privateKey: string;
    listId: string;
    profileProperties: Record<string, any>;
  };
  
  // Sync engine
  syncEngine: {
    batchSize: number;
    retryPolicy: RetryPolicy;
    webhookEndpoint: string;
  };
}
```

#### 4. Embeddable Widget System (Task 10)
**Current State**: Embed code generation ready

**To Complete**:
```typescript
// Widget loader
interface WidgetLoader {
  // Minimal bundle size
  core: {
    size: '<50KB gzipped';
    dependencies: 'none';
    polyfills: 'included';
  };
  
  // Injection method
  inject: {
    script: string;           // <script> tag
    targetElement: string;    // CSS selector
    position: WidgetPosition; // Overlay position
  };
  
  // Communication
  messaging: {
    postMessage: boolean;     // Cross-origin
    events: WidgetEvent[];    // Custom events
    callbacks: {
      onLoad: Function;
      onSpin: Function;
      onClose: Function;
    };
  };
}

// Widget configuration
interface WidgetConfig {
  trigger: {
    type: 'immediate' | 'exit_intent' | 'scroll' | 'time' | 'click';
    config: TriggerConfig;
  };
  
  display: {
    desktop: DisplayConfig;
    mobile: DisplayConfig;
    responsive: boolean;
  };
  
  behavior: {
    frequency: 'once' | 'session' | 'always';
    cookieDuration: number;
    testing: {
      enabled: boolean;
      percentage: number;  // A/B test traffic %
    };
  };
}
```

## 📋 Implementation Roadmap

### Phase 1: Store Management (Week 1)
1. **Day 1-2**: Store detail page with stats
2. **Day 3-4**: Platform API integrations
3. **Day 5**: Store settings and branding

### Phase 2: Wheel Builder (Week 2)
1. **Day 1-2**: Visual wheel preview component
2. **Day 3-4**: Segment editor with drag-drop
3. **Day 5**: Theme presets and customization

### Phase 3: Email System (Week 3)
1. **Day 1-2**: Email capture modal polish
2. **Day 3-4**: Provider integration UI
3. **Day 5**: Sync engine and monitoring

### Phase 4: Widget System (Week 4)
1. **Day 1-2**: Widget bundler setup
2. **Day 3-4**: Trigger system implementation
3. **Day 5**: Analytics and testing

## 🔧 Technical Implementation Details

### 1. Real-time Wheel Preview
```typescript
// Using React + Canvas/SVG
const WheelPreview: React.FC<{ config: WheelConfig }> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Draw wheel segments
    config.segments.forEach((segment, index) => {
      drawSegment(ctx, segment, index, config.segments.length);
    });
    
    // Draw center button
    drawCenterButton(ctx, config.centerCircle);
    
    // Draw pointer
    drawPointer(ctx, config.pointer);
  }, [config]);
  
  return <canvas ref={canvasRef} width={400} height={400} />;
};
```

### 2. Campaign Analytics Dashboard
```typescript
// Using Recharts for visualization
const AnalyticsDashboard: React.FC<{ wheelId: string }> = ({ wheelId }) => {
  const { data: analytics } = useQuery({
    queryKey: ['analytics', wheelId],
    queryFn: () => CampaignService.getAnalytics(wheelId, dateRange)
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard title="Total Spins" value={analytics.totalSpins} />
      <MetricCard title="Unique Users" value={analytics.uniqueParticipants} />
      <MetricCard title="Conversion Rate" value={`${analytics.conversionRate}%`} />
      <MetricCard title="Emails Captured" value={analytics.emailsCaptured} />
      
      <div className="col-span-full">
        <LineChart data={analytics.dailyStats}>
          <Line dataKey="spins" stroke="#8884d8" />
          <Line dataKey="participants" stroke="#82ca9d" />
        </LineChart>
      </div>
      
      <PieChart data={analytics.prizeDistribution}>
        <Pie dataKey="percentage" nameKey="label" />
      </PieChart>
    </div>
  );
};
```

### 3. Email Provider Integration
```typescript
// Mailchimp integration example
class MailchimpIntegration {
  async syncContacts(emails: EmailCapture[]) {
    const batch = emails.map(email => ({
      email_address: email.email,
      status: email.marketing_consent ? 'subscribed' : 'unsubscribed',
      merge_fields: {
        SPIN_DATE: email.created_at,
        PRIZE_WON: email.prize_name
      }
    }));
    
    const response = await fetch(`${MAILCHIMP_API}/lists/${listId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ members: batch })
    });
    
    return response.json();
  }
}
```

### 4. Widget Injection Script
```javascript
// Minimal widget loader
(function() {
  const script = document.currentScript;
  const wheelId = script.getAttribute('data-wheel-id');
  const trigger = script.getAttribute('data-trigger') || 'immediate';
  
  // Create container
  const container = document.createElement('div');
  container.id = 'spinwheel-widget';
  container.style.cssText = 'position:fixed;z-index:999999;';
  document.body.appendChild(container);
  
  // Load widget bundle
  const widgetScript = document.createElement('script');
  widgetScript.src = 'https://cdn.spinwheelpro.com/widget.min.js';
  widgetScript.onload = () => {
    window.SpinWheelWidget.init({
      wheelId,
      trigger,
      container: '#spinwheel-widget'
    });
  };
  document.head.appendChild(widgetScript);
})();
```

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Purple primary (#8B5CF6), success green, error red
- **Typography**: Inter for UI, system fonts fallback
- **Spacing**: 4px base unit (Tailwind spacing)
- **Shadows**: Subtle elevation system
- **Animations**: Framer Motion for smooth transitions

### Component Patterns
```typescript
// Consistent loading states
const LoadingState = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
  </div>
);

// Empty states with CTAs
const EmptyState = ({ title, description, action }) => (
  <Card className="text-center p-8">
    <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    <Button onClick={action.onClick}>{action.label}</Button>
  </Card>
);

// Error boundaries
const ErrorBoundary = ({ children }) => {
  // Implementation
};
```

## 🚀 Performance Optimizations

### Code Splitting
```typescript
// Lazy load heavy components
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const WheelBuilder = lazy(() => import('./pages/dashboard/WheelBuilder'));

// Route-based splitting
<Route 
  path="analytics" 
  element={
    <Suspense fallback={<LoadingState />}>
      <Analytics />
    </Suspense>
  } 
/>
```

### Query Optimization
```typescript
// Batch related queries
const useWheelData = (wheelId: string) => {
  return useQueries({
    queries: [
      { queryKey: ['wheel', wheelId], queryFn: () => getWheel(wheelId) },
      { queryKey: ['segments', wheelId], queryFn: () => getSegments(wheelId) },
      { queryKey: ['campaigns', wheelId], queryFn: () => getCampaigns(wheelId) }
    ],
    combine: (results) => ({
      wheel: results[0].data,
      segments: results[1].data,
      campaigns: results[2].data,
      isLoading: results.some(r => r.isLoading)
    })
  });
};
```

### Widget Performance
- **Preact** for smaller bundle (3KB vs React's 45KB)
- **CSS-in-JS** avoided for better performance
- **Service Worker** for offline capability
- **Resource hints** for faster loading

## 🔒 Security Considerations

### Widget Security
1. **Content Security Policy** headers
2. **Iframe sandboxing** option
3. **Domain whitelist** for embedding
4. **Rate limiting** per domain

### Data Protection
1. **PII encryption** at rest
2. **Secure webhook** signatures
3. **API key rotation** reminders
4. **Audit logging** for compliance

## 📈 Analytics & Monitoring

### Key Metrics
- **Spin Rate**: Spins per unique visitor
- **Conversion Rate**: Spins to prize claims
- **Email Capture Rate**: Consent percentage
- **Widget Load Time**: Performance monitoring

### Integration Points
- **Google Analytics 4** events
- **Facebook Pixel** conversions
- **Custom webhooks** for BI tools
- **Export API** for raw data

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('WheelService', () => {
  it('should calculate correct segment from spin angle', () => {
    const segments = [/* ... */];
    const angle = 45;
    const winner = calculateWinningSegment(segments, angle);
    expect(winner.id).toBe('expected-segment-id');
  });
});
```

### Integration Tests
```typescript
describe('Spin Flow', () => {
  it('should complete full spin cycle', async () => {
    // 1. Capture email
    // 2. Record spin
    // 3. Update inventory
    // 4. Sync to email provider
  });
});
```

### E2E Tests
- **Playwright** for cross-browser testing
- **Widget embedding** scenarios
- **Mobile responsiveness** checks
- **Performance benchmarks**

---

This guide provides a comprehensive overview of all features - both implemented and planned. Each section includes practical code examples and implementation details to accelerate development.
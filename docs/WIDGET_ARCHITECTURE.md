# Widget Architecture Documentation

## Overview

The CoolPops/SpinWheel widget system is designed to be embedded on third-party e-commerce platforms like Tienda Nube, Shopify, and WooCommerce. The system consists of multiple components working together to deliver a seamless spin wheel experience.

## Architecture Components

### 1. Widget Loader (`tiendanube-widget.js`)

The loader is a lightweight JavaScript file (~5KB) that store owners embed on their sites. It handles:

- **Configuration detection** from script data attributes
- **Session management** to prevent showing the wheel multiple times
- **Trigger handling** (exit intent, scroll, delay, click, etc.)
- **Loading the main widget bundle** when triggered
- **Platform detection** (Tienda Nube, Shopify, etc.)

### 2. Widget Bundle (`widget-bundle.js`)

The main widget application built with React and bundled as an IIFE (Immediately Invoked Function Expression). Contains:

- React components for the wheel interface
- Animation logic using Framer Motion
- API communication layer
- Email capture forms
- Prize celebration effects

### 3. Configuration System

The widget loads its configuration from multiple sources:

```typescript
interface WheelWidgetConfig {
  wheelData: WheelConfiguration      // Wheel segments, colors, probabilities
  handleConfig: HandleConfiguration   // How users interact (button, swipe, etc.)
  emailCaptureConfig: EmailConfig    // Email form settings and timing
  celebrationConfig: CelebrationConfig // Win/lose animations and messages
  settings: WidgetSettings           // Triggers, targeting, restrictions
}
```

### 4. API Endpoints

Development server provides these endpoints:

- `GET /api/widget/wheel/:wheelId` - Fetch specific wheel configuration
- `GET /api/widget/store/:storeId/default-wheel` - Get store's default wheel
- `POST /api/widget/spin` - Record spin results
- `POST /api/widget/prize-accepted` - Track prize claims and email captures

## How It Works

### 1. Installation (Tienda Nube Example)

Store owner adds this script to their Tienda Nube store:

```html
<script 
  src="https://app.coolpops.com/tiendanube-widget.js"
  data-wheel-id="YOUR_WHEEL_ID"
  data-trigger="exit_intent"
  data-store-id="STORE_ID">
</script>
```

### 2. Initialization Flow

```
1. Script loads → Checks configuration
2. Sets up trigger listeners based on data-trigger
3. When triggered → Shows loading spinner
4. Fetches wheel configuration from API
5. Loads main widget bundle
6. Initializes React app in isolated container
7. Renders wheel based on configuration
```

### 3. User Interaction Flow

```
1. Widget appears based on trigger
2. (Optional) Email capture form shown
3. User spins the wheel
4. Wheel animates and selects weighted segment
5. Celebration animation plays
6. Prize displayed with discount code
7. Results sent to API for analytics
8. Discount applied to store checkout
```

### 4. Platform Integration

#### Tienda Nube
- Detects `window.LS` object
- Can apply discounts via `LS.checkout.setDiscount()`
- Shows notifications via `LS.notification.show()`
- Supports Spanish/Portuguese localization

#### Shopify
- Detects `window.Shopify` object
- Applies discounts via redirect to `/discount/{code}`
- Can access cart data via `/cart.js`

#### Generic/WooCommerce
- Falls back to URL parameter method
- Works on any website without platform-specific features

## Configuration Options

### Trigger Types

1. **exit_intent** - Shows when user moves mouse to leave page
2. **immediate** - Shows as soon as page loads
3. **delay** - Shows after X seconds (configurable)
4. **scroll** - Shows after scrolling X% of page
5. **click** - Shows when clicking elements with `.coolpops-trigger`
6. **onfirstinteraction** - Shows on first user interaction (Tienda Nube specific)

### Handle Types

1. **button** - Traditional center button to spin
2. **pull_tab** - Side tab user pulls to reveal wheel
3. **auto_spin** - Wheel spins automatically
4. **shake** - Mobile shake gesture
5. **swipe** - Swipe to spin

### Email Capture Timing

1. **before_spin** - Collect email before allowing spin
2. **after_spin** - Show form after spin completes
3. **with_prize** - Include email form with prize display

### Celebration Types

1. **confetti** - Colorful confetti animation
2. **fireworks** - Continuous firework effects
3. **balloons** - Rising balloon animation
4. **custom** - Custom celebration defined by store
5. **none** - No celebration effect

## Development Setup

### Local Testing

1. Start the development server:
```bash
npm run dev
```

2. Access the test page:
```
http://localhost:5173/tiendanube-test.html
```

3. Test different configurations by URL parameters:
```
?trigger=immediate&wheelId=test-123
?trigger=scroll&scrollPercentage=30
?trigger=delay&delay=5
```

### Building the Widget

```bash
# Build the widget bundle
npm run build:widget

# This creates:
# - public/widget-bundle.js
# - public/widget.css
```

## Security Considerations

1. **CORS Headers** - API endpoints include proper CORS headers
2. **Session Isolation** - Widget runs in isolated scope
3. **Input Validation** - All user inputs are validated
4. **Rate Limiting** - API endpoints should implement rate limiting
5. **Domain Whitelisting** - Production should validate origin domains

## Performance Optimization

1. **Lazy Loading** - Main bundle only loads when triggered
2. **Code Splitting** - Heavy dependencies loaded on demand
3. **Caching** - Widget configuration cached for 5 minutes
4. **Minification** - Production build is minified and optimized
5. **CDN Delivery** - Static assets served from CDN

## Customization

### Styling

The widget uses scoped CSS classes to prevent conflicts:
- All classes prefixed with `coolpops-` or `spinwheel-`
- Uses CSS-in-JS for dynamic styles
- Supports theme customization via configuration

### Localization

Widget supports multiple languages:
- Detects store language from platform
- All text configurable via API
- RTL support for Arabic/Hebrew

### Mobile Optimization

- Responsive design scales to device
- Touch-optimized interactions
- Reduced animations on low-end devices
- Portrait/landscape orientation support

## Analytics & Tracking

The widget tracks:
- Total impressions
- Spin completions
- Email capture rate
- Prize distribution
- Platform performance
- Device/browser stats

## Troubleshooting

### Widget Not Showing

1. Check browser console for errors
2. Verify wheel is active in dashboard
3. Check trigger configuration
4. Ensure not blocked by ad blockers

### API Connection Issues

1. Verify CORS configuration
2. Check network tab for failed requests
3. Ensure API endpoints are accessible
4. Check for rate limiting

### Platform-Specific Issues

1. **Tienda Nube**: Ensure LS object is available
2. **Shopify**: Check for theme conflicts
3. **WooCommerce**: Verify jQuery compatibility

## Future Enhancements

1. **A/B Testing** - Test different wheel configurations
2. **Advanced Targeting** - Geo-location, device type
3. **Multi-step Campaigns** - Progressive rewards
4. **Social Sharing** - Share results for extra spins
5. **Gamification** - Points system, leaderboards
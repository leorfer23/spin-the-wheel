# Widget API Reference

## Overview

This document provides a complete reference for the CoolPops Widget API, including all endpoints, data structures, and integration examples.

## Base URLs

- **Production**: `https://app.coolpops.com`
- **Development**: `http://localhost:5173`

## Authentication

Widget API endpoints are public but include origin validation and rate limiting. No authentication required for widget endpoints.

## Endpoints

### 1. Get Wheel Configuration

Fetch configuration for a specific wheel.

```
GET /api/widget/wheel/:wheelId
```

#### Parameters
- `wheelId` (string, required): Unique wheel identifier

#### Response
```json
{
  "id": "wheel123",
  "storeId": "store456",
  "wheelData": {
    "id": "wheel123",
    "name": "Welcome Wheel",
    "segments": [...],
    "style": {...},
    "physics": {...}
  },
  "handleConfig": {...},
  "emailCaptureConfig": {...},
  "celebrationConfig": {...},
  "settings": {...}
}
```

#### Example
```javascript
fetch('https://app.coolpops.com/api/widget/wheel/wheel123')
  .then(res => res.json())
  .then(config => console.log(config));
```

### 2. Get Store Default Wheel

Fetch the default wheel for a specific store.

```
GET /api/widget/store/:storeId/default-wheel
```

#### Parameters
- `storeId` (string, required): Store identifier

#### Response
Same as wheel configuration endpoint

#### Example
```javascript
fetch('https://app.coolpops.com/api/widget/store/store456/default-wheel')
  .then(res => res.json())
  .then(config => console.log(config));
```

### 3. Record Spin

Record a wheel spin event.

```
POST /api/widget/spin
```

#### Request Body
```json
{
  "wheelId": "wheel123",
  "storeId": "store456",
  "segmentId": "segment1",
  "prize": {
    "id": "1",
    "label": "20% OFF",
    "value": "20_percent_off",
    "prizeType": "discount",
    "discountCode": "SPIN20"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "sessionId": "session_123456",
  "platform": "tiendanube"
}
```

#### Response
```json
{
  "success": true,
  "spinId": "spin789"
}
```

### 4. Record Prize Acceptance

Record when a user accepts their prize and provides email.

```
POST /api/widget/prize-accepted
```

#### Request Body
```json
{
  "wheelId": "wheel123",
  "storeId": "store456",
  "prize": {
    "id": "1",
    "label": "20% OFF",
    "discountCode": "SPIN20"
  },
  "email": "customer@example.com",
  "additionalData": {
    "marketingConsent": true,
    "phone": "+1234567890"
  },
  "timestamp": "2024-01-15T10:31:00Z",
  "platform": "tiendanube"
}
```

#### Response
```json
{
  "success": true,
  "claimId": "claim456"
}
```

## Data Types

### WheelConfiguration

```typescript
interface WheelConfiguration {
  id: string;
  name: string;
  segments: WheelSegment[];
  style: WheelStyle;
  physics: WheelPhysics;
}
```

### WheelSegment

```typescript
interface WheelSegment {
  id: string;
  label: string;                    // Display text
  value: string;                    // Internal value
  color: string;                    // Hex color
  textColor: string;                // Text color
  probability: number;              // 0-1 weight
  prizeType: 'discount' | 'freebie' | 'points' | 'no_prize' | 'custom';
  prizeValue?: string;              // Discount percentage or value
  discountCode?: string;            // Actual code to use
  description?: string;             // Prize description
}
```

### WheelStyle

```typescript
interface WheelStyle {
  size: number;                     // Diameter in pixels
  backgroundColor: string;          // Background color
  borderColor: string;              // Border color
  borderWidth: number;              // Border width
  centerCircleColor: string;        // Center button color
  centerCircleSize: number;         // Center button diameter
  pointerColor: string;             // Pointer/arrow color
  pointerStyle: 'arrow' | 'triangle' | 'custom';
  fontFamily: string;               // Font for text
  fontSize: number;                 // Base font size
}
```

### WheelPhysics

```typescript
interface WheelPhysics {
  spinDuration: number;             // Duration in milliseconds
  spinEasing: 'linear' | 'ease-out' | 'cubic-bezier';
  minSpins: number;                 // Minimum rotations
  maxSpins: number;                 // Maximum rotations
  slowdownRate: number;             // Deceleration factor
}
```

### HandleConfiguration

```typescript
interface HandleConfiguration {
  type: 'button' | 'pull_tab' | 'auto_spin' | 'shake' | 'swipe';
  style: HandleStyle;
  text?: string;                    // Button text
  icon?: string;                    // Icon URL
  animation?: HandleAnimation;
}
```

### EmailCaptureConfiguration

```typescript
interface EmailCaptureConfiguration {
  enabled: boolean;
  required: boolean;
  timing: 'before_spin' | 'after_spin' | 'with_prize';
  formStyle: EmailFormStyle;
  fields: EmailFormField[];
  consentText?: string;
  privacyPolicyUrl?: string;
  successMessage?: string;
}
```

### CelebrationConfiguration

```typescript
interface CelebrationConfiguration {
  type: 'confetti' | 'fireworks' | 'balloons' | 'custom' | 'none';
  duration: number;                 // Animation duration
  message: CelebrationMessage;
  sound?: CelebrationSound;
  animation?: CelebrationAnimation;
}
```

### WidgetSettings

```typescript
interface WidgetSettings {
  trigger: 'immediate' | 'delay' | 'scroll' | 'exit_intent' | 'click' | 'onfirstinteraction';
  triggerDelay?: number;            // Seconds for delay trigger
  triggerScrollPercentage?: number; // Percentage for scroll trigger
  showOnlyOnce: boolean;            // Per session
  sessionCooldown?: number;         // Hours between shows
  mobileEnabled: boolean;
  desktopEnabled: boolean;
  targetPages?: string[];           // URL patterns to include
  excludePages?: string[];          // URL patterns to exclude
  targetAudience?: AudienceTargeting;
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid wheel ID",
  "code": "INVALID_WHEEL_ID"
}
```

### 404 Not Found
```json
{
  "error": "Wheel not found",
  "code": "WHEEL_NOT_FOUND"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## CORS Headers

All widget API endpoints include:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

## Rate Limiting

- **GET endpoints**: 100 requests per minute per IP
- **POST endpoints**: 30 requests per minute per IP
- **Burst allowance**: 10 requests

## Caching

- **Wheel configuration**: Cached for 5 minutes (`Cache-Control: public, max-age=300`)
- **Static assets**: Cached for 1 year with versioning

## JavaScript SDK

### Initialization

```javascript
// Widget automatically initializes when script loads
window.CoolPopsWidget = {
  show: function() { /* Shows widget */ },
  hide: function() { /* Hides widget */ },
  config: { /* Current configuration */ }
};
```

### Manual Control

```javascript
// Show widget programmatically
window.CoolPopsWidget.show();

// Hide widget
window.CoolPopsWidget.hide();

// Access configuration
console.log(window.CoolPopsWidget.config);
```

### Events

```javascript
// Listen for widget events
window.addEventListener('coolpops:shown', (e) => {
  console.log('Widget shown');
});

window.addEventListener('coolpops:spin', (e) => {
  console.log('Wheel spun:', e.detail);
});

window.addEventListener('coolpops:prize', (e) => {
  console.log('Prize won:', e.detail);
});

window.addEventListener('coolpops:email', (e) => {
  console.log('Email captured:', e.detail.email);
});

window.addEventListener('coolpops:closed', (e) => {
  console.log('Widget closed');
});
```

## Platform-Specific Integration

### Tienda Nube

```javascript
// Automatic integration with LS object
if (window.LS) {
  // Apply discount
  LS.checkout.setDiscount(discountCode);
  
  // Show notification
  LS.notification.show({
    type: 'success',
    message: 'Discount applied!'
  });
}
```

### Shopify

```javascript
// Automatic integration with Shopify object
if (window.Shopify) {
  // Redirect to discount URL
  window.location.href = `/discount/${discountCode}`;
  
  // Access cart
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => console.log(cart));
}
```

### WooCommerce

```javascript
// URL parameter method
const url = new URL(window.location);
url.searchParams.set('discount', discountCode);
window.location.href = url.toString();
```

## Testing

### Test Mode

Enable test mode to bypass session restrictions:

```html
<script 
  src="https://app.coolpops.com/widget.js"
  data-wheel-id="wheel123"
  data-test="true">
</script>
```

### Mock Responses

In development, the API returns mock data for testing:

```javascript
// Development endpoint returns test wheel
fetch('http://localhost:5173/api/widget/wheel/test-wheel-123')
  .then(res => res.json())
  .then(config => {
    // Returns fully configured test wheel
  });
```

## Webhooks (Coming Soon)

### Spin Event Webhook

```json
POST https://your-server.com/webhooks/spin
{
  "event": "spin.completed",
  "wheelId": "wheel123",
  "storeId": "store456",
  "data": {
    "segmentId": "1",
    "prize": {...},
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Email Capture Webhook

```json
POST https://your-server.com/webhooks/email
{
  "event": "email.captured",
  "wheelId": "wheel123",
  "storeId": "store456",
  "data": {
    "email": "customer@example.com",
    "timestamp": "2024-01-15T10:31:00Z"
  }
}
```
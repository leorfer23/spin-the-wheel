# Tienda Nube Integration Guide

## Overview

This guide explains how to integrate the CoolPops spin wheel widget with Tienda Nube (Nuvemshop) stores. The integration allows store owners to add interactive spin wheels to capture emails and distribute discount codes.

## Integration Methods

### Method 1: Direct Script Installation (Recommended)

1. **Access Tienda Nube Admin Panel**
   - Log into your Tienda Nube admin
   - Navigate to **Mi Tienda Nube** → **Diseño** → **Personalizar diseño actual**

2. **Add Widget Script**
   - Click on **Código HTML**
   - Find the `</body>` tag
   - Add the following code before it:

```html
<!-- CoolPops Spin Wheel -->
<script 
  src="https://app.coolpops.com/tiendanube-widget.js"
  data-wheel-id="YOUR_WHEEL_ID"
  data-trigger="exit_intent"
  data-store-id="{{ store.id }}">
</script>
```

### Method 2: Tienda Nube App Installation

1. **Create Script in Tienda Nube Apps**
   - Script Name: `coolpops widget`
   - Script Handle: `coolpops-widget`
   - URL: `https://app.coolpops.com/tiendanube-widget.js`
   - Activation Place: `Store`
   - Event: `onfirstinteraction` or `onload`

2. **Configure Development Mode**
   - Development URL: `http://localhost:5173/tiendanube-widget.js`
   - Enable for testing in demo store

## Configuration Options

### Script Data Attributes

| Attribute | Description | Default | Options |
|-----------|-------------|---------|---------|
| `data-wheel-id` | Unique wheel identifier | Required | Any valid wheel ID |
| `data-trigger` | When to show the wheel | `exit_intent` | `immediate`, `delay`, `scroll`, `exit_intent`, `click`, `onfirstinteraction` |
| `data-delay` | Seconds before showing (if trigger=delay) | `0` | Any number |
| `data-scroll-percentage` | Page scroll % before showing | `50` | 0-100 |
| `data-test` | Enable test mode | `false` | `true`, `false` |
| `data-store-id` | Tienda Nube store ID | Auto-detected | Store ID |

### Trigger Examples

#### Exit Intent (Default)
```html
<script 
  src="https://app.coolpops.com/tiendanube-widget.js"
  data-wheel-id="wheel123"
  data-trigger="exit_intent">
</script>
```

#### Show After 5 Seconds
```html
<script 
  src="https://app.coolpops.com/tiendanube-widget.js"
  data-wheel-id="wheel123"
  data-trigger="delay"
  data-delay="5">
</script>
```

#### Show After 30% Scroll
```html
<script 
  src="https://app.coolpops.com/tiendanube-widget.js"
  data-wheel-id="wheel123"
  data-trigger="scroll"
  data-scroll-percentage="30">
</script>
```

#### Show on Button Click
```html
<!-- Add this button anywhere on your page -->
<button class="coolpops-trigger">
  🎁 Spin to Win!
</button>

<script 
  src="https://app.coolpops.com/tiendanube-widget.js"
  data-wheel-id="wheel123"
  data-trigger="click">
</script>
```

## Platform-Specific Features

### Automatic Discount Application

The widget automatically detects Tienda Nube and can:

1. **Apply Discount Codes**
   ```javascript
   // Widget automatically calls:
   LS.checkout.setDiscount(discountCode)
   ```

2. **Show Notifications**
   ```javascript
   // Success notifications appear as:
   LS.notification.show({
     type: 'success',
     message: '¡Tu código de descuento ha sido aplicado!'
   })
   ```

3. **Store Discount Locally**
   - Discount codes are saved to localStorage
   - Automatically applied at checkout

### Language Detection

The widget detects the store language:
- Spanish (es) - Default
- Portuguese (pt) - Brazil
- English (en) - If configured

### Mobile Optimization

- Responsive design for all screen sizes
- Touch-optimized for mobile devices
- Fallback triggers for mobile (no exit intent)

## API Configuration

### Wheel Configuration Structure

```javascript
{
  "id": "wheel123",
  "storeId": "store456",
  "wheelData": {
    "segments": [
      {
        "id": "1",
        "label": "20% OFF",
        "value": "20_percent_off",
        "color": "#8B5CF6",
        "probability": 0.15,
        "prizeType": "discount",
        "discountCode": "SPIN20"
      }
    ]
  },
  "emailCaptureConfig": {
    "enabled": true,
    "timing": "before_spin",
    "fields": [
      {
        "name": "email",
        "label": "Correo electrónico",
        "type": "email",
        "required": true
      }
    ]
  },
  "celebrationConfig": {
    "type": "confetti",
    "message": {
      "winTitle": "¡Felicitaciones!",
      "winDescription": "Ganaste {prize}",
      "claimButtonText": "Reclamar Premio"
    }
  }
}
```

## Testing

### Local Development Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access Test Page**
   ```
   http://localhost:5173/tiendanube-test.html
   ```

3. **Test Different Scenarios**
   - Different trigger types
   - Mobile vs desktop
   - Language switching
   - Discount application

### Production Testing

1. **Use Test Mode**
   ```html
   <script 
     src="https://app.coolpops.com/tiendanube-widget.js"
     data-wheel-id="wheel123"
     data-test="true">
   </script>
   ```

2. **Check Console Logs**
   - Test mode enables detailed logging
   - Check for configuration issues
   - Verify API calls

## Common Issues & Solutions

### Widget Not Appearing

1. **Check Console Errors**
   - Open browser developer console
   - Look for JavaScript errors
   - Verify wheel ID is correct

2. **Verify Installation**
   - Ensure script is before `</body>`
   - Check if already shown in session
   - Clear sessionStorage to reset

3. **Platform Detection**
   ```javascript
   // Check if Tienda Nube is detected:
   console.log(window.LS); // Should show LS object
   ```

### Discount Not Applying

1. **Verify Discount Code**
   - Ensure code exists in Tienda Nube
   - Check code is active and valid
   - Test code manually first

2. **Check Integration**
   ```javascript
   // Test discount application:
   localStorage.setItem('coolpops_discount', 'TESTCODE');
   // Then navigate to checkout
   ```

### Styling Conflicts

1. **Widget Uses Isolated Styles**
   - All classes prefixed with `coolpops-`
   - CSS reset applied to widget only
   - Should not affect store styles

2. **Z-Index Issues**
   - Widget uses maximum z-index: 2147483647
   - If still behind elements, check for position:fixed elements

## Best Practices

### 1. Timing Configuration
- **New Visitors**: Use exit intent or delay
- **Returning Visitors**: Use immediate or click
- **Mobile**: Avoid exit intent, use scroll or delay

### 2. Prize Configuration
- Offer meaningful discounts (15-25%)
- Include "no prize" segments for balance
- Use Spanish/Portuguese text for local stores

### 3. Email Collection
- Keep form simple (email only)
- Add consent checkbox for GDPR
- Provide clear value proposition

### 4. Performance
- Widget loads asynchronously
- Doesn't block page rendering
- Minimal impact on store speed

## Analytics Integration

### Track Performance

The widget automatically tracks:
- Impressions (widget shown)
- Spins completed
- Emails collected
- Prizes won
- Conversion rates

### Google Analytics Events

```javascript
// Widget fires these events:
gtag('event', 'coolpops_impression', { wheel_id: 'wheel123' });
gtag('event', 'coolpops_spin', { wheel_id: 'wheel123', prize: '20_off' });
gtag('event', 'coolpops_email_captured', { wheel_id: 'wheel123' });
```

## Support

### Documentation
- Technical Docs: `/docs/WIDGET_ARCHITECTURE.md`
- API Reference: `/docs/API_REFERENCE.md`

### Getting Help
1. Check browser console for errors
2. Enable test mode for debugging
3. Contact support with wheel ID and store ID

## Changelog

### Version 1.0.0
- Initial Tienda Nube integration
- Support for all trigger types
- Automatic discount application
- Multi-language support
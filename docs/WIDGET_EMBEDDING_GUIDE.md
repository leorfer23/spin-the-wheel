# 🎯 Widget Embedding Guide - How It All Works

## Table of Contents
1. [How Widget Embedding Works](#how-widget-embedding-works)
2. [The Magic Behind It](#the-magic-behind-it)
3. [Shopify Integration](#shopify-integration)
4. [Tienda Nube Integration](#tienda-nube-integration)
5. [Implementation Steps](#implementation-steps)

## How Widget Embedding Works

Think of it like adding a YouTube video to your website - you paste a small piece of code, and it loads the entire video player. Our spin wheel works the same way!

### The Simple Version

Your customers (store owners) will add ONE line of code to their website:

```html
<script src="https://app.spinwheelpro.com/widget.js" data-wheel-id="abc123"></script>
```

That's it! This single line will:
1. ✅ Load the spin wheel on their website
2. ✅ Handle all the animations and interactions
3. ✅ Capture emails and record spins
4. ✅ Work on mobile and desktop
5. ✅ Not slow down their website

### What Happens Behind the Scenes

```
Store Website                    Your App (SpinWheel Pro)
     |                                    |
     |  1. Page loads                     |
     |                                    |
     |  2. Script tag executes            |
     |------------------------------------>
     |                                    |
     |  3. Widget.js loads                |
     |<------------------------------------
     |                                    |
     |  4. Fetch wheel configuration      |
     |------------------------------------>
     |                                    |
     |  5. Return wheel data              |
     |<------------------------------------
     |                                    |
     |  6. Show spin wheel                 |
     |                                    |
     |  7. User spins                      |
     |------------------------------------>
     |                                    |
     |  8. Record spin & email             |
     |<------------------------------------
     |                                    |
     |  9. Show prize                      |
```

## The Magic Behind It

### 1. Cross-Origin Resource Sharing (CORS)
Your widget will be loaded on OTHER websites (Shopify stores, etc.), so we need to handle CORS:

```typescript
// Your server needs these headers
headers: {
  'Access-Control-Allow-Origin': '*',  // Or specific domains
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### 2. Isolated Environment
The widget runs in its own "sandbox" so it doesn't conflict with the store's code:

```javascript
// Everything wrapped in an IIFE (Immediately Invoked Function Expression)
(function() {
  // All our code here is isolated
  // Can't conflict with store's jQuery, React, etc.
})();
```

### 3. Dynamic Loading
The widget loads only what it needs, when it needs it:

```javascript
// First: Load minimal loader (5KB)
// Then: Load wheel assets only when triggered
// Finally: Load animations when spinning
```

## Shopify Integration

### Method 1: Theme Customization (Easiest)
Store owners add the script to their theme:

1. **Shopify Admin** → **Online Store** → **Themes**
2. **Actions** → **Edit code**
3. Find `theme.liquid`
4. Add before `</body>`:

```html
<!-- SpinWheel Pro -->
<script src="https://app.spinwheelpro.com/widget.js" 
        data-wheel-id="YOUR_WHEEL_ID"
        data-shopify-shop="{{ shop.permanent_domain }}">
</script>
```

### Method 2: Shopify App (Advanced)
Create a Shopify app that injects the script automatically:

```javascript
// Your Shopify app would inject this
const script = document.createElement('script');
script.src = 'https://app.spinwheelpro.com/widget.js';
script.dataset.wheelId = wheelId;
script.dataset.shopifyShop = Shopify.shop;
document.head.appendChild(script);
```

### Shopify-Specific Features
```javascript
// Detect Shopify and use their APIs
if (window.Shopify) {
  // Can access cart
  const cart = await fetch('/cart.js').then(r => r.json());
  
  // Can add discount codes
  const discountCode = 'SPIN20OFF';
  window.location.href = `/discount/${discountCode}`;
}
```

## Tienda Nube Integration

### Adding to Tienda Nube
Similar process, different admin:

1. **Admin Panel** → **Mi Tienda Nube**
2. **Diseño** → **Personalizar diseño actual**
3. **Código HTML** → Add before `</body>`:

```html
<!-- SpinWheel Pro -->
<script src="https://app.spinwheelpro.com/widget.js" 
        data-wheel-id="YOUR_WHEEL_ID"
        data-store-id="{{ store_id }}">
</script>
```

### Tienda Nube API Integration
```javascript
// Detect Tienda Nube
if (window.LS || window.TiendaNube) {
  // Access their APIs
  const storeId = LS.store.id;
  
  // Add to cart with discount
  LS.cart.addItem({
    discount_code: 'SPIN20OFF'
  });
}
```

## Implementation Steps

Let's build this step by step:

### Step 1: Create the Widget Loader

```javascript
// public/widget.js - This is what stores embed
(function() {
  // Configuration from script tag
  const script = document.currentScript;
  const config = {
    wheelId: script.dataset.wheelId,
    apiUrl: script.src.replace('/widget.js', ''),
    trigger: script.dataset.trigger || 'exit_intent'
  };

  // Create container
  const container = document.createElement('div');
  container.id = 'spinwheel-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999;
    display: none;
  `;
  document.body.appendChild(container);

  // Load the actual widget
  function loadWidget() {
    const widgetScript = document.createElement('script');
    widgetScript.src = config.apiUrl + '/widget-bundle.js';
    widgetScript.onload = function() {
      window.SpinWheelWidget.init(config);
    };
    document.head.appendChild(widgetScript);
  }

  // Trigger handlers
  if (config.trigger === 'immediate') {
    loadWidget();
  } else if (config.trigger === 'exit_intent') {
    document.addEventListener('mouseout', function(e) {
      if (e.clientY < 10) loadWidget();
    }, { once: true });
  }
})();
```

### Step 2: Build the Widget Bundle

```typescript
// src/widget/index.tsx - Main widget app
import { render } from 'preact'; // Smaller than React!
import { SpinWheelWidget } from './SpinWheelWidget';

window.SpinWheelWidget = {
  init(config) {
    // Fetch wheel data
    fetch(`${config.apiUrl}/api/widget/${config.wheelId}`)
      .then(res => res.json())
      .then(wheelData => {
        // Render widget
        render(
          <SpinWheelWidget 
            wheel={wheelData}
            onClose={() => this.close()}
            onSpin={(result) => this.handleSpin(result)}
          />,
          document.getElementById('spinwheel-container')
        );
        
        // Show widget
        document.getElementById('spinwheel-container').style.display = 'block';
      });
  },
  
  close() {
    document.getElementById('spinwheel-container').style.display = 'none';
  },
  
  handleSpin(result) {
    // Send spin result to your API
    fetch(`${config.apiUrl}/api/spins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
  }
};
```

### Step 3: Create API Endpoints

```typescript
// Supabase Edge Function: /api/widget/:wheelId
export async function handler(req: Request) {
  const wheelId = req.params.wheelId;
  
  // Get wheel data (public endpoint - no auth)
  const { data: wheel } = await supabase
    .from('wheels')
    .select(`
      *,
      segments (*),
      campaigns (*)
    `)
    .eq('id', wheelId)
    .eq('is_active', true)
    .single();
  
  // Return CORS headers
  return new Response(JSON.stringify(wheel), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300' // Cache 5 mins
    }
  });
}
```

### Step 4: Handle Different Platforms

```typescript
// src/widget/utils/platform-detector.ts
export function detectPlatform() {
  // Shopify
  if (window.Shopify) {
    return {
      name: 'shopify',
      shop: window.Shopify.shop,
      currency: window.Shopify.currency.active,
      addDiscount: (code) => {
        window.location.href = `/discount/${code}`;
      }
    };
  }
  
  // Tienda Nube
  if (window.LS || window.TiendaNube) {
    return {
      name: 'tiendanube',
      storeId: window.LS?.store?.id,
      addDiscount: (code) => {
        // Tienda Nube specific
      }
    };
  }
  
  // WooCommerce
  if (window.wc || document.body.classList.contains('woocommerce')) {
    return {
      name: 'woocommerce',
      addDiscount: (code) => {
        // Add to URL parameter
        const url = new URL(window.location);
        url.searchParams.set('discount', code);
        window.location.href = url.toString();
      }
    };
  }
  
  // Generic
  return { name: 'generic' };
}
```

### Step 5: Security & Performance

```typescript
// Security measures
const ALLOWED_ORIGINS = [
  'https://*.myshopify.com',
  'https://*.tiendanube.com',
  'http://localhost:*' // Development
];

function validateOrigin(origin: string) {
  return ALLOWED_ORIGINS.some(allowed => {
    const regex = new RegExp(allowed.replace('*', '.*'));
    return regex.test(origin);
  });
}

// Performance: Lazy load heavy assets
async function loadConfetti() {
  const { default: confetti } = await import('canvas-confetti');
  return confetti;
}
```

## Testing Your Widget

### Local Testing
```html
<!-- test.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>My Fake Store</h1>
  <p>Testing the spin wheel widget...</p>
  
  <!-- Your widget -->
  <script src="http://localhost:5173/widget.js" 
          data-wheel-id="test-wheel-id"
          data-trigger="immediate">
  </script>
</body>
</html>
```

### Platform Testing
1. **Shopify**: Use development store
2. **Tienda Nube**: Use demo account
3. **Generic**: Any HTML page

## Common Issues & Solutions

### Issue: "CORS Error"
**Solution**: Add proper headers to your API:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### Issue: "Widget not showing"
**Solution**: Check z-index conflicts:
```css
#spinwheel-container {
  z-index: 2147483647; /* Maximum z-index */
}
```

### Issue: "Styles broken"
**Solution**: Use CSS-in-JS or scoped styles:
```javascript
const styles = `
  .spinwheel-modal {
    all: initial; /* Reset inherited styles */
    /* Your styles */
  }
`;
```

## Revenue Model

### For Store Owners
1. **Free Plan**: 100 spins/month, SpinWheel branding
2. **Pro Plan**: $29/month, 1000 spins, remove branding
3. **Enterprise**: Custom pricing, API access

### Widget Branding
```javascript
// Free plan shows branding
if (plan === 'free') {
  return (
    <div className="widget-footer">
      <a href="https://spinwheelpro.com" target="_blank">
        Powered by SpinWheel Pro
      </a>
    </div>
  );
}
```

---

## Summary

The widget system works by:
1. **One line of code** that store owners paste
2. **Loads your widget** from your servers
3. **Runs independently** without breaking their site
4. **Communicates with your API** to save data
5. **Works on any platform** (Shopify, Tienda Nube, WordPress, etc.)

It's like embedding a YouTube video - simple for users, powerful for you!
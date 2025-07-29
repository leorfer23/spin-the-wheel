# Smart Widget Targeting & Campaign Management

## Overview

The CoolPops widget uses intelligent campaign management to automatically show the right wheel to the right customer at the right time. No need to manually manage wheel IDs or complex JavaScript logic!

## How It Works

### 1. Store-Based Configuration

Instead of specifying a wheel ID, you only need to provide your store ID:

```html
<script 
  src="https://app.coolpops.com/widget.js"
  data-store-id="YOUR_STORE_ID">
</script>
```

### 2. Automatic Campaign Selection

The widget automatically determines which wheel to show based on:

1. **Active Campaigns** - Only campaigns marked as active
2. **Date & Time** - Campaign start/end dates and time-of-day scheduling
3. **Priority** - Higher priority campaigns show first
4. **Targeting Rules** - Page, device, audience, and geographic targeting
5. **Session Limits** - Prevents showing the same wheel repeatedly

### 3. Campaign Priority System

When multiple campaigns match the current context, the system uses priority:

```
Campaign A: Priority 100 (Holiday Sale)
Campaign B: Priority 50 (General Welcome)
Campaign C: Priority 10 (Exit Intent Discount)

Result: Campaign A shows first
```

## Campaign Configuration

### Basic Campaign Settings

```json
{
  "name": "Black Friday 2024",
  "isActive": true,
  "priority": 100,
  "startDate": "2024-11-24T00:00:00Z",
  "endDate": "2024-11-30T23:59:59Z"
}
```

### Advanced Scheduling

#### Day & Time Scheduling

Show only on weekdays during business hours:

```json
{
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5], // Monday-Friday
    "hoursOfDay": {
      "start": 9,  // 9 AM
      "end": 17    // 5 PM
    },
    "timezone": "America/New_York"
  }
}
```

#### Blackout Dates

Exclude specific dates:

```json
{
  "schedule": {
    "blackoutDates": [
      "2024-12-25", // Christmas
      "2024-01-01"  // New Year
    ]
  }
}
```

### Targeting Options

#### Page Targeting

Show on specific pages or page types:

```json
{
  "targeting": {
    "pages": {
      "includePages": ["home", "product", "category"],
      "excludePages": ["checkout", "cart"],
      "includeUrls": [
        "*/products/sale/*",
        "*/black-friday"
      ],
      "excludeUrls": [
        "*/admin/*",
        "*/account/*"
      ]
    }
  }
}
```

#### Device Targeting

Target specific devices:

```json
{
  "targeting": {
    "devices": {
      "includeDevices": ["mobile", "tablet"],
      "excludeDevices": ["desktop"]
    }
  }
}
```

#### Audience Targeting

Target based on visitor behavior:

```json
{
  "targeting": {
    "audience": {
      "visitorType": "new",           // new, returning, or all
      "cartValue": {
        "min": 50,                    // Show if cart > $50
        "max": 500                    // But less than $500
      },
      "language": ["es", "pt"],       // Spanish or Portuguese speakers
      "hasOrderedBefore": false       // First-time customers only
    }
  }
}
```

#### Geographic Targeting

Target by location:

```json
{
  "targeting": {
    "geo": {
      "includeCountries": ["US", "CA", "MX"],
      "excludeRegions": ["Quebec"],
      "includeCities": ["New York", "Los Angeles", "Chicago"]
    }
  }
}
```

#### Traffic Source Targeting

Target based on how visitors arrived:

```json
{
  "targeting": {
    "trafficSource": {
      "includeReferrers": ["google.com", "facebook.com"],
      "includeUtmSources": ["email", "social"],
      "excludeUtmCampaigns": ["internal"]
    }
  }
}
```

## Use Cases

### 1. Holiday Campaign

**Goal**: Show special holiday wheel only during December

```json
{
  "name": "Holiday Special",
  "priority": 90,
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "targeting": {
    "pages": {
      "excludePages": ["checkout"] // Don't interrupt checkout
    }
  }
}
```

### 2. New Visitor Welcome

**Goal**: Welcome first-time visitors with a special offer

```json
{
  "name": "Welcome New Visitors",
  "priority": 50,
  "targeting": {
    "audience": {
      "visitorType": "new"
    },
    "pages": {
      "includePages": ["home", "product"]
    }
  }
}
```

### 3. Cart Abandonment Prevention

**Goal**: Show discount to users about to leave with items in cart

```json
{
  "name": "Don't Leave Empty Handed",
  "priority": 70,
  "targeting": {
    "audience": {
      "cartValue": {
        "min": 25 // Only if cart has value
      }
    },
    "pages": {
      "includePages": ["cart", "product"]
    }
  },
  "settings": {
    "trigger": "exit_intent"
  }
}
```

### 4. Mobile-Only Flash Sale

**Goal**: Special offer for mobile users only

```json
{
  "name": "Mobile Flash Sale",
  "priority": 80,
  "targeting": {
    "devices": {
      "includeDevices": ["mobile"]
    }
  },
  "schedule": {
    "hoursOfDay": {
      "start": 12,  // Noon
      "end": 14     // 2 PM
    }
  }
}
```

### 5. Regional Campaign

**Goal**: Different offers for different regions

```json
{
  "name": "USA Free Shipping",
  "priority": 60,
  "targeting": {
    "geo": {
      "includeCountries": ["US"]
    }
  }
}
```

### 6. Language-Specific Campaign

**Goal**: Spanish speakers get different wheel

```json
{
  "name": "Oferta Especial",
  "priority": 65,
  "targeting": {
    "audience": {
      "language": ["es"]
    }
  }
}
```

## Best Practices

### 1. Priority Management

- **100-90**: Critical campaigns (Black Friday, major sales)
- **80-70**: Time-sensitive offers
- **60-50**: General campaigns
- **40-30**: Fallback campaigns
- **20-10**: Default/evergreen campaigns

### 2. Avoid Conflicts

- Don't create overlapping campaigns without clear priorities
- Use exclusion rules to prevent showing on sensitive pages
- Test targeting rules before going live

### 3. Performance Tips

- Limit active campaigns to improve selection speed
- Use specific targeting to reduce evaluation time
- Archive old campaigns instead of keeping them inactive

### 4. Testing Campaigns

Use test mode to preview campaigns:

```html
<script 
  src="https://app.coolpops.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-test="true">
</script>
```

## Debugging

### Why Isn't My Campaign Showing?

1. **Check Active Status**
   - Is campaign marked as active?
   - Are you within date range?

2. **Verify Targeting**
   - Does current context match targeting rules?
   - Check device, page, language matching

3. **Review Priority**
   - Is another campaign with higher priority showing instead?

4. **Session Limits**
   - Has this wheel already been shown in current session?
   - Clear session storage to reset

### Campaign Evaluation Log

In test mode, check console for evaluation details:

```
[CoolPops Widget] Evaluating campaigns for store: store123
[CoolPops Widget] Campaign "Holiday Sale" - Priority: 100 - Eligible: Yes
[CoolPops Widget] Campaign "Welcome" - Priority: 50 - Eligible: No (outside date range)
[CoolPops Widget] Selected: Holiday Sale
```

## API Context

The widget sends this context for campaign evaluation:

```javascript
{
  "storeId": "store123",
  "url": "https://mystore.com/products/shoes",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "language": "en-US",
  "isMobile": false,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Migration Guide

### From Manual Wheel IDs

**Before:**
```html
<script 
  src="https://app.coolpops.com/widget.js"
  data-wheel-id="HOLIDAY_WHEEL_2024">
</script>
```

**After:**
```html
<script 
  src="https://app.coolpops.com/widget.js"
  data-store-id="YOUR_STORE_ID">
</script>
```

Then configure "Holiday 2024" campaign in dashboard with appropriate dates and priority.

## Summary

The smart targeting system eliminates the need for complex JavaScript logic or manual wheel ID management. Simply:

1. Add widget with store ID only
2. Configure campaigns in dashboard
3. Let the system handle the rest!

This approach provides:
- ✅ Easier management
- ✅ More flexible targeting
- ✅ Better performance tracking
- ✅ No code changes for new campaigns
- ✅ A/B testing capabilities
- ✅ Automatic optimization
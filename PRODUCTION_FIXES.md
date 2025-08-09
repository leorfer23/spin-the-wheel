# Production Fixes Required

## Critical Issues to Fix Before Production

### 1. ✅ COUPONS NOT WORKING IN PRODUCTION - FIXED

**Priority:** CRITICAL  
**Issue:** Coupons API was returning 404 in production due to Vercel not recognizing catch-all route.

**Root Cause:**

- Vercel doesn't properly recognize `api/tiendanube/proxy/[...path].js` catch-all route
- Works locally but fails in production with 404

**Solution Implemented:**

1. Created alternative endpoint `api/tiendanube-proxy.js` that uses query params
2. Updated `tiendaNubeApiService.ts` to use alternative endpoint in production
3. Added comprehensive logging to debug API requests

**Changes Made:**

- **NEW:** `api/tiendanube-proxy.js` - Alternative proxy endpoint using query params
- **UPDATED:** `src/services/integrations/tiendanube/tiendaNubeApiService.ts`:
  - Lines 69-72: Detects production and uses alternative endpoint
  - Lines 75-83: Enhanced production debugging logs
  - Lines 104-119: Better error logging for 404 responses

**How it Works Now:**

```javascript
// In development (localhost):
/api/tiendanube/proxy/6545032/coupons

// In production (rooleta.com):
/api/tiendanube-proxy?path=6545032/coupons
```

**Testing Required:**

- Deploy to production and verify coupons load correctly
- Check console logs for proper API routing
- Test coupon creation and assignment to wheel segments

---

### 3. 📧 EMAIL CAPTURE ADAPTATION NOT WORKING

**Priority:** HIGH  
**Issue:** Widget doesn't adapt to selected email capture type.

**Affected Files:**

- `src/components/widget/EmailCapture.tsx`
- `src/components/dashboard/products/wheel/sections/CaptureSection.tsx`
- `src/components/widget/UnifiedWheelDialog.tsx`

**Key Code:**

- EmailCapture component has different modes but doesn't receive proper config
- CaptureSection saves config but doesn't propagate to preview

**Fix Required:**

- Pass email capture config from dashboard to preview
- Implement dynamic email capture rendering based on selection
- Test all email capture modes

---

### 10. 📝 TEXT SIZE ADAPTATION IN SEGMENTS

**Priority:** MEDIUM  
**Issue:** Text in wheel segments doesn't adapt to fit within segment boundaries.

**Affected Files:**

- `src/components/wheel/Segment.tsx`
- `src/utils/wheelUtils.ts`

**Fix Required:**

- Implement dynamic font sizing based on segment size
- Add text wrapping for long labels
- Calculate optimal font size based on segment angle
- Add text truncation as fallback

---

### 11. 🎯 REMOVE QUICK PRESETS

**Priority:** LOW  
**Issue:** Remove "Quick Presets" feature.

**Affected Files:**

- `src/components/dashboard/products/wheel/sections/appearance/DesignThemeSelector.tsx`
- `src/components/dashboard/products/wheel/sections/AppearanceSection.tsx`

**Fix Required:**

- Remove preset selector UI
- Remove preset theme data
- Simplify appearance configuration

---

### 12. 🎈 FLOATING BUTTON PREVIEW MISSING

**Priority:** HIGH  
**Issue:** Floating button preview has been removed/hidden.

**Affected Files:**

- `src/components/widget/FloatingHandle.tsx`
- `src/components/dashboard/products/wheel/sections/HandleSection.tsx`

**Current State:**

- FloatingHandle component exists
- Preview might be conditionally hidden

**Fix Required:**

- Re-enable floating button preview
- Add preview in HandleSection
- Ensure preview updates with configuration changes

---

### 13. 📧 EMAIL CAPTURE OPTIONS CONFUSING

**Priority:** HIGH  
**Issue:** The 3 email capture options are confusing. Should have just 1 with customizable text.

**Affected Files:**

- `src/components/dashboard/products/wheel/sections/CaptureSection.tsx`
- `src/components/widget/EmailCapture.tsx`

**Current Options:**

- Multiple capture modes
- Confusing UI with 3 options
- Limited customization

**Fix Required:**

- Simplify to single email capture mode
- Add text customization fields
- Allow adding/removing elements like "LIMITED TIME"
- Improve UI clarity

---

### 14. 🕐 SCHEDULE ACTIVATION AUTO-SAVES

**Priority:** MEDIUM  
**Issue:** Schedule tab auto-saves when opened, which shouldn't happen.

**Affected Files:**

- `src/components/dashboard/products/wheel/sections/ScheduleSection.tsx`
- `src/components/scheduling/ScheduleConfigurator.tsx`
- `src/components/dashboard/products/wheel/WheelSchedule.tsx`

**Fix Required:**

- Remove auto-save on tab open
- Only save when user explicitly changes settings
- Add save confirmation

---

### 15. ✅ SCHEDULE ACTIVATION NEEDS WARNING [COMPLETED]

**Priority:** HIGH  
**Issue:** Users should choose activation type with clear warning about immediate activation.

**Affected Files:**

- `src/components/dashboard/products/wheel/sections/ScheduleSection.tsx`
- `src/components/scheduling/SimpleScheduleConfig.tsx`

**Current Issue:**

- No clear activation choice
- No warning about immediate activation
- Confusing UX flow

**Fix Required:**

- Add explicit choice: "Always Active" vs "Scheduled"
- Add warning modal when selecting "Always Active"
- Improve activation flow UX
- Add confirmation before activation

---

## Development Setup

To fix these issues, the development server is running at:

```bash
npm run dev
```

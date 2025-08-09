# Production Fixes Required

## Critical Issues to Fix Before Production

### 1. ❌ COUPONS NOT WORKING IN PRODUCTION SEGMENTS
**Priority:** CRITICAL  
**Issue:** Coupons integration is not working in production environment when assigning to wheel segments.

**Affected Files:**
- `src/components/dashboard/products/wheel/sections/SegmentsSection.tsx` (lines 133-151)
- `src/components/dashboard/products/wheel/components/InlineCouponSelectorV2.tsx`
- `src/services/integrations/tiendanube/couponsService.ts`
- `src/contexts/TiendaNubeCouponsContext.tsx`

**Key Code Location:**
- SegmentsSection.tsx handles coupon assignment via `handleCouponValueChange` (line 133)
- The coupon selector components are located in `components/dashboard/products/wheel/components/`

**Fix Required:**
- Check API endpoints and authentication in production
- Verify CORS settings for TiendaNube API
- Ensure proper error handling in coupon fetching
- Test coupon creation flow in production environment

---

### 2. 🎨 PREVIEW VIEW LAYOUT BROKEN
**Priority:** HIGH  
**Issue:** Preview shows wheel on left, email capture on right - needs proper CRO-optimized layout.

**Affected Files:**
- `src/components/widget/PreviewCarousel.tsx`
- `src/components/widget/FullWidget.tsx`
- `src/components/widget/UnifiedWheelDialog.tsx`

**Current Issue:**
- Layout is not responsive
- Email capture positioning is incorrect
- Preview doesn't match actual widget appearance

**Fix Required:**
- Implement proper responsive grid layout
- Center wheel with email capture overlay
- Match production widget styling

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

### 4. 🎯 POINTER NOT VISIBLE ON WHEEL
**Priority:** CRITICAL  
**Issue:** The wheel pointer/indicator is not showing up.

**Affected Files:**
- `src/components/wheel/Pointer.tsx`
- `src/components/wheel/FortuneWheel.tsx` (lines 433-445)
- `src/components/dashboard/products/wheel/WheelProduct.tsx` (lines 120-125, 290)

**Key Code:**
```tsx
// FortuneWheel.tsx line 433
{!hidePointer && config.pointer && (
  // Pointer rendering logic
)}
```

**Fix Required:**
- Check if `config.pointer` is being passed correctly
- Verify pointer SVG rendering
- Check z-index and positioning issues
- Ensure pointer config is saved and loaded properly

---

### 5. ⚙️ POINTER CONFIGURATION MISSING
**Priority:** HIGH  
**Issue:** Can't find pointer configuration in the dashboard.

**Affected Files:**
- `src/components/dashboard/products/wheel/sections/AppearanceSection.tsx` (lines 186, 389-434)
- `src/components/dashboard/products/wheel/sections/appearance/DesignThemeSelector.tsx`

**Current Location:**
- PointerConfig component exists in AppearanceSection.tsx (line 389)
- Only shown in "Advanced" mode

**Fix Required:**
- Make pointer configuration always visible
- Move to basic settings or create dedicated section
- Add pointer preview in configuration

---

### 6. 🔑 REMOVE "GENERATE UNIQUE CODE" FEATURE
**Priority:** MEDIUM  
**Issue:** "Generate unique code" feature should be removed.

**Affected Files:**
- `src/components/dashboard/products/wheel/components/InlineCouponSelectorV2.tsx` (lines 386-387, 433)
- `src/components/dashboard/products/wheel/components/SimpleCouponSelector.tsx` (lines 257-258)

**Code to Remove:**
```tsx
// Lines showing "Generar código único"
<p className="text-sm font-medium">Generar código único</p>
<p className="text-xs text-gray-500">Crear un código automático</p>
```

**Fix Required:**
- Remove all "Generate unique code" UI elements
- Remove associated logic
- Clean up unused code

---

### 7. 📏 LONG COUPON CODES BREAK LAYOUT
**Priority:** HIGH  
**Issue:** Long coupon codes push content to the right, breaking layout.

**Affected Files:**
- `src/components/dashboard/products/wheel/components/InlineCouponSelectorV2.tsx`
- `src/components/dashboard/products/wheel/sections/SegmentsSection.tsx`
- `src/components/CelebrationPopup.tsx`

**Fix Required:**
- Add text truncation with ellipsis
- Implement responsive text sizing
- Add tooltips for full code display
- Set max-width constraints

---

### 8. 🔄 IMPROVE DRAG-TO-REORDER UX
**Priority:** MEDIUM  
**Issue:** Drag and drop for segment reordering needs polish.

**Affected Files:**
- `src/components/dashboard/products/wheel/sections/SegmentsSection.tsx`

**Current Implementation:**
- Uses basic drag and drop
- No visual feedback during drag
- No smooth animations

**Fix Required:**
- Add drag handle icons
- Implement smooth animations
- Add visual feedback (ghost element, drop zones)
- Consider using a library like @dnd-kit/sortable

---

### 9. 🎨 WHEEL DECORATIVE ELEMENTS MISSING
**Priority:** HIGH  
**Issue:** Wheel decorative elements (pegs, borders, etc.) have disappeared.

**Affected Files:**
- `src/components/wheel/PegRing.tsx`
- `src/components/wheel/FortuneWheel.tsx`
- `src/components/dashboard/products/wheel/sections/appearance/PegSettings.tsx`

**Fix Required:**
- Check if PegRing component is being rendered
- Verify peg configuration is being passed
- Check SVG rendering and visibility
- Ensure decorative elements config is saved

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

### 15. ⚠️ SCHEDULE ACTIVATION NEEDS WARNING
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

## Testing Checklist

- [ ] Test coupon integration in production environment
- [ ] Verify preview layout matches production widget
- [ ] Confirm email capture adapts to configuration
- [ ] Check pointer visibility in all themes
- [ ] Ensure pointer configuration is accessible
- [ ] Verify unique code generation is removed
- [ ] Test layout with long coupon codes
- [ ] Check drag-to-reorder smoothness
- [ ] Confirm all wheel decorative elements appear
- [ ] Test text sizing in small segments
- [ ] Verify quick presets are removed
- [ ] Check floating button preview visibility
- [ ] Test simplified email capture
- [ ] Confirm schedule doesn't auto-save
- [ ] Test schedule activation warnings

## Additional Notes

- All user-facing text should be in Spanish
- Follow TypeScript strict mode - no type errors
- Keep files under 300 lines
- Use clean code principles
- Test thoroughly before marking as complete
# Widget Quick Start Guide

## 🚀 Get Your Spin Wheel Live in 5 Minutes

### Step 1: Get Your Store ID

The widget automatically determines which wheel to show based on your store configuration and active campaigns. You only need your Store ID!

### Step 2: Choose Your Platform

<details>
<summary><b>Tienda Nube / Nuvemshop</b></summary>

Add this code before `</body>` in your theme:

```html
<script 
  src="https://www.rooleta.com/tiendanube-widget.js"
  data-store-id="YOUR_STORE_ID"
  data-trigger="exit_intent">
</script>
```

**Where to add:**
1. Mi Tienda Nube → Diseño → Personalizar
2. Click "Código HTML"
3. Paste before `</body>`
</details>

<details>
<summary><b>Shopify</b></summary>

Add this code to your `theme.liquid`:

```html
<script 
  src="https://www.rooleta.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-trigger="exit_intent"
  data-shopify-shop="{{ shop.permanent_domain }}">
</script>
```

**Where to add:**
1. Online Store → Themes → Edit Code
2. Open `theme.liquid`
3. Paste before `</body>`
</details>

<details>
<summary><b>WooCommerce / WordPress</b></summary>

Add this code to your theme footer:

```html
<script 
  src="https://www.rooleta.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-trigger="exit_intent">
</script>
```

**Where to add:**
1. Appearance → Theme Editor
2. Open `footer.php`
3. Paste before `</body>`
</details>

<details>
<summary><b>Any Website</b></summary>

Add this code before `</body>`:

```html
<script 
  src="https://www.rooleta.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-trigger="exit_intent">
</script>
```
</details>

### Step 3: Configure Triggers

Choose when to show your wheel:

#### Exit Intent (Recommended)
```html
data-trigger="exit_intent"
```
Shows when user tries to leave

#### Immediate
```html
data-trigger="immediate"
```
Shows right away

#### After Delay
```html
data-trigger="delay"
data-delay="5"
```
Shows after 5 seconds

#### On Scroll
```html
data-trigger="scroll"
data-scroll-percentage="50"
```
Shows after scrolling 50% of page

#### On Click
```html
data-trigger="click"
```
Add class `coolpops-trigger` to any button

### Step 4: Test Your Wheel

Add test mode to see the wheel multiple times:

```html
<script 
  src="https://www.rooleta.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-trigger="immediate"
  data-test="true">
</script>
```

## 🎨 Customization Examples

### Mobile-Only Wheel
```html
<script>
if (window.innerWidth <= 768) {
  document.write('<script src="https://www.rooleta.com/widget.js" data-store-id="YOUR_STORE_ID"><\/script>');
}
</script>
```

### Custom Trigger Button
```html
<button class="coolpops-trigger" style="
  background: #8B5CF6;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  cursor: pointer;
">
  🎁 Spin to Win!
</button>

<script 
  src="https://www.rooleta.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-trigger="click">
</script>
```

### Holiday Campaign

The widget automatically shows holiday campaigns based on your dashboard configuration. No need to change the code!

```html
<script 
  src="https://www.rooleta.com/widget.js"
  data-store-id="YOUR_STORE_ID">
</script>
```

## 📊 Track Performance

### Google Analytics
The widget automatically sends events:
- `coolpops_impression` - Widget shown
- `coolpops_spin` - Wheel spun
- `coolpops_email_captured` - Email collected

### Custom Tracking
```javascript
window.addEventListener('coolpops:spin', (e) => {
  // Send to your analytics
  gtag('event', 'spin_wheel', {
    'prize': e.detail.prize,
    'wheel_id': e.detail.wheelId
  });
});
```

## 🔧 Troubleshooting

### Widget Not Showing?

1. **Check Console**
   - Press F12 → Console tab
   - Look for errors in red

2. **Clear Session**
   ```javascript
   sessionStorage.clear();
   location.reload();
   ```

3. **Verify Campaign**
   - Check active campaigns in dashboard
   - Ensure at least one campaign is active
   - Verify campaign dates and targeting

### Discount Not Working?

1. **Tienda Nube**: Check discount exists in admin
2. **Shopify**: Verify discount code is active
3. **Other**: Ensure manual code entry works

## 🎯 Best Practices

### Do's ✅
- Test on mobile and desktop
- Use meaningful prizes (15-25% off)
- Keep email form simple
- Set appropriate triggers for your audience

### Don'ts ❌
- Don't show too frequently (annoys users)
- Don't offer prizes you can't fulfill
- Don't use aggressive popups on mobile
- Don't forget to test before going live

## 📱 Mobile Tips

1. **Use scroll trigger instead of exit intent**
   ```html
   data-trigger="scroll"
   data-scroll-percentage="30"
   ```

2. **Delay on mobile for better UX**
   ```html
   data-trigger="delay"
   data-delay="10"
   ```

3. **Test touch interactions**
   - Ensure spin button is large enough
   - Check form inputs work properly

## 🌍 Multi-Language

### Spanish
```javascript
// Widget auto-detects Spanish stores
// Or force Spanish:
<script 
  src="https://www.rooleta.com/widget.js"
  data-wheel-id="YOUR_WHEEL_ID"
  data-lang="es">
</script>
```

### Portuguese
```javascript
<script 
  src="https://www.rooleta.com/widget.js"
  data-wheel-id="YOUR_WHEEL_ID"
  data-lang="pt">
</script>
```

## 💡 Advanced Examples

### A/B Testing

The widget automatically handles A/B testing based on your campaign priorities and targeting rules configured in the dashboard.

### Conditional Display
```javascript
// Show only to new visitors
if (!localStorage.getItem('returning_visitor')) {
  document.write('<script src="https://app.coolpops.com/widget.js" data-wheel-id="NEW_VISITOR_WHEEL"><\/script>');
  localStorage.setItem('returning_visitor', 'true');
}
```

### Page-Specific Wheels

Configure page-specific campaigns in your dashboard with URL targeting. The widget automatically shows the right wheel based on the current page!

## 🆘 Need Help?

1. **Documentation**: Check `/docs` folder
2. **Test Page**: `https://www.rooleta.com/test`
3. **Support**: support@rooleta.com

## 🎉 You're Ready!

Your spin wheel is now live! Monitor performance in your dashboard and adjust settings as needed.

**Pro tip**: Start with exit intent trigger and 20% discount for best results!
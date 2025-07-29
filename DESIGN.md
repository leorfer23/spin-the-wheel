# 🎨 DESIGN GUIDELINES

## 🌟 Vision

A minimal, iOS-inspired app that feels more like a beautiful, intuitive game than traditional SaaS. Interfaces are immersive, fluid, and focused—no sidebars, no headers—just floating, touchable surfaces.

Our product enhances online stores (Shopify, Tiendanube) with interactive widgets like **Spin the Wheel** and more. The design must reflect joy, motion, and ease.

---

## 🧭 Core Design Principles

- **Minimal & Clean**  
  Interfaces should be stripped to the essentials. Every element must have a clear purpose.

- **Intuitive by Default**  
  No steep learning curves. Actions should be obvious, discoverable, and delightful.

- **Floating UI**  
  No fixed layouts. Use floating cards, sheets, and modals. Embrace depth, layering, and breathing space.

- **Game-Like Interactions**  
  Use animations, feedback, and playful transitions to make the UI feel alive.

- **Mobile-First Mindset**  
  Inspired by iOS. Everything should look and feel native to touch environments.

---

## 🎮 UI Inspiration

- **Superhuman** – sleek, fast, intentional
- **iOS Design System** – modal flows, frosted glass, big type
- **Games** – reward-driven UI, playful animations, zero-friction flows
- **Apple Vision Pro** – floating cards, translucent surfaces, spatial depth

---

## 🛠 Tech Stack Alignment

- **React + TailwindCSS** – rapid prototyping with full control
- **shadcn/ui** – consistent, composable components styled with Tailwind
- **framer-motion** – for fluid, dynamic transitions

---

## 🧱 Component Philosophy

- Use `Card`, `Dialog`, `Sheet` over pages and routes
- Prefer `max-w-[screen-sm/md]` with centered layouts
- Spacing should feel roomy: `gap-4`, `p-6`, `space-y-6`
- Rounded corners: always `rounded-2xl` or more
- Subtle shadows and `backdrop-blur` for a premium look

---

## 🎨 Styling Direction

- **Fonts**: Inter, SF Pro, system UI — clean and readable
- **Colors**: Light base (`white`, `gray-100`), accented by store theme
- **Accent Colors**: Use per-brand (e.g., Shopify green, Tiendanube blue)
- **Feedback**: Use motion, confetti, pulsing, or emoji-style icons

---

## 🚫 What to Avoid

- Sidebars, navbar-heavy layouts
- Dense forms or configuration pages
- SaaS-like tables, checkboxes, or dashboard blocks
- Overuse of text — clarity comes from layout, not labels

---

## ✅ What to Embrace

- Floating UI components
- Gamified flows (spinners, rewards, progress)
- Clear CTA buttons with icons
- Lightness, depth, and microinteractions

---

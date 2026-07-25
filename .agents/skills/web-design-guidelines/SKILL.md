---
name: web-design-guidelines
description: Vercel Labs official web interface guidelines for accessibility, performance, responsive layout math, and clean HTML5/CSS standards.
---

# Vercel Web Interface Guidelines Skill Specification

## 🛠️ Performance & Accessibility Guidelines

### 1. WCAG 2.2 AA Accessibility & HTML Semantics
- Use proper semantic HTML elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<button>`).
- Ensure touch targets are at least 44x44px.
- Provide descriptive `alt` text for images and `aria-label` for icon-only buttons.

### 2. Responsive Layout & Motion
- Mobile-first approach: Ensure fluid layout across all viewports (320px to 1920px).
- Respect `prefers-reduced-motion` for accessibility.
- Fast, non-blocking CSS animations with GPU acceleration (`transform`, `opacity`).

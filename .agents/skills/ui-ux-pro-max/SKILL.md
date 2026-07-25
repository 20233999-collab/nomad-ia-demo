---
name: ui-ux-pro-max
description: Pro-grade UI/UX design intelligence, design system tokens, WCAG 2.2 AA accessibility rules, micro-interactions, responsive layouts, color harmony, and anti-cheap-UI constraints.
---

# UI/UX Pro Max Skill Specification

## 🎨 Core Design Intelligence Rules

### 1. Visual Hierarchy & Contrast
- **WCAG 2.2 AA Standard:** Ensure text contrast ratio is at least 4.5:1 for normal text and 3:1 for large headers.
- **Surface Elevation:** Never rely on flat borders alone. Combine subtle surface tinting with layered drop shadows (`0 4px 12px rgba(0,0,0,0.08)`) or 3D tactile borders.
- **Typography Scale:** Limit font sizes to a strict 4-step hierarchy:
  - Display / Title: Bold, 1.5rem - 2rem (e.g., Fredoka / Nunito / Inter)
  - Subheading / Section: Semi-bold, 1.1rem - 1.25rem
  - Body Text: Regular, 0.95rem - 1.05rem (line-height 1.4 - 1.6)
  - Micro-copy / Badges: Heavy weight (700-800), uppercase, 0.7rem - 0.85rem

### 2. Gamified UI & Tactile Feedback (Duolingo / Modern Mobile standard)
- **3D Tactile Buttons:** Every actionable primary button MUST have an offset bottom border/shadow (`box-shadow: 0 4px 0 var(--btn-shadow)`).
- **Active State Transition:** When pressed (`:active`), transform the button down by 3-4px (`transform: translateY(4px)`) and flatten the shadow to `0 0 0`.
- **Component Anatomy:**
  - Rounding: Use consistent 16px - 24px border radii for cards and drawers.
  - Options: Interactive options must highlight with distinct border and background tinting upon selection.

### 3. Dark & Light Theme System
- **Dark Mode Background:** Avoid pure `#000000`. Use rich deep slates `#131f24` or `#0f172a`.
- **Dark Card Containers:** Use `#18252d` or `#1e293b` with `#37464f` subtle borders.
- **Light Mode Background:** Use soft off-whites `#f7f9fa` or `#f8fafc`.

### 4. Micro-Animations & Responsiveness
- All interactive state transitions must use `cubic-bezier(0.175, 0.885, 0.32, 1.275)` or smooth `0.2s ease` transitions.
- Floating elements (mascots/avatars) must feature gentle float Keyframe loops.

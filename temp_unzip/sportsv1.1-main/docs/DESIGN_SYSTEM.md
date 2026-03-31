# Play Legends Design System

## 1. Introduction
The Play Legends Design System is the single source of truth for UI/UX across the platform. It ensures consistency, accessibility, and a premium "sports-tech" feel.

**Core Principles:**
- **Energetic & Trustworthy:** A balance of vibrant sports energy and reliable data presentation.
- **Content-First:** UI recedes; content (scores, players, stats) takes center stage.
- **Consistent & Predictable:** Standardized patterns reduce cognitive load.
- **Accessible:** Usable by everyone, regardless of ability.

## 2. Design Tokens

### 2.1 Color Palette
We use CSS variables for theme flexibility (light/dark mode ready) and semantic naming.

| Token | Value (Ref) | Usage |
|-------|-------------|-------|
| `--primary` | `#2563EB` (Blue-600) | Primary actions, links, active states |
| `--primary-hover` | `#1D4ED8` (Blue-700) | Hover states for primary elements |
| `--secondary` | `#22C55E` (Green-500) | Success states, positive trends |
| `--accent` | `#F59E0B` (Amber-500) | Warnings, highlights, premium features |
| `--bg-page` | `#F8FAFC` (Slate-50) | Main application background |
| `--bg-card` | `#FFFFFF` (White) | Card backgrounds, modals, dropdowns |
| `--bg-muted` | `#F1F5F9` (Slate-100) | Secondary backgrounds, dividers |
| `--text-primary` | `#0F172A` (Slate-900) | Headings, main content |
| `--text-secondary` | `#64748B` (Slate-500) | Subtitles, helper text, icons |
| `--border` | `#E2E8F0` (Slate-200) | Borders, dividers |
| `--live` | `#EF4444` (Red-500) | Live status indicators |

### 2.2 Typography
**Font Family:** `Inter`, system-ui, sans-serif

| Scale | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | 12px | 400/500 | 16px | Badges, metadata |
| `text-sm` | 14px | 400/500 | 20px | Body text, inputs, buttons |
| `text-base` | 16px | 400/600 | 24px | Lead text, section headers |
| `text-lg` | 18px | 600/700 | 28px | Card titles, modal titles |
| `text-xl` | 20px | 600/700 | 28px | Page titles |
| `text-2xl` | 24px | 700 | 32px | Major section headings |

### 2.3 Spacing & Layout
We use a 4px grid system.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--space-xs` | 8px | `p-2`, `gap-2` | Tight grouping (icon + text) |
| `--space-sm` | 12px | `p-3`, `gap-3` | Component internal padding |
| `--space-md` | 16px | `p-4`, `gap-4` | Default component spacing |
| `--space-lg` | 24px | `p-6`, `gap-6` | Section separation |
| `--space-xl` | 32px | `p-8`, `gap-8` | Page padding, major sections |

**Layout Primitives:**
- **Page Container:** `max-width: 1200px`, centered.
- **Grid:** Responsive grids using `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Card:** The fundamental building block for content grouping.

## 3. Component Library

### 3.1 Atoms
- **Button:** Variants (Primary, Secondary, Ghost, Destructive). Sizes (sm, md, lg).
- **Input/Select:** Standardized form controls with labels, helper text, and error states.
- **Badge:** Status indicators (Live, Upcoming, Completed, Winner).
- **Avatar:** User/Team images with fallbacks.
- **Icon:** Consistent 20px/24px Lucide icons.

### 3.2 Molecules
- **Card:** Container with standardized padding, border, and shadow.
- **EmptyState:** Illustration + Title + Description + Action.
- **PageHeader:** Title + Breadcrumbs + Actions.
- **SearchInput:** Input with integrated search icon and clear button.

### 3.3 Organisms
- **Navbar:** Branding, Global Navigation, User Profile.
- **Sidebar:** Contextual navigation (when applicable).
- **DataTable:** Sortable, filterable rows with pagination.

## 4. Implementation Checklist

### Global
- [ ] Verify `tailwind.config.js` matches design tokens.
- [ ] Ensure `index.css` defines all CSS variables in `:root`.
- [ ] Set up global font face (Inter).

### Components
- [ ] **Button**: Ensure all variants exist.
- [ ] **Input/Select**: Replace all native inputs.
- [ ] **Badge**: Create reusable component.
- [ ] **Avatar**: Create reusable component.
- [ ] **Dialog/Modal**: Standardize modal interactions.
- [ ] **Toast**: Implement global notification system.

### Pages (Migration Plan)
- [ ] **Auth Screens**: Login/Register (Completed).
- [ ] **Dashboard**: Verify spacing and cards.
- [ ] **Tournament Creation**: Replace file uploads and date pickers.
- [ ] **Match Center**: Ensure "Live" badges and scorecards match system.
- [ ] **Profile**: Update form fields.

## 5. Quality Assurance
- **Visual Regression:** Check for layout shifts.
- **Accessibility:** 
  - All interactive elements must have `:focus-visible` styles.
  - Color contrast ratio > 4.5:1.
  - Semantic HTML tags (`<main>`, `<nav>`, `<header>`).
- **Responsiveness:** Test on Mobile (375px), Tablet (768px), Desktop (1024px+).

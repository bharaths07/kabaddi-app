# UI/UX Quality Assurance Checklist

Use this checklist to verify that every screen and feature adheres to the SportSync Design System.

## 1. Visual Consistency

### Typography
- [ ] **Font Family:** Is `Inter` used for all text? (No Times New Roman or default serif).
- [ ] **Hierarchy:** Are headings (`h1`-`h3`) clearly distinct from body text?
- [ ] **Readability:** Is body text at least `text-sm` (14px)? Is contrast sufficient?
- [ ] **Alignment:** Is text aligned correctly (usually left-aligned for body, centered for specific UI states)?

### Colors
- [ ] **Primary Color:** Is `#2563EB` (Blue) used for primary actions and active states?
- [ ] **Text Colors:** 
  - Main content: `text-slate-900` (`--text-primary`)
  - Secondary/Meta: `text-slate-500` (`--text-secondary`)
- [ ] **Backgrounds:** 
  - Page: `bg-slate-50` (`--bg-page`)
  - Cards: `bg-white` (`--bg-card`)
- [ ] **No Hardcoded Hex:** Are all colors using CSS variables or Tailwind utility classes?

### Spacing & Layout
- [ ] **Grid:** Is the 4px grid system respected? (Margins/Paddings in multiples of 4).
- [ ] **Breathing Room:** Is there enough whitespace between sections (`gap-6` or `gap-8`)?
- [ ] **Alignment:** Are elements vertically centered in flex containers?
- [ ] **Cards:** Do all content groups live inside `.card` containers with consistent padding (`p-6`)?

## 2. Component Usage

### Buttons
- [ ] **Hierarchy:** Is there only one primary button per main action area?
- [ ] **States:** Do buttons have hover (`hover:bg-primary/90`) and active states?
- [ ] **Disabled:** Are disabled buttons clearly visual (`opacity-50`) and non-interactive?

### Forms
- [ ] **Inputs:** Are native `<input>` tags replaced with the `Input` component?
- [ ] **Labels:** Do all inputs have visible labels or `aria-label`?
- [ ] **Validation:** Are error messages displayed in red (`text-red-500`) below the input?
- [ ] **Focus:** do inputs have a visible focus ring (`ring-2 ring-primary`)?

### Empty States
- [ ] **Usage:** Is the `EmptyState` component used instead of plain text "No results"?
- [ ] **Action:** Does the empty state provide a way to resolve it (e.g., "Create New")?

## 3. Interaction Design

### Feedback
- [ ] **Loading:** Are `Loader` spinners shown during async operations?
- [ ] **Success/Error:** Are Toasts or inline messages used to confirm actions?
- [ ] **Hover:** Do interactive elements (rows, cards, buttons) respond to hover?

### Navigation
- [ ] **Active State:** Is the current page/tab clearly highlighted in the nav/sidebar?
- [ ] **Breadcrumbs:** Can users navigate back easily?

## 4. Accessibility (a11y)

### Basics
- [ ] **Keyboard Nav:** Can you tab through all interactive elements in logical order?
- [ ] **Focus Visible:** Is the focus indicator always visible?
- [ ] **Alt Text:** Do all images (including Avatars) have `alt` attributes?
- [ ] **Semantic HTML:** Are `<button>`, `<a>`, `<input>` used correctly? (No `div` with `onClick` unless necessary).

### ARIA
- [ ] **Modals:** Do modals trap focus and close on Escape? (`role="dialog"`).
- [ ] **Icons:** Are decorative icons hidden (`aria-hidden="true"`)?

## 5. Responsive Design

### Breakpoints
- [ ] **Mobile (375px):** 
  - Single column layout?
  - No horizontal scrolling?
  - Hamburger menu or accessible nav?
- [ ] **Tablet (768px):** 
  - Grid adapts (e.g., 2 columns)?
  - Sidebar behavior appropriate?
- [ ] **Desktop (1024px+):** 
  - Content centered with max-width?
  - Full navigation visible?

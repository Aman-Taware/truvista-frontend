# Truvista Design System

## Royal & Elegant Theme

This design system guide establishes the foundation for Truvista's royal and elegant design theme. It provides guidelines for colors, typography, spacing, and component styles to ensure consistent implementation across the application.

## Color Palette

### Primary Colors (Navy)
- Primary-50: #f0f5fa - Backgrounds, hover states
- Primary-100: #dae5f3 - Borders, dividers
- Primary-200: #b9cce4 - Inactive elements
- Primary-300: #8faad0 - Secondary text
- Primary-400: #6684b8 - Active elements
- Primary-500: #4e6ca1 - Primary buttons, links
- Primary-600: #3e5585 - Hover states for buttons
- Primary-700: #334268 - Active states, focused elements
- Primary-800: #29354f - Dark text on light backgrounds
- Primary-900: #1e2637 - Darkest accents

### Secondary Colors (Gold)
- Secondary-50: #fbf8f1 - Light backgrounds
- Secondary-100: #f7efdc - Subtle highlights
- Secondary-200: #efdbb0 - Borders, dividers
- Secondary-300: #e6c77f - Light accents
- Secondary-400: #dbb44e - Primary gold accents, buttons
- Secondary-500: #c99a33 - Hover states
- Secondary-600: #a47928 - Active states
- Secondary-700: #805b23 - Dark accents
- Secondary-800: #5d3f1f - Very dark accents
- Secondary-900: #3b271a - Darkest accents

### Neutral Colors
- Neutral-50: #f9f9f9 - Page backgrounds
- Neutral-100: #f0f0f0 - Card backgrounds, dividers
- Neutral-200: #e4e4e4 - Borders
- Neutral-300: #d1d1d1 - Disabled elements
- Neutral-400: #a3a3a3 - Placeholder text
- Neutral-500: #737373 - Secondary text
- Neutral-600: #525252 - Body text
- Neutral-700: #404040 - Low emphasis headings
- Neutral-800: #262626 - Primary text
- Neutral-900: #171717 - Headings, emphasized text

### Accent Colors
- Emerald: #0f766e - Success states, positive messaging
- Burgundy: #881337 - Error states, destructive actions
- Plum: #6b21a8 - Special highlights

### Functional Colors
- Success-500: #10513a - Success messages, confirmations
- Error-500: #9b1c1c - Error messages, validation errors
- Warning-500: #92400e - Warning messages, alerts

## Typography

### Font Families
- Headings: 'Cormorant Garamond', serif
- Body: 'Montserrat', sans-serif

### Type Scale
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)

### Font Weights
- light: 300
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

### Letter Spacing
- tighter: -0.05em
- tight: -0.025em
- normal: 0
- wide: 0.025em
- wider: 0.05em
- widest: 0.1em

## Spacing System

Our spacing system follows an 8px grid:
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)
- 20: 5rem (80px)
- 24: 6rem (96px)

## Border Radius

- none: 0
- sm: 0.125rem (2px)
- DEFAULT: 0.25rem (4px)
- md: 0.375rem (6px)
- lg: 0.5rem (8px)
- xl: 0.75rem (12px)
- 2xl: 1rem (16px)
- 3xl: 1.5rem (24px)
- full: 9999px (fully rounded)

## Shadows

- sm: Subtle shadow for small elements
- md: Medium shadow for cards and interactive elements
- lg: Large shadow for elevated content
- xl: Extra large shadow for modals and popovers
- 2xl: Maximum shadow for key highlighted elements
- elegant: Special shadow for elegant cards with softer diffusion
- card: Specific shadow for property cards
- inner: Inset shadow for pressed states
- none: No shadow

## Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Outline Button -->
<button class="btn btn-outline">Outline Button</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Ghost Button</button>
```

### Cards
```html
<!-- Standard Card -->
<div class="card">
  <!-- Card content -->
</div>

<!-- Elegant Card with more padding and refined shadow -->
<div class="card-elegant">
  <!-- Card content -->
</div>
```

### Form Elements
```html
<!-- Input with Label -->
<label class="input-label">Input Label</label>
<input type="text" class="input" placeholder="Enter text...">
<p class="input-error">Error message goes here</p>
```

### Sections
```html
<!-- Page Section -->
<section class="section">
  <div class="container-elegant">
    <h2 class="section-title">Section Title</h2>
    <p class="section-subtitle">Section description text that explains the purpose of this section.</p>
    <!-- Section content -->
  </div>
</section>
```

## Usage Guidelines

### Color Usage
- Use primary colors for main interactive elements and branding
- Use secondary (gold) colors sparingly for highlights and accents
- Maintain sufficient contrast for accessibility (WCAG AA standard minimum)

### Typography Guidelines
- Use heading font family for titles and section headers only
- Body text should always use the sans-serif font family
- Maintain a clear type hierarchy with limited variation in sizes

### Responsive Design
- Follow a mobile-first approach with progressive enhancement
- Use the responsive utility classes (sm:, md:, lg:, xl:) for breakpoint-specific styling
- Maintain touch-friendly sizing for interactive elements on mobile (minimum 44x44px)

### Animation & Effects
- Use subtle transitions (0.2s-0.3s duration)
- Prefer ease-in-out or cubic-bezier timing functions
- Keep animations understated and purposeful to maintain elegance

## Accessibility
- Maintain a minimum contrast ratio of 4.5:1 for normal text
- Ensure all interactive elements have clear focus states
- Provide alternative text for all images
- Build all components to be keyboard accessible 
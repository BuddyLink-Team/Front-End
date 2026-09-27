---
name: BuddyLink Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d9e3f9'
  on-surface: '#121c2c'
  on-surface-variant: '#414940'
  inverse-surface: '#273141'
  inverse-on-surface: '#ebf1ff'
  outline: '#717970'
  outline-variant: '#c1c9be'
  surface-tint: '#396940'
  primary: '#396940'
  on-primary: '#ffffff'
  primary-container: '#7bae7f'
  on-primary-container: '#0f411d'
  inverse-primary: '#9fd3a2'
  secondary: '#30647b'
  on-secondary: '#ffffff'
  secondary-container: '#b1e4fe'
  on-secondary-container: '#33677d'
  tertiary: '#755a1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf9e58'
  on-tertiary-container: '#4a3500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baf0bc'
  primary-fixed-dim: '#9fd3a2'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#20502a'
  secondary-fixed: '#bee9ff'
  secondary-fixed-dim: '#9bcee7'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#114d62'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#e6c278'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4303'
  background: '#f9f9ff'
  on-background: '#121c2c'
  surface-variant: '#d9e3f9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

The design system embodies a calm, warm, and restorative atmosphere tailored for busy, modern parents seeking safe and wholesome peer connections for their children. The visual tone is characterized by mindful minimalism ("Less is More"), quiet clarity, and comforting hospitality.

### Visual Style

- **Philosophy**: Minimalist sanctuary. Eliminates unnecessary visual noise, dense administrative forms, and saturated gamified elements.
- **Atmosphere**: Gentle, breathable, and grounded. Emphasizes expansive negative space, muted natural pastel accents, soft rounded boundaries, and fluid, intuitive interactions that reduce cognitive load.
- **Emotion**: Trust, safety, tranquility, and genuine community warmth.

## Colors

The color palette uses soothing tea, sky, and cream tones to prevent eye strain during frequent morning and late-evening check-ins.

### Palette Roles

- **Primary (`#7BAE7F`)**: Soft Matcha Green. Signifies growth, organic connection, and safety. Used for core interactive elements, key calls-to-action, success signals, and verified badges.
- **Secondary (`#92C5DE`)**: Soft Cloud Blue. Represents serenity, stability, and open skies. Used for informative tags, calendar dates, messaging bubbles, and calm accents.
- **Tertiary (`#F6D186`)**: Warm Butter Yellow. Evokes playful sunlight and tender warmth. Reserved for rating stars, play invitations, child activity highlights, and celebratory chips.
- **Neutral Primary (`#2D3748`)**: Deep Slate Charcoal. Soft on the eyes compared to pure black, serving as high-contrast yet non-glaring text.
- **Neutral Secondary (`#718096`)**: Muted Mineral Gray. Used for secondary metadata, subtext, captions, timestamps, and resting state icons.
- **Canvas Background (`#FAFBF9`)**: Soft Milk Cream. Creates an airy backdrop that diffuses glare.
- **Surface (`#FFFFFF`)**: Pure White. Used selectively on interactive cards and modal sheets.
- **Subtle Outline (`#EDF2F0`)**: Low-contrast boundary separating white surfaces from the canvas.

## Typography

The design system utilizes **Plus Jakarta Sans** across all roles. Its geometric foundation with rounded humanist details delivers friendly legibility and an approachable posture.

### Type Hierarchy Guidelines

- **Display & Headlines**: Generous line heights ensure titles never crowd adjacent content. Weights stay strictly at medium or semi-bold to avoid visual aggression.
- **Body**: Uses a relaxed `lineHeight` of 1.55x to 1.6x for comfortable, rapid scanning of parent notes, playmate interests, and safety guidelines.
- **Labels & Captions**: Maintained at crisp mid-weights (`500` and `600`) with subtle letter-spacing for micro-copy, tag labels, and profile stats.

## Layout & Spacing

The layout adopts an open, fluid grid structure that maximizes breathing room. Dense groupings of items are intentionally split across spacious whitespace corridors.

### Layout Mechanics

- **Mobile (<768px)**: Single column with a 4-column sub-grid, `1.25rem` outer margins, and `0.75rem` gutters. Stacked, card-based navigation with sticky action bars over semi-transparent white wash.
- **Tablet (768px - 1024px)**: 8-column layout, `1.5rem` outer margins, flexible 2-column parent matching grids.
- **Desktop (>1024px)**: 12-column layout capped at a maximum content width of `1160px`. Features wide margins to preserve the uncluttered editorial feel.

### Spacing Principles

- Never crowd cards edge-to-edge; rely on `space-md` or `space-lg` to let profile cards stand out distinctly.
- Internal component padding is generous (`space-md` to `space-lg`) to foster an effortless, thumb-friendly tap target experience.

## Elevation & Depth

Visual hierarchy is maintained through soft planar separation rather than heavy physical drops.

### Elevation Layers

- **Base Canvas (`#FAFBF9`)**: Flat, non-reflective warm backdrop.
- **Resting Surface (Level 0 - Flat Overlay)**: `#FFFFFF` card surfaces bounded by a 1px solid hairline border in `#EDF2F0`. No shadow is present at rest, preserving absolute visual stillness.
- **Floating / Hover Surface (Level 1)**: Modals, active floating action buttons, and elevated interactive cards use an ultra-diffused, soft-ambient shadow:
  - `box-shadow: 0 8px 24px -4px rgba(45, 55, 72, 0.04), 0 2px 6px -2px rgba(45, 55, 72, 0.02);`
  - Border transitions to `#E2ECE7`.
- **Modals & Overlays (Level 2)**: Bottom sheets and dialogue modals use:
  - `box-shadow: 0 16px 40px -8px rgba(45, 55, 72, 0.06);`
  - Paired with an ultra-light backdrop blur: `backdrop-filter: blur(8px); background-color: rgba(250, 251, 249, 0.7);`

## Shapes

The design system uses soft, welcoming curves to evoke child-friendly reassurance without appearing childish or undisciplined.

### Radius Scale

- **Components & Form Elements (`rounded`, 12px - 16px)**: Input fields, buttons, dropdown selects, and badge tags.
- **Cards & Profile Modules (`rounded-lg`, 16px - 20px)**: Child match cards, activity summary panels, and message containers.
- **Interactive Floating Panels (`rounded-xl`, 24px)**: Modal sheets, drawer headers, and bottom-sheet controls.
- **Pill Badges (`rounded-full`)**: Verification pills, status chips, online indicators, and compact filter buttons.

## Components

### Buttons

- **Primary**: Solid background in `#7BAE7F`, text in `#FFFFFF`, `rounded-full` or 16px border-radius, `space-sm` vertical by `space-lg` horizontal padding. Gentle scale hover effect (`scale(1.01)`).
- **Secondary**: Tinted surface `#EBF4EE` with `#558859` text, no border.
- **Tertiary / Ghost**: Transparent surface with `#2D3748` text and minimal hover state in `#F0F4F2`.

### Cards & Profile Tiles

- Constructed with `#FFFFFF` background, a fine 1px `#EDF2F0` perimeter border, and a 16px-20px radius.
- Child profile cards integrate soft pastel status badges (e.g., `#E8F4FA` for age groups, `#FEF7E6` for playful hobbies).
- Ample inner padding (`1.5rem`) keeps avatar, kid's age/interests, distance indicator, and mutual connection indicators neatly separated.

### Chips & Filter Tags

- **Default**: Background `#FFFFFF`, border 1px solid `#EDF2F0`, text `#718096`, full-pill geometry.
- **Active**: Background `#EAF3EC`, border 1px solid `#7BAE7F`, text `#3D6841`.

### Form Fields & Inputs

- Background `#FFFFFF`, border 1px solid `#EDF2F0`, 14px border radius.
- Focus state: Border transitions smoothly to `#7BAE7F` with a matching 3px glow ring in `rgba(123, 174, 127, 0.15)`.
- Placeholder text in `#A0AEC0`.

### Toggles, Radios & Checkboxes

- Custom round silhouettes with 2px borders.
- Unchecked: `#D5E0DC` border with clear canvas.
- Checked: `#7BAE7F` fill displaying clean white micro-checks.

### Iconography

- Strict adherence to thin, line-based Lucide icons (stroke width `1.5px` to `1.75px`).
- Icons render in `#718096` in passive states and transition to `#7BAE7F` or `#2D3748` when activated.

### Parent Match & Safety Badges

- **Verified Parent Pill**: Subtle `#EAF3EC` chip with a matcha shield icon and concise `Verified` label.
- **Playdate Schedule Accordion**: Seamless white surface expanding without harsh dividers, relying purely on vertical whitespace rhythm.

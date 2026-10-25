/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Surface Palette ---
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#d0daf0',
          bright: '#f9f9ff',
          'container-lowest': '#ffffff',
          'container-low': '#f0f3ff',
          container: '#e7eeff',
          'container-high': '#dee8ff',
          'container-highest': '#d9e3f9',
          variant: '#d9e3f9',
          tint: '#396940',
          muted: '#f0f4f2', // Ghost hover / pill track background (DESIGN.md)
          'dim-strong': '#aab8d0', // Scrollbar thumb hover
        },
        'on-surface': '#121c2c',
        'on-surface-variant': '#414940',
        'inverse-surface': '#273141',
        'inverse-on-surface': '#ebf1ff',

        // --- Borders & Outlines ---
        outline: {
          DEFAULT: '#717970',
          variant: '#c1c9be',
        },
        hairline: '#edf2f0',
        'hairline-strong': '#d9e2de',

        // --- Primary Brand (Matcha Green) ---
        primary: {
          DEFAULT: '#7bae7f', // Soft Matcha Green
          hover: '#66996a',
          dark: '#396940',
          deep: '#396940',
          'on-primary': '#ffffff',
          container: '#7bae7f',
          'on-container': '#0f411d',
          'on-primary-container': '#0f411d',
          inverse: '#9fd3a2',
          fixed: '#baf0bc',
          'fixed-dim': '#9fd3a2',
          'on-fixed': '#002109',
          'on-fixed-variant': '#20502a',
          // Soft surfaces from DESIGN.md (verified pill, active chip, secondary button)
          soft: '#eaf3ec',
          tint: '#ebf4ee',
          'tint-hover': '#dcefe1',
          border: '#d2e7d7',
          ink: '#3d6841',
          // Chat bubbles
          bubble: '#e3f0e5',
          'bubble-soft': '#f0f7f2',
          'bubble-border': '#cde5d3',
        },

        // --- Secondary Brand (Cloud Blue) ---
        secondary: {
          DEFAULT: '#92c5de', // Soft Cloud Blue
          dark: '#30647b',
          'on-secondary': '#ffffff',
          container: '#b1e4fe',
          'on-container': '#33677d',
          'on-secondary-container': '#33677d',
          fixed: '#bee9ff',
          'fixed-dim': '#9bcee7',
          'on-fixed': '#001f2a',
          'on-fixed-variant': '#114d62',
        },

        // --- Tertiary Brand (Butter Yellow) ---
        tertiary: {
          DEFAULT: '#f6d186', // Warm Butter Yellow
          dark: '#755a1b',
          'on-tertiary': '#ffffff',
          container: '#bf9e58',
          'on-container': '#4a3500',
          'on-tertiary-container': '#4a3500',
          fixed: '#ffdf9f',
          'fixed-dim': '#e6c278',
          'on-fixed': '#261a00',
          'on-fixed-variant': '#5b4303',
          // Pending chip (DESIGN.md)
          soft: '#fef7e6',
          border: '#fae4b2',
        },

        // --- Error States ---
        error: {
          DEFAULT: '#ba1a1a',
          'on-error': '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
          'on-error-container': '#93000a',
          'container-hover': '#ffb4ab',
        },

        // --- Neutrals & Backgrounds ---
        background: '#f9f9ff',
        'on-background': '#121c2c',
        canvas: '#fafbf9',
        'text-primary': '#2d3748',
        'text-muted': '#718096',
      },

      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },

      fontSize: {
        // --- Design System Typography Scale ---
        'display-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['30px', { lineHeight: '38px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['22px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-md': ['17px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '500' }],
        // Micro captions: counters, timestamps, tiny badges
        'label-xs': ['10px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '500' }],
      },

      borderRadius: {
        sm: '0.25rem',   // 4px
        DEFAULT: '0.5rem', // 8px
        md: '0.75rem',  // 12px
        lg: '1rem',     // 16px
        xl: '1.5rem',   // 24px
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },

      spacing: {
        gutter: '1.25rem',
        margin: '1.5rem',
        'space-xs': '0.375rem',
        'space-sm': '0.75rem',
        'space-md': '1.25rem',
        'space-lg': '2rem',
        'space-xl': '3rem',
      },

      boxShadow: {
        // Faintest lift for small controls (chips, inputs, table frame, chat bubbles), below the Level 1 shadow
        '2xs': '0 1px 1px rgba(45, 55, 72, 0.03)',
        xs: '0 1px 2px rgba(45, 55, 72, 0.05)',
        soft: '0 2px 8px rgba(0,0,0,0.02)',
        elevated: '0 8px 24px -4px rgba(45, 55, 72, 0.04), 0 2px 6px -2px rgba(45, 55, 72, 0.02)',
        modal: '0 16px 40px -8px rgba(45, 55, 72, 0.08)',
        // Swipe feedback halo; colorize with a shadow color utility (e.g. shadow-glow shadow-primary/50)
        glow: '0 0 40px 8px rgba(45, 55, 72, 0.1)',
        'card-hover': '0 8px 20px rgba(0,0,0,0.06)',
        overlay: '0 16px 40px -8px rgba(45, 55, 72, 0.1)', // Loading overlay card
        dialog: '0 16px 40px -8px rgba(45, 55, 72, 0.12)', // Modal panel
        popover: '0 10px 25px -5px rgba(45, 55, 72, 0.1), 0 8px 10px -6px rgba(45, 55, 72, 0.1)',
        hero: '0 20px 50px rgba(45, 55, 72, 0.08)', // Landing hero visual
        header: '0 1px 8px rgba(0,0,0,0.03)', // Fixed top bars
        sidebar: '1px 0 8px rgba(0,0,0,0.03)', // Fixed side bars
        hairline: '0 1px 2px rgba(0,0,0,0.04)',
        thumb: '0 1px 3px rgba(0,0,0,0.05)', // Image thumbnails
        'slider-thumb': '0 1px 4px rgb(45 55 72 / 0.25)',
      },

      // --- Layout & component dimensions ---
      maxWidth: {
        shell: '1600px', // App frame (navbar, footer, main)
        content: '1160px', // Desktop content column (DESIGN.md)
        'filter-bar': '740px',
        'otp-card': '620px',
        'otp-text': '460px',
        'otp-actions': '440px',
        'admin-login': '480px', // Admin portal sign-in card
        // Truncated names / labels
        'truncate-xs': '120px',
        'truncate-sm': '180px',
        'truncate-md': '200px',
        'truncate-lg': '220px',
        'truncate-xl': '240px',
        // Chat message bubbles
        bubble: '85%',
        'bubble-sm': '75%',
      },
      width: {
        'chat-panel': '350px', // Conversation list & playdate side panel
        'avatar-3xl': '100px',
      },
      height: {
        'avatar-3xl': '100px',
        'auth-card': '1000px',
        hero: '650px',
        'pricing-card': '520px',
        'chat-frame': 'calc(100dvh - 8rem)', // Full viewport fit: fills screen neatly without footer peeking up, footer visible on scroll
        chart: '280px', // Dashboard charts (BarChart)
        'place-modal': 'min(640px, 85vh)', // Place search modal: fixed, does not resize while loading
      },
      minHeight: {
        page: '70vh', // Centered page-level loading / empty states
        'page-sm': '60vh',
        'auth-visual': '520px',
        'ai-panel': '350px',
        placeholder: '280px',
        list: '220px',
        'calendar-cell': '90px',
        'calendar-cell-md': '110px',
        'auth-heading': '76px',
        'pricing-desc': '40px',
        'pricing-note': '22px',
      },
      minWidth: {
        'pagination-item': '36px',
        'field-sm': '140px', // Table columns, compact selects
        'field-md': '200px',
      },
      maxHeight: {
        modal: '90vh',
        'modal-mobile': '85vh',
      },
      gridTemplateColumns: {
        navbar: '1fr auto 1fr', // Equal side columns keep the center nav truly centered
        'form-section': '200px 1fr', // Label column + fields
      },
      zIndex: {
        // Local stacking inside a component (e.g. dual range thumbs)
        3: '3',
        4: '4',
        5: '5',
        overlay: '200', // Full-page modals & loading overlay
      },
      strokeWidth: {
        1.5: '1.5',
        1.75: '1.75', // Default Lucide stroke (DESIGN.md)
        2.5: '2.5',
        3: '3',
      },
      scale: {
        98: '0.98', // Pressed state
        99: '0.99',
        101: '1.01', // Primary button hover (DESIGN.md)
      },
      borderWidth: {
        3: '3px',
      },
      textUnderlineOffset: {
        tight: '0.1em',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        1200: '1200ms',
      },
      // Custom key, read with theme() in styles/utilities.css (typing dots stagger)
      animationDelay: {
        'stagger-1': '-0.32s',
        'stagger-2': '-0.16s',
        'stagger-3': '0s',
      },

      keyframes: {
        // Celebration items (badge / streak popup)
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        // Side drawer (Modal placement="right")
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-in-right': 'slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

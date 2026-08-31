/** @type {import('tailwindcss').Config} */

/*
 * FitIn design language — "editorial playful".
 * Direction borrowed from aardvarkbookclub.com: white paper base, pale-yellow
 * feature panels, one locked violet accent, chunky display serif, pill geometry.
 * Palette values are taken verbatim from that site's published CSS variables.
 *
 * ACCENT LOCK: `violet` (#3B308F) is the only accent. Every CTA, active state,
 * focus ring and progress fill uses it. The pastel `surface.*` values are fills
 * for categorical distinction only (muscle groups, meal times, macros) and must
 * never be used as a call to action.
 *
 * SHAPE LOCK: buttons/pills/chips = full radius. Panels = 24px. Inputs = 16px.
 * Inner tiles = 16px. Nothing else.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#141414',
          soft: '#4A4744',
          faint: '#8A8681',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          warm: '#FBFAF6',
          grey: '#F2F2F2',
        },
        // Locked accent ramp.
        violet: {
          50: '#F1EFFA',
          100: '#D7CDF1',
          200: '#C2B4EB',
          300: '#9982DE',
          500: '#3B308F',
          600: '#312876',
          700: '#26205C',
        },
        // Categorical surface fills. Never a CTA.
        surface: {
          yellow: '#FAED8F',
          gold: '#FFD24A',
          blue: '#DDFCFC',
          cyan: '#A4F6F8',
          pink: '#FFDBFD',
          rose: '#FEB6FA',
          orange: '#FDDAA6',
          amber: '#FBBE63',
          periwinkle: '#D7CDF1',
        },
        wine: '#670A2E',
        olive: '#857521',
      },
      fontFamily: {
        display: ['"Young Serif"', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: {
        panel: '24px',
        field: '16px',
        tile: '16px',
      },
      boxShadow: {
        // Tinted to the warm paper base, never pure black.
        lift: '0 2px 6px -2px rgba(20, 20, 20, 0.08), 0 12px 28px -12px rgba(20, 20, 20, 0.14)',
        'lift-lg': '0 4px 10px -3px rgba(20, 20, 20, 0.10), 0 24px 48px -20px rgba(20, 20, 20, 0.20)',
        focus: '0 0 0 3px rgba(59, 48, 143, 0.22)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

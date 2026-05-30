/** @type {import('tailwindcss').Config} */
export default {
  // IMPORTANT: This tells Tailwind which files to scan for class names.
  // If a file is not listed here, its Tailwind classes will be purged (removed)
  // from the final CSS build — causing the unstyled look you are seeing.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Custom font families ──────────────────────────────────────────────
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Poppins', 'system-ui', 'sans-serif'],
        handwritten: ['Dancing Script', 'cursive'],
        mono:  ['Courier New', 'Courier', 'monospace'],
      },

      // ── Custom keyframe animations ────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)'  },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)'  },
          '50%':       { transform: 'translateY(-8px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)'    },
          '14%':      { transform: 'scale(1.2)'  },
          '28%':      { transform: 'scale(1)'    },
          '42%':      { transform: 'scale(1.15)' },
          '70%':      { transform: 'scale(1)'    },
        },
        'aurora-drift-1': {
          '0%':   { transform: 'translate(0, 0) scale(1)'       },
          '33%':  { transform: 'translate(3%, 2%) scale(1.04)'   },
          '66%':  { transform: 'translate(-2%, 4%) scale(0.97)'  },
          '100%': { transform: 'translate(2%, -3%) scale(1.02)'  },
        },
        'aurora-drift-2': {
          '0%':   { transform: 'translate(0, 0) scale(1)'       },
          '50%':  { transform: 'translate(-4%, 3%) scale(1.05)' },
          '100%': { transform: 'translate(3%, -2%) scale(0.98)' },
        },
        'wax-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251,191,36,0.4)'   },
          '50%':       { boxShadow: '0 0 0 6px rgba(251,191,36,0)'   },
        },
      },

      // ── Custom animation utility classes ─────────────────────────────────
      animation: {
        shimmer:          'shimmer 1.5s infinite',
        float:            'float-gentle 4s ease-in-out infinite',
        heartbeat:        'heartbeat 1.6s ease-in-out infinite',
        'aurora-1':       'aurora-drift-1 18s ease-in-out infinite alternate',
        'aurora-2':       'aurora-drift-2 24s ease-in-out infinite alternate',
        'wax-seal':       'wax-pulse 2s ease-in-out infinite',
        'spin-slow':      'spin 20s linear infinite',
        'spin-slow-rev':  'spin 40s linear infinite reverse',
      },

      // ── Custom colors (Tailwind's amber palette extended) ─────────────────
      colors: {
        'gold': {
          50:  '#FFFDE0',
          100: '#FFF9C4',
          200: '#FFF3A1',
          300: '#FFE566',
          400: '#FFD700',
          500: '#F3C430',
          600: '#D4AF37',
          700: '#AA7C11',
          800: '#856000',
          900: '#5C3D0A',
        },
      },

      // ── Box shadow extensions ─────────────────────────────────────────────
      boxShadow: {
        'gold-sm':  '0 4px 12px rgba(218,165,32,0.12)',
        'gold-md':  '0 12px 28px rgba(218,165,32,0.18)',
        'gold-lg':  '0 20px 50px rgba(218,165,32,0.22)',
        'gold-glow':'0 0 24px rgba(251,191,36,0.45)',
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

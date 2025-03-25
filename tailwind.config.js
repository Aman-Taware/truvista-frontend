/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - blue shades
        primary: {
          50: '#eef2f7',
          100: '#d5e0ec',
          200: '#abc1d9',
          300: '#80a2c6',
          400: '#5683b3',
          500: '#27548A', // Main brand blue
          600: '#224a7b',
          700: '#1d3f6c',
          800: '#183B4E', // Darker navy blue
          900: '#142d3c',
        },
        // Secondary/accent colors - gold
        secondary: {
          50: '#fdf8ee',
          100: '#faefd6',
          200: '#f5e1ad',
          300: '#efd285',
          400: '#e8c36d',
          500: '#DDA853', // Gold accent
          600: '#c99538',
          700: '#a87a2f',
          800: '#86612a',
          900: '#634a24',
        },
        // Neutral/background
        neutral: {
          50: '#F5EEDC', // Light cream background
          100: '#eee4ca',
          200: '#e6d9b7',
          300: '#d9c8a0',
          400: '#c5b189',
          500: '#b19b72',
          600: '#9a8461',
          700: '#7d6c4f',
          800: '#5e523c',
          900: '#3e3629',
        },
        // Semantic colors
        success: {
          500: '#0d9488', // Teal
        },
        error: {
          500: '#b91c1c', // Red
        },
        warning: {
          500: '#d97706', // Amber
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'elegant': '0 4px 20px rgba(24, 59, 78, 0.08)', 
        'card': '0 10px 30px rgba(24, 59, 78, 0.05)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      // Add animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInRight: 'slideInRight 0.5s ease-out',
        slideInLeft: 'slideInLeft 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Disable default colors and define strict custom palette
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      primary: {
        50: '#f2fbfa',
        100: '#e5f6f4',
        200: '#ceece8',
        300: '#acdcdc',
        400: '#81c6c6',
        500: '#5ba9a9',
        600: '#468b8b',
        700: '#3a6f6f',
        800: '#325a5a',
        900: '#2d4b4b',
        950: '#182b2b',
      },
      secondary: {
        50: '#f5f7f9',
        100: '#e9eef3',
        200: '#d1dee8',
        300: '#aac4d6',
        400: '#7da1bc',
        500: '#5a82a1',
        600: '#466885',
        700: '#3a546d',
        800: '#324659',
        900: '#2d3b4b',
        950: '#1e2632',
      },
      neutral: {
        50: '#f9f9f9',
        100: '#f0f0f0',
        200: '#e1e1e1',
        300: '#c5c5c5',
        400: '#a3a3a3',
        500: '#8a8a8a',
        600: '#696969',
        700: '#525252',
        800: '#424242',
        900: '#383838',
        950: '#232323',
      },
      semantic: {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        modelled: '#8b5cf6',
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Source Serif 4', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

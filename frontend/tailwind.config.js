/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce5c9',
          300: '#8dd2a5',
          400: '#57b87d',
          500: '#339962',
          600: '#25804f',
          700: '#1e6641',
          800: '#1a5135',
          900: '#16422d',
        },
        eco: {
          green: '#22c55e',
          blue: '#3b82f6',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00e5ff',
        'cyber-teal': '#00ffc2',
        'cyber-navy': '#1a202c',
        'primary': '#2563eb',
        'accent': '#10b981',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 229, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}

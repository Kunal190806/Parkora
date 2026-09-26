/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'park-navy': '#0B1F33',
        'park-blue': '#1769AA',
        'park-yellow': '#FFC107',
        'park-green': '#28A745',
        'park-red': '#DC3545',
        'park-bg': '#F5F7FA',
        'park-text': '#202B36',
      }
    },
  },
  plugins: [],
}

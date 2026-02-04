/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          admin: '#4f46e5', // Indigo 600
          adminDark: '#0f172a', // Slate 900
          employee: '#059669', // Emerald 600
          employeeBg: '#ecfdf5', // Emerald 50
        }
      }
    },
  },
  plugins: [],
}

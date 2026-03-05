/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // Temporary support for old pages folder
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#FF8C42",
        "primary-dark": "#e67a35",
        secondary: "#1E3A8A",
        "background-light": "#f8f7f5",
        "background-dark": "#23170f",
        "surface-light": "#ffffff",
        "surface-dark": "#2d241e",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

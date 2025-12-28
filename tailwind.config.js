/** @type {import('tailwindcss').Config} */
export default {
  // 1. "class" strategy is required for the toggle to work manually
  darkMode: "class", 

  // 2. These paths tell Tailwind where to look for your HTML/React code
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // Added based on your folder structure
    "./*.{js,ts,jsx,tsx}",               // Checks files in root like App.tsx
  ],
  theme: {
    extend: {
      // You can add custom colors here later if you want
    },
  },
  plugins: [],
}
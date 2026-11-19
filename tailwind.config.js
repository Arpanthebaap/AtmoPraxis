/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#10b981",       // 0-50 (Emerald)
          moderate: "#f59e0b",   // 51-100 (Amber)
          sensitive: "#f97316",  // 101-150 (Orange)
          unhealthy: "#ef4444",  // 151-200 (Red)
          veryUnhealthy: "#8b5cf6", // 201-300 (Purple)
          hazardous: "#881337",  // 301-400 (Rose 900)
          severe: "#4c0519",     // 401+ (Rose 950)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

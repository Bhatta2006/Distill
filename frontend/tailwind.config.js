/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#6366F1",  // indigo — single accent color per PRD
        "accent-light": "#EEF2FF",
        "highlight-ai": "#FDE68A",
        "highlight-user": "#BBF7D0",
      },
      fontFamily: {
        reading: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

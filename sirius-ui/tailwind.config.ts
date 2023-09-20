import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // This enables dark mode support, switchable by using the 'dark' class
  theme: {
    extend: {
      colors: {
        // Light Mode
        primary: "#7C3AED",
        secondary: "#D8B4FE",
        background: "#e5e7eb",
        paper: "#F9FAFB",
        header: "#8b5cf6",
        accent: "#A855F7",
        text: "#111827",

        // Dark Mode (prefix with "dark-")
        "dark-primary": "#4338CA",
        "dark-secondary": "#6D28D9",
        "dark-header": "#282843",
        "dark-paper": "#6D28D9",
        "dark-background": "#1c1e30",
        "dark-background-to": "#2f3050",
        "dark-accent": "#5B21B6",
      },
    },
  },
  plugins: [],
} satisfies Config;

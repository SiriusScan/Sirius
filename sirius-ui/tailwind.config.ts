import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // This enables dark mode support, switchable by using the 'dark' class
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
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
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 2s ease-in-out infinite",
        "rotate-subtle": "rotate-subtle 0.3s ease-in-out",
        "icon-bounce": "icon-bounce 0.5s ease-in-out",
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 10px rgba(167, 139, 250, 0.3), 0 0 20px rgba(167, 139, 250, 0.2), inset 0 0 10px rgba(167, 139, 250, 0.1)",
          },
          "50%": {
            boxShadow:
              "0 0 20px rgba(167, 139, 250, 0.5), 0 0 30px rgba(167, 139, 250, 0.3), inset 0 0 15px rgba(167, 139, 250, 0.2)",
          },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "rotate-subtle": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(3deg) scale(1.05)" },
          "100%": { transform: "rotate(0deg) scale(1)" },
        },
        "icon-bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-4px) scale(1.1)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

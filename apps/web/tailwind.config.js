/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          50: "#f0f0ff",
          100: "#e5e5ff",
          200: "#d0d0ff",
          300: "#a8a8ff",
          400: "#8080ff",
          500: "#6060ff",
          600: "#4040ff",
          700: "#3030dd",
          800: "#2020bb",
          900: "#1a1a2e",
          950: "#0d0d17",
        },
        fortune: {
          gold: "#ffd700",
          purple: "#9d4edd",
          darkPurple: "#7209b7",
          cosmic: "#240046",
        },
      },
      animation: {
        "flicker": "flicker 3s infinite",
        "glow": "glow 2s ease-in-out infinite",
        "crystal-pulse": "crystalPulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
          "75%": { opacity: "0.9" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(157, 78, 221, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(157, 78, 221, 0.8)" },
        },
        crystalPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      backgroundImage: {
        "starry-gradient": "radial-gradient(ellipse at center, #240046 0%, #10002b 50%, #0d0d17 100%)",
      },
    },
  },
  plugins: [],
};


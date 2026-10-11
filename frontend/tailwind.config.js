/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        black: "#0B1215",
        white: "#FFFFFF",
        cream: "#FAF9F6",
        primary: {
          DEFAULT: "#DD8F16",
          dark: "#B87410",
          50: "#FFF8EC",
        },
        secondary: "#FFD166",
        light: "#FFEDC5",
        dark: {
          DEFAULT: "#263B2B",
          soft: "#3A5541",
        },
        accent: {
          DEFAULT: "#0590E5",
          dark: "#0474B8",
        },
        darkslategray: "#2F4F4F",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(38, 59, 43, 0.18)",
        card: "0 2px 12px -2px rgba(38, 59, 43, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(24px)" },
        },
      },
      animation: {
        float: "float 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

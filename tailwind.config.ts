import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#d4a017", // Gold/Vehicle metallic shade
          foreground: "#1a1a1a",
        },
        background: "white",
        foreground: "black",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;

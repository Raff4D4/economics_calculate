import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "rgb(244, 240, 234)",
          surface: "rgb(255, 255, 255)",
          black: "rgb(18, 18, 18)",
          yellow: "rgb(255, 229, 0)",
          mint: "rgb(0, 240, 168)",
          coral: "rgb(255, 92, 92)",
          lilac: "rgb(212, 179, 255)",
          sky: "rgb(125, 249, 255)",
          orange: "rgb(255, 159, 28)",
        },
      },
      borderWidth: {
        "3": "3px",
      },
      boxShadow: {
        "neo-sm": "2px 2px 0px 0px rgb(18, 18, 18)",
        "neo": "4px 4px 0px 0px rgb(18, 18, 18)",
        "neo-lg": "6px 6px 0px 0px rgb(18, 18, 18)",
        "none": "0px 0px 0px 0px rgb(18, 18, 18)",
      },
      fontFamily: {
        sans: ["var(--font-space)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

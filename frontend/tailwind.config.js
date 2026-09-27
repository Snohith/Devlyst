import svgToDataUri from "mini-svg-data-uri";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "spin-slow": "spin 3s linear infinite",
        spotlight: "spotlight 2s ease .75s 1 forwards",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%,-40%) scale(1)" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
      },
    },
  },
  plugins: [
    addVariablesForColors,
    function gridPlugin({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("${svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`)}")`,
          }),
          "bg-grid-small": (value) => ({
            backgroundImage: `url("${svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H7.5V8"/></svg>`)}")`,
          }),
          "bg-dot": (value) => ({
            backgroundImage: `url("${svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`)}")`,
          }),
        },
        { values: flattenColorPalette.default ? flattenColorPalette.default(theme("backgroundColor")) : flattenColorPalette(theme("backgroundColor")), type: "color" },
      );
    },
  ],
};

function addVariablesForColors({ addBase, theme }) {
  const flatten = flattenColorPalette.default || flattenColorPalette;
  const allColors = flatten(theme("colors"));
  const newVars = Object.fromEntries(Object.entries(allColors).map(([key, value]) => [`--${key}`, value]));
  addBase({ ":root": newVars });
}

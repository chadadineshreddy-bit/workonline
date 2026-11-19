import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Red & White Apple Liquid Glass Palette
        brand: {
          red: "#F04452",
          deep: "#D72638",
          soft: "#FF737D",
          lightGrey: "#E9EBF0",
          dark: "#202124",
          secondary: "#777777",
          offWhite: "#F8F9FB",
          white: "#FFFFFF",
        },

        // Apple Liquid Glass White & Red system
        liquid: {
          red: "#F04452",
          deepRed: "#D72638",
          softRed: "#FF737D",
          border: "rgba(233, 235, 240, 0.8)",
          glassBg: "rgba(255, 255, 255, 0.72)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        glass: "1.25rem", // 20px
        "glass-lg": "1.625rem", // 26px
        "glass-xl": "2rem", // 32px
        "floating-panel": "2.25rem", // 36px
      },
      boxShadow: {
        "floating-canvas": "0 25px 70px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(233, 235, 240, 0.85), inset 0 1px 2px 0 rgba(255, 255, 255, 1)",
        "glass-card": "0 10px 30px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(233, 235, 240, 0.75), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.9)",
        "glass-card-hover": "0 20px 45px -5px rgba(240, 68, 82, 0.12), 0 0 0 1px rgba(240, 68, 82, 0.35)",
        "red-glow": "0 0 24px -2px rgba(240, 68, 82, 0.38)",
        "red-glow-lg": "0 0 45px -4px rgba(240, 68, 82, 0.5)",
        "sphere-3d": "inset -8px -10px 18px rgba(180, 20, 35, 0.75), inset 6px 8px 12px rgba(255, 255, 255, 0.75), 0 16px 32px -4px rgba(215, 38, 56, 0.35)",
        "sphere-3d-sm": "inset -4px -6px 10px rgba(180, 20, 35, 0.7), inset 3px 4px 6px rgba(255, 255, 255, 0.8), 0 10px 20px -3px rgba(215, 38, 56, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
        "glass-xl": "32px",
      },
      animation: {
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "float-reverse": "floatReverse 7s ease-in-out infinite",
        "float-gentle": "floatGentle 5s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 4s ease-in-out infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(14px)" },
        },
        floatGentle: {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%": { transform: "translate(6px, -8px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

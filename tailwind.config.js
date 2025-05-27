/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "bg-primary": "rgb(var(--color-bg-primary))",
        "bg-secondary": "rgb(var(--color-bg-secondary))",
        "bg-tertiary": "rgb(var(--color-bg-tertiary))",
        "text-primary": "rgb(var(--color-text-primary))",
        "text-secondary": "rgb(var(--color-text-secondary))",
        "text-muted": "rgb(var(--color-text-muted))",
        "accent-primary": "rgb(var(--color-accent-primary))",
        "accent-secondary": "rgb(var(--color-accent-secondary))",
        "accent-muted": "rgb(var(--color-accent-muted))",
        "border": "rgb(var(--color-border))",
        "light-1": "#FFFFFF",
        "light-2": "#EFEFEF",
        "light-3": "#7878A3",
        "light-4": "#5C5C7B",
        "gray-1": "#697C89",
        "dark-1": "#000000",
        "dark-2": "#09090A",
        "dark-3": "#101012",
        "dark-4": "#1F1F22",
        "primary-500": "#877EFF",
      },
      fontSize: {
        "heading1-bold": ["36px", { lineHeight: "140%", fontWeight: "700" }],
        "heading1-semibold": [
          "36px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "heading2-bold": ["30px", { lineHeight: "140%", fontWeight: "700" }],
        "heading2-semibold": [
          "30px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "heading3-bold": ["24px", { lineHeight: "140%", fontWeight: "700" }],
        "heading4-bold": [
          "20px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "body-bold": ["18px", { lineHeight: "140%", fontWeight: "700" }],
        "body-semibold": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "body-medium": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "body-normal": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body1-bold": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "base-bold": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "base-regular": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "base-medium": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "base-semibold": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "base1-semibold": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "small-bold": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "small-regular": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "small-medium": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "small-semibold": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "small-normal": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "subtle-bold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "700",
          },
        ],
        "subtle-semibold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "600",
          },
        ],
        "subtle-medium": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
          },
        ],
        "subtle-normal": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
          },
        ],
        "tiny-bold": [
          "10px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "tiny-semibold": [
          "10px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "tiny-medium": [
          "10px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "tiny-normal": [
          "10px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        ping: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ping": "ping 0.3s ease-in-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce": "bounce 1s infinite",
        "float": "float 3s ease-in-out infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

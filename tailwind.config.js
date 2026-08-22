/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        wipe: "var(--color-wipe)",
      },
      fontFamily: {
        druk: ['"Druk Heavy"', "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
      },
      fontSize: {
        meta: "var(--text-meta)",
        nav: "var(--text-nav)",
        body: "var(--text-body)",
        credit: "var(--text-credit)",
        "card-title": "var(--text-card-title)",
        "director-name": "var(--text-director-name)",
        "wordmark-footer": "var(--text-wordmark-footer)",
        "wordmark-hero": "var(--text-wordmark-hero)",
      },
      spacing: {
        gutter: "var(--page-gutter)",
        section: "var(--section-gap)",
      },
      maxWidth: {
        page: "100%",
      },
    },
  },
  plugins: [],
};

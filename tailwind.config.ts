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
        approved: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
          text: '#065F46',
          border: '#10B981',
        },
        softDecline: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
          text: '#92400E',
          border: '#F59E0B',
        },
        hardDecline: {
          DEFAULT: '#DC2626',
          bg: '#FEE2E2',
          text: '#991B1B',
          border: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
export default config;

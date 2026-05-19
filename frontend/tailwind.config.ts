import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'ppw-bg': '#081120',
        'ppw-sec': '#111827',
        'ppw-card': '#131C2E',
        'ppw-accent': '#3B82F6',
        'ppw-green': '#22C55E',
        'ppw-red': '#EF4444',
        'ppw-yellow': '#EAB308',
        'ppw-gold': '#F59E0B',
      },
    },
  },
  plugins: [],
};

export default config;

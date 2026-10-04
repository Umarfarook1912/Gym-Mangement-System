function channel(name) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: channel('--c-background'),
        primary: channel('--c-primary'),
        secondary: channel('--c-secondary'),
        muted: channel('--c-muted'),
        surface: channel('--c-surface'),
        success: channel('--c-success'),
        danger: channel('--c-danger'),
        on: {
          primary: channel('--c-on-primary'),
          danger: channel('--c-on-danger'),
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        secondary: 'var(--color-secondary)',
        label: 'var(--color-label)',
        'field-border': 'var(--color-field-border)',
        'button-primary': 'var(--color-button-primary)',
      },
      fontFamily: {
        geist: ['Geist Variable', 'sans-serif'],
      },
      boxShadow: {
        button: 'var(--shadow-button)',
      },
    },
  },
  plugins: [],
};

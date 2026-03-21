/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#112240',
          900: '#0a192f',
          950: '#020c1b',
        },
        orange: {
          electric: '#FF5F1F',
          vibrant: '#FF8C00',
        },
        cream: {
          50: '#FFFBF5',
          100: '#FFF5E8',
        },
      },
      borderRadius: {
        '3xl': '24px',
      },
      boxShadow: {
        'premium-3d': '0 20px 50px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3)',
        'electric-glow': '0 0 20px rgba(255, 95, 31, 0.5)',
      },
    },
  },
  plugins: [],
};

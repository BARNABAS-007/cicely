/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#000000',      // Pitch black app background
          espresso: '#1a120b',  // Deep Espresso
          wood: '#2d1e12',      // Walnut Wood
          gold: '#FFB457',      // Golden Amber Highlight
          amber: '#FFBF00',     // Bright Gold/Amber
          cream: '#FFF5E8',     // Soft Cream Text
        },
        navy: {
          800: '#112240',
          900: '#0a192f',
          950: '#020c1b',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'premium-3d': '0 20px 50px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3)',
        'electric-glow': '0 0 20px rgba(255, 95, 31, 0.5)',
        'gold-glow': '0 0 25px rgba(255, 180, 87, 0.4)',
        'soft-reflection': 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(to bottom, rgba(18, 18, 18, 0) 0%, rgba(18, 18, 18, 0.8) 100%)',
        'wood-pattern': "linear-gradient(to right, rgba(45, 30, 18, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(45, 30, 18, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

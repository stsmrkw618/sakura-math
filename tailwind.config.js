/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#FFF5F7',
          100: '#FFE4EC',
          200: '#FBBFD0',
          300: '#F9A8C9',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        warm: {
          orange: '#FB923C',
          yellow: '#FBBF24',
        },
        success: '#34D399',
      },
      fontFamily: {
        maru: ['"Zen Maru Gothic"', 'sans-serif'],
        kiwi: ['"Kiwi Maru"', 'serif'],
      },
      keyframes: {
        bloom: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '60%': { transform: 'scale(1.3) rotate(15deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(120px) rotate(360deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        bloom: 'bloom 0.6s ease-out forwards',
        'petal-fall': 'petalFall 3s ease-in-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

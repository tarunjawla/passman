/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0b0b0b',
        primary: '#4fe3c4',
        secondary: '#7a5cff',
        muted: '#9aa1a6',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'monospace'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        scaleUp: {
          '0%': {
            transform: 'scale(1)',
          },
          '100%': {
            transform: 'scale(1.05)',
          },
        },
        slideDown: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        glow: {
          '0%': {
            textShadow: '0 0 5px #4fe3c4, 0 0 10px #4fe3c4, 0 0 15px #4fe3c4',
          },
          '100%': {
            textShadow: '0 0 10px #4fe3c4, 0 0 20px #4fe3c4, 0 0 30px #4fe3c4',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

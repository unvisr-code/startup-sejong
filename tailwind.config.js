/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2974FF',
        secondary: '#0099FE',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2974FF 0%, #0099FE 100%)',
      },
    },
  },
  plugins: [],
}
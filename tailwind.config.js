/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070A',
        panel: '#0D1117',
        mist: '#A4ADBA',
        accent: '#8B5CF6',
        ember: '#F43F5E',
        glow: '#38BDF8'
      }
    }
  },
  plugins: []
};

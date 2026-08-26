/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      borderWidth: {
        '5': '5px',
      },
      minHeight: {
        'screen-minus-footer': 'calc(100vh - 126px)',
      },
      colors: {
        customBlue: '#66afe9',
      },
      boxShadow: {
        'custom-focus': 'inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6)'
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


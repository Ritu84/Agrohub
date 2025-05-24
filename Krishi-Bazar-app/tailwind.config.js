/** @type {import('tailwindcss').Config} */
const gluestackTokens = require('gluestack-tokens');
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./node_modules/gluestack-ui/**/*.js", // Include Gluestack components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include your source files
    "./src/*.{js,ts,jsx,tsx}", // Include your source files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        pacifico: ["Pacifico", "cursive"],
        lato: ["Lato", "sans-serif"],
        bodoni: ["Bodoni Moda", "serif"],
        garamond: ["EB Garamond", "serif"],
        helvitica: ["Helvetica", "sans-serif"],
        calibri: ["Calibri", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

// tailwind.config.js

// AQUÍ ESTÁ LA SOLUCIÓN: Le decimos a ESLint que ignore la siguiente línea
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.gen.exports = {
  // ... (tus otras configuraciones)
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        // 6. AÑADE ESTA LÍNEA PARA LA FUENTE DEL TÍTULO
        display: ["var(--font-display)", ...fontFamily.sans],
      },
      fontFamily: {
        // AQUÍ ESTÁ LA MAGIA:
        // Le decimos a Tailwind que 'font-sans' AHORA ES la variable '--font-sans' (Inter)
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      // ... (tus otros 'extend')
    },
  },
  plugins: [],
};
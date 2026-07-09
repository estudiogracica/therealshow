/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base oscura tipo Sofascore/OneFootball
        base: {
          950: "#08090B", // fondo raíz
          900: "#0F1215", // fondo pantallas
          800: "#171B1F", // tarjetas
          700: "#20252A", // tarjetas elevadas / inputs
          600: "#2B3138", // bordes
          500: "#4A525B", // texto terciario
        },
        // Acento "césped" — identidad de la app
        pitch: {
          400: "#5CE68A",
          500: "#2FD673", // acento principal (CTA, activo, victorias)
          600: "#1FAE5C",
        },
        // Estados de partido / resultado
        danger: "#F0455C", // derrotas / eliminar
        warn: "#F2B84B",   // pendiente / empates
        // Carta FUT
        fut: {
          gold: "#F4C542",
          goldLight: "#FFE9A8",
          goldDark: "#8A6412",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};

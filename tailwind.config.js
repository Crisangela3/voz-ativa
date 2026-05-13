/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'terracota': '#A65D37', 
        'verde-oliva': '#7D8C69',
        'bege-fundo': '#F2E8D5',
      },
    },
  },
  plugins: [],
}
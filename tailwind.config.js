/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Customizing fonts
      fontFamily: {
        chunkfive: ["ChunkFive Ex", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      backgroundColor: {
        "capx-light-bg": "#FFFFFF",
        "capx-dark-bg": "#04222F",
      },
      textColor: {
        "capx-light-text": "#053749",
        "capx-dark-text": "#FFFFFF",
      },
      // Customizing colors
      colors: {
        "capx-light-bg": "#FFFFFF",
        "capx-light-box-bg": "#EFEFEF",
        "capx-light-link": "#0070B9",
        "capx-dark-bg": "#04222F",
        "capx-dark-box-bg": "#053749",
        "capx-dark-link": "#66C3FF",
        "capx-primary-red": "#D43420",
        "capx-primary-yellow": "#f0c626",
        "capx-primary-green": "#02AE8C",
        "capx-primary-blue": "#0070b9",
        "capx-secondary-purple": "#851d6a",
        "capx-secondary-gray": "#053749",
        "capx-secondary-red": "#B11F0B",
        "capx-secondary-green": "#05a300",
        "capx-secondary-grey": "#717171",
        "capx-secondary-dark-grey": "#4c4c4c",
        "capx-primary-orange": "#D43831",
        organizational: "#0078D4",
        communication: "#BE0078",
        learning: "#00965A",
        community: "#8E44AD",
        social: "#D35400",
        strategic: "#3498DB",
        technology: "#27AE60",
      },

      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-organizational",
    "bg-communication",
    "bg-learning",
    "bg-community",
    "bg-social",
    "bg-strategic",
    "bg-technology",
    "text-organizational",
    "text-communication",
    "text-learning",
    "text-community",
    "text-social",
    "text-strategic",
    "text-technology",
  ],
};

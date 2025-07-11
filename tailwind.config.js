/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Customizing fonts
      fontFamily: {
        chunkfive: ['ChunkFive Ex', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },

      fontSize: {
        'capx-font-size-mobile-sm': '12px',
        'capx-font-size-mobile-md': '14px',
        'capx-font-size-mobile-lg': '16px',
        'capx-font-size-mobile-xl': '18px',
        'capx-font-size-mobile-2xl': '20px',
        'capx-font-size-mobile-3xl': '24px',
        'capx-font-size-mobile-4xl': '32px',

        'capx-font-size-desktop-sm': '14px',
        'capx-font-size-desktop-md': '16px',
        'capx-font-size-desktop-lg': '18px',
        'capx-font-size-desktop-xl': '20px',
        'capx-font-size-desktop-2xl': '24px',
        'capx-font-size-desktop-3xl': '32px',
        'capx-font-size-desktop-4xl': '36px',
        'capx-font-size-desktop-5xl': '48px',
        'capx-font-size-desktop-6xl': '72px',

        // Pares de tamanhos responsivos (mobile/desktop)
        'capx-text-xs': ['12px', '14px'], // sm -> sm
        'capx-text-sm': ['14px', '16px'], // md -> md
        'capx-text-base': ['16px', '18px'], // lg -> lg
        'capx-text-lg': ['18px', '20px'], // xl -> xl
        'capx-text-xl': ['20px', '24px'], // 2xl -> 2xl
        'capx-text-2xl': ['24px', '32px'], // 3xl -> 3xl
        'capx-text-3xl': ['32px', '36px'], // 4xl -> 4xl
        'capx-text-4xl': ['32px', '48px'], // 4xl -> 5xl
        'capx-text-5xl': ['32px', '72px'], // 4xl -> 6xl
      },
      backgroundColor: {
        'capx-light-bg': '#FFFFFF',
        'capx-dark-bg': '#04222F',
      },
      textColor: {
        'capx-light-text': '#053749',
        'capx-dark-text': '#FFFFFF',
      },
      // Customizing colors
      colors: {
        'capx-light-bg': '#FFFFFF',
        'capx-light-box-bg': '#EFEFEF',
        'capx-light-link': '#0070B9',
        'capx-dark-bg': '#04222F',
        'capx-dark-box-bg': '#053749',
        'capx-dark-link': '#66C3FF',
        'capx-primary-red': '#D43420',
        'capx-primary-yellow': '#f0c626',
        'capx-primary-green': '#02AE8C',
        'capx-primary-blue': '#0070b9',
        'capx-secondary-purple': '#851d6a',
        'capx-secondary-gray': '#053749',
        'capx-secondary-red': '#B11F0B',
        'capx-secondary-green': '#05a300',
        'capx-secondary-grey': '#717171',
        'capx-secondary-dark-grey': '#4c4c4c',
        'capx-primary-orange': '#D43831',
        organizational: '#0078D4',
        communication: '#BE0078',
        learning: '#00965A',
        community: '#8E44AD',
        social: '#D35400',
        strategic: '#3498DB',
        technology: '#27AE60',
      },

      screens: {
        xs: '450px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-organizational',
    'bg-communication',
    'bg-learning',
    'bg-community',
    'bg-social',
    'bg-strategic',
    'bg-technology',
    'text-organizational',
    'text-communication',
    'text-learning',
    'text-community',
    'text-social',
    'text-strategic',
    'text-technology',
  ],
};

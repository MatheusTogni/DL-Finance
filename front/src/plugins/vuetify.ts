/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#9C27B0', // Roxo principal
          secondary: '#BA68C8', // Roxo claro
          accent: '#7B1FA2', // Roxo escuro
          background: '#1A1A1A', // Preto mais claro
          surface: '#242424', // Cinza escuro
          'surface-variant': '#2A2A2A', // Cinza escuro variante
          error: '#E53935',
          success: '#43A047',
          warning: '#FB8C00',
          info: '#1E88E5',
        },
      },
    },
  },
  defaults: {
    VCard: {
      rounded: 'xl',
      elevation: 2,
    },
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VSheet: {
      rounded: 'lg',
    },
    VTextField: {
      rounded: 'lg',
      variant: 'outlined',
    },
    VSelect: {
      rounded: 'lg',
      variant: 'outlined',
    },
  },
})

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
          primary: '#9C27B0', // Roxo
          secondary: '#7B1FA2', // Roxo escuro
          accent: '#BA68C8', // Roxo claro
          background: '#121212', // Preto
          surface: '#1E1E1E', // Cinza escuro
          error: '#CF6679',
          success: '#81C784',
          warning: '#FFB74D',
          info: '#64B5F6',
        },
      },
    },
  },
})

/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// PWA
import { registerSW } from 'virtual:pwa-register'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
// Styles
import 'unfonts.css'

import '@/styles/main.scss'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

// Registrar Service Worker
const updateSW = registerSW({
  onNeedRefresh () {
    if (confirm('Nova versão disponível! Deseja atualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady () {
    console.log('App pronto para funcionar offline')
  },
})

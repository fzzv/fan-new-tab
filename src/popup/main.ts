import { createApp } from 'vue'
import { setupApp } from '@/logic/common-setup'
import '../styles'
import App from './App.vue'

const app = createApp(App)
setupApp(app)
app.mount('#app')

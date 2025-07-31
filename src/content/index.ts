import { createApp } from 'vue'
import App from './App.vue'
import { setupApp } from '@/logic/common-setup.ts'
;(() => {
  try {
    const container = document.createElement('div')
    container.id = __NAME__
    const root = document.createElement('div')
    const styleEl = document.createElement('link')
    const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/content/style.css'))
    shadowDOM.appendChild(styleEl)
    shadowDOM.appendChild(root)
    document.body.appendChild(container)
    const app = createApp(App)
    setupApp(app)
    app.mount(root)
  } catch (error) {
    console.error('Fan New Tab Command Palette: Failed to initialize:', error)
  }
})()

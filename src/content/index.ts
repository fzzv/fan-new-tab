import { createApp } from 'vue'
import App from './App.vue'
import { setupApp } from '@/logic/common-setup.ts'

// 注入全局样式
const globalStyles = `
  /* Command palette global styles */
  .command-palette-notification {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Ensure command palette appears above all content */
  .fan-new-tab-command-palette {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    pointer-events: none !important;
    z-index: 2147483647 !important; /* Maximum z-index */
  }

  .fan-new-tab-command-palette .command-palette-overlay {
    pointer-events: auto !important;
  }
`

// Inject styles into page head
const styleElement = document.createElement('style')
styleElement.textContent = globalStyles
document.head.appendChild(styleElement)
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

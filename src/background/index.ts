import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'

// 仅在 dev 模式开启
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // contentHMR
  import('./contentHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

let previousTabId = 0

// 通信示例：发送当前标题给background
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  } catch {
    return
  }
  console.log('previous tab', tab)
  await sendMessage('tab-prev', { title: tab.title || '' }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  } catch {
    return {
      title: undefined,
    }
  }
})

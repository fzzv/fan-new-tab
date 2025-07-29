import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import browser from 'webextension-polyfill'
import { CommandActionHandler } from './commandActions'

// 仅在 dev 模式开启
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // contentHMR
  import('./contentHMR')
}

// Initialize command action handler
const commandHandler = new CommandActionHandler()

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

// 监听键盘事件
browser.commands.onCommand.addListener(async (command) => {
  console.log('Background: Received command:', command)
  if (command === 'open-command-palette') {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    console.log('Background: Current tab:', tab?.url)
    if (tab?.id) {
      // Don't inject into chrome:// or extension pages
      if (!tab.url?.startsWith('chrome://') && !tab.url?.startsWith('chrome-extension://')) {
        try {
          console.log('Background: Sending toggle message to tab:', tab.id)
          await browser.tabs.sendMessage(tab.id, { action: 'toggle-command-palette' })
        } catch (error) {
          console.error('Failed to send message to content script:', error)
        }
      } else {
        console.log('Background: Skipping chrome:// or extension page')
      }
    }
  }
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

// Handle command palette actions
browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Handle async operations properly
  ;(async () => {
    try {
      const { action, data } = message
      console.log('Background: Handling action:', action, 'with data:', data)
      let result

      switch (action) {
        case 'get-all-actions':
          console.log('Background: Getting all actions...')
          result = await commandHandler.getAllActions()
          console.log('Background: Got', result?.length || 0, 'actions')
          break

        case 'search-tabs':
          result = await commandHandler.searchTabs(data.query)
          break

        case 'search-bookmarks':
          result = await commandHandler.searchBookmarks(data.query)
          break

        case 'search-history':
          result = await commandHandler.searchHistory(data.query, data.maxResults)
          break

        case 'switch-tab': {
          if (!data.tabId) {
            throw new Error('Tab ID is required for switch-tab action')
          }
          await browser.tabs.update(data.tabId, { active: true })
          const tab = await browser.tabs.get(data.tabId)
          if (tab.windowId) {
            await browser.windows.update(tab.windowId, { focused: true })
          }
          result = { success: true }
          break
        }

        case 'close-tab': {
          const tabId = data.tabId || (await commandHandler.getCurrentTab())?.id
          if (!tabId) {
            throw new Error('No tab ID available for close-tab action')
          }
          await browser.tabs.remove(tabId)
          result = { success: true }
          break
        }

        case 'duplicate-tab': {
          const currentTab = data.tabId ? await browser.tabs.get(data.tabId) : await commandHandler.getCurrentTab()
          if (currentTab?.id) {
            await browser.tabs.duplicate(currentTab.id)
          }
          result = { success: true }
          break
        }

        case 'pin-tab': {
          const pinTabId = data.tabId || (await commandHandler.getCurrentTab())?.id
          if (pinTabId) {
            await browser.tabs.update(pinTabId, { pinned: data.pinned })
          }
          result = { success: true }
          break
        }

        case 'mute-tab': {
          const muteTabId = data.tabId || (await commandHandler.getCurrentTab())?.id
          if (muteTabId) {
            await browser.tabs.update(muteTabId, { muted: data.muted })
          }
          result = { success: true }
          break
        }

        case 'reload-tab': {
          const reloadTabId = data.tabId || (await commandHandler.getCurrentTab())?.id
          if (reloadTabId) {
            await browser.tabs.reload(reloadTabId)
          }
          result = { success: true }
          break
        }

        case 'move-tab':
          await browser.tabs.move(data.tabId, { index: data.index })
          result = { success: true }
          break

        case 'new-window':
          await browser.windows.create({ incognito: data.incognito })
          result = { success: true }
          break

        case 'close-window': {
          const windowId = data.windowId || (await browser.windows.getCurrent()).id
          if (windowId) {
            await browser.windows.remove(windowId)
          }
          result = { success: true }
          break
        }

        case 'go-back':
          try {
            const backTabId = data.tabId || (await commandHandler.getCurrentTab())?.id
            if (backTabId) {
              await browser.tabs.goBack(backTabId)
            }
            result = { success: true }
          } catch (navError) {
            console.warn('Go back failed:', navError)
            // Fallback: inject script to use history.back()
            const backTab = await commandHandler.getCurrentTab()
            if (backTab?.id) {
              await browser.tabs.sendMessage(backTab.id, { action: 'go-back' })
            }
            result = { success: true }
          }
          break

        case 'go-forward':
          try {
            const forwardTabId = data.tabId || (await commandHandler.getCurrentTab())?.id
            if (forwardTabId) {
              await browser.tabs.goForward(forwardTabId)
            }
            result = { success: true }
          } catch (navError) {
            console.warn('Go forward failed:', navError)
            // Fallback: inject script to use history.forward()
            const forwardTab = await commandHandler.getCurrentTab()
            if (forwardTab?.id) {
              await browser.tabs.sendMessage(forwardTab.id, { action: 'go-forward' })
            }
            result = { success: true }
          }
          break

        case 'go-home': {
          const homeTab = await commandHandler.getCurrentTab()
          if (homeTab?.id) {
            await browser.tabs.update(homeTab.id, { url: 'chrome://newtab/' })
          }
          result = { success: true }
          break
        }

        case 'navigate-to-url':
          if (data.newTab) {
            await browser.tabs.create({ url: data.url })
          } else {
            const navTab = await commandHandler.getCurrentTab()
            if (navTab?.id) {
              await browser.tabs.update(navTab.id, { url: data.url })
            }
          }
          result = { success: true }
          break

        case 'create-bookmark': {
          const bookmarkTab = await commandHandler.getCurrentTab()
          await browser.bookmarks.create({
            title: data.title || bookmarkTab?.title,
            url: data.url || bookmarkTab?.url,
            parentId: data.parentId,
          })
          result = { success: true }
          break
        }

        case 'remove-bookmark':
          await browser.bookmarks.remove(data.bookmarkId)
          result = { success: true }
          break

        case 'open-bookmark':
          if (data.newTab) {
            await browser.tabs.create({ url: data.url })
          } else {
            const bookmarkTab = await commandHandler.getCurrentTab()
            if (bookmarkTab?.id) {
              await browser.tabs.update(bookmarkTab.id, { url: data.url })
            }
          }
          result = { success: true }
          break

        case 'remove-history-item':
          await browser.history.deleteUrl({ url: data.url })
          result = { success: true }
          break

        case 'clear-history':
          await browser.history.deleteAll()
          result = { success: true }
          break

        case 'open-dev-tools': // This needs to be handled by content script
        {
          const devTab = await commandHandler.getCurrentTab()
          if (devTab?.id) {
            await browser.tabs.sendMessage(devTab.id, { action: 'open-dev-tools' })
          }
          result = { success: true }
          break
        }

        case 'open-extensions-page':
          await browser.tabs.create({ url: 'chrome://extensions/' })
          result = { success: true }
          break

        case 'open-settings':
          await browser.tabs.create({ url: 'chrome://settings/' })
          result = { success: true }
          break

        case 'open-downloads':
          await browser.tabs.create({ url: 'chrome://downloads/' })
          result = { success: true }
          break

        case 'open-bookmarks-manager':
          await browser.tabs.create({ url: 'chrome://bookmarks/' })
          result = { success: true }
          break

        case 'open-history-page':
          await browser.tabs.create({ url: 'chrome://history/' })
          result = { success: true }
          break

        case 'clear-browsing-data':
          try {
            await browser.browsingData.remove(
              {
                since: data.startTime || 0,
              },
              {
                cache: data.dataTypes?.includes('cache') ?? true,
                cookies: data.dataTypes?.includes('cookies') ?? true,
                history: data.dataTypes?.includes('history') ?? true,
                downloads: data.dataTypes?.includes('downloads') ?? true,
              },
            )
            result = { success: true }
          } catch (clearError) {
            console.warn('Clear browsing data failed:', clearError)
            result = { success: true, warning: 'Some data could not be cleared' }
          }
          break

        case 'clear-cache':
          try {
            await browser.browsingData.removeCache({ since: 0 })
            result = { success: true }
          } catch (clearError) {
            console.warn('Clear cache failed:', clearError)
            result = { success: true, warning: 'Cache could not be cleared' }
          }
          break

        case 'clear-cookies':
          try {
            await browser.browsingData.removeCookies({ since: 0 })
            result = { success: true }
          } catch (clearError) {
            console.warn('Clear cookies failed:', clearError)
            result = { success: true, warning: 'Cookies could not be cleared' }
          }
          break

        case 'zoom-in':
          try {
            const zoomInTab = await commandHandler.getCurrentTab()
            if (zoomInTab?.id) {
              const currentZoom = await browser.tabs.getZoom(zoomInTab.id)
              await browser.tabs.setZoom(zoomInTab.id, Math.min(currentZoom + 0.1, 5))
            }
            result = { success: true }
          } catch (zoomError) {
            console.warn('Zoom in failed:', zoomError)
            result = { success: true, warning: 'Zoom feature not available' }
          }
          break

        case 'zoom-out':
          try {
            const zoomOutTab = await commandHandler.getCurrentTab()
            if (zoomOutTab?.id) {
              const currentZoom = await browser.tabs.getZoom(zoomOutTab.id)
              await browser.tabs.setZoom(zoomOutTab.id, Math.max(currentZoom - 0.1, 0.25))
            }
            result = { success: true }
          } catch (zoomError) {
            console.warn('Zoom out failed:', zoomError)
            result = { success: true, warning: 'Zoom feature not available' }
          }
          break

        case 'zoom-reset':
          try {
            const zoomResetTab = await commandHandler.getCurrentTab()
            if (zoomResetTab?.id) {
              await browser.tabs.setZoom(zoomResetTab.id, 1)
            }
            result = { success: true }
          } catch (zoomError) {
            console.warn('Zoom reset failed:', zoomError)
            result = { success: true, warning: 'Zoom feature not available' }
          }
          break

        case 'task-manager':
          await browser.tabs.create({ url: 'chrome://task-manager/' })
          result = { success: true }
          break

        case 'view-source': {
          const sourceTab = await commandHandler.getCurrentTab()
          if (sourceTab?.url) {
            await browser.tabs.create({ url: `view-source:${sourceTab.url}` })
          }
          result = { success: true }
          break
        }

        case 'copy-url':
        case 'copy-title':
        case 'save-page':
        case 'print-page':
        case 'find-in-page':
        case 'fullscreen':
        case 'inspect-element':
        case 'console':
        case 'network-tab':
        case 'performance-tab':
        case 'application-tab':
        case 'security-tab':
        case 'toggle-javascript':
        case 'toggle-images': // These actions need to be handled by content script
        {
          const contentTab = await commandHandler.getCurrentTab()
          if (contentTab?.id) {
            await browser.tabs.sendMessage(contentTab.id, { action, data })
          }
          result = { success: true }
          break
        }

        default:
          throw new Error(`Unknown action: ${action}`)
      }

      sendResponse({ success: true, data: result })
    } catch (error) {
      console.error('Command action error:', error)
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })()

  return true // Keep message channel open for async response
})

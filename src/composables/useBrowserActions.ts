import { ref } from 'vue'
import type { CommandAction } from '@/types/command'
import browser from 'webextension-polyfill'

export function useBrowserActions() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Send message to background script
  async function sendBackgroundMessage(action: string, data?: any) {
    try {
      isLoading.value = true
      error.value = null

      console.log('Content: Sending message:', action, data)

      const response = await browser.runtime.sendMessage({
        action,
        data,
      })

      console.log('Content: Received response:', response)

      if (!response || !response?.success) {
        throw new Error(response?.error || 'Action failed')
      }

      return response.data
    } catch (err) {
      console.error('Content: Message error:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Tab Management Actions
  async function switchToTab(tabId: number) {
    return sendBackgroundMessage('switch-tab', { tabId })
  }

  async function closeTab(tabId: number) {
    return sendBackgroundMessage('close-tab', { tabId })
  }

  async function duplicateTab(tabId?: number) {
    return sendBackgroundMessage('duplicate-tab', { tabId })
  }

  async function pinTab(tabId: number, pinned: boolean) {
    return sendBackgroundMessage('pin-tab', { tabId, pinned })
  }

  async function muteTab(tabId: number, muted: boolean) {
    return sendBackgroundMessage('mute-tab', { tabId, muted })
  }

  async function reloadTab(tabId?: number) {
    return sendBackgroundMessage('reload-tab', { tabId })
  }

  async function moveTab(tabId: number, index: number) {
    return sendBackgroundMessage('move-tab', { tabId, index })
  }

  // Window Management Actions
  async function newWindow(incognito = false) {
    return sendBackgroundMessage('new-window', { incognito })
  }

  async function closeWindow(windowId?: number) {
    return sendBackgroundMessage('close-window', { windowId })
  }

  // Navigation Actions
  async function goBack(tabId?: number) {
    return sendBackgroundMessage('go-back', { tabId })
  }

  async function goForward(tabId?: number) {
    return sendBackgroundMessage('go-forward', { tabId })
  }

  async function goHome() {
    return sendBackgroundMessage('go-home')
  }

  async function navigateToUrl(url: string, newTab = false) {
    return sendBackgroundMessage('navigate-to-url', { url, newTab })
  }

  // Bookmark Management Actions
  async function createBookmark(title: string, url: string, parentId?: string) {
    return sendBackgroundMessage('create-bookmark', { title, url, parentId })
  }

  async function removeBookmark(bookmarkId: string) {
    return sendBackgroundMessage('remove-bookmark', { bookmarkId })
  }

  async function openBookmark(url: string, newTab = false) {
    return sendBackgroundMessage('open-bookmark', { url, newTab })
  }

  // History Actions
  async function removeHistoryItem(url: string) {
    return sendBackgroundMessage('remove-history-item', { url })
  }

  async function clearHistory(startTime?: number) {
    return sendBackgroundMessage('clear-history', { startTime })
  }

  // Developer Tools Actions
  async function openDevTools() {
    return sendBackgroundMessage('open-dev-tools')
  }

  async function openExtensionsPage() {
    return sendBackgroundMessage('open-extensions-page')
  }

  // Browser Settings Actions
  async function openSettings() {
    return sendBackgroundMessage('open-settings')
  }

  async function openDownloads() {
    return sendBackgroundMessage('open-downloads')
  }

  async function openBookmarksManager() {
    return sendBackgroundMessage('open-bookmarks-manager')
  }

  async function openHistoryPage() {
    return sendBackgroundMessage('open-history-page')
  }

  // Data Management Actions
  async function clearBrowsingData(dataTypes: string[], startTime?: number) {
    return sendBackgroundMessage('clear-browsing-data', { dataTypes, startTime })
  }

  // Search Actions
  async function searchTabs(query: string) {
    return sendBackgroundMessage('search-tabs', { query })
  }

  async function searchBookmarks(query: string) {
    return sendBackgroundMessage('search-bookmarks', { query })
  }

  async function searchHistory(query: string, maxResults = 50) {
    return sendBackgroundMessage('search-history', { query, maxResults })
  }

  // Get all available actions
  async function getAllActions(): Promise<CommandAction[]> {
    return sendBackgroundMessage('get-all-actions')
  }

  // Execute generic action
  async function executeAction(action: CommandAction) {
    switch (action.action) {
      case 'switch-tab':
        return switchToTab(action.tabId!)
      case 'close-tab':
        return closeTab(action.tabId!)
      case 'duplicate-tab':
        return duplicateTab(action.tabId)
      case 'pin-tab':
        return pinTab(action.tabId!, !action.pinned)
      case 'mute-tab':
        return muteTab(action.tabId!, !action.muted)
      case 'reload-tab':
        return reloadTab(action.tabId)
      case 'new-window':
        return newWindow()
      case 'new-incognito-window':
        return newWindow(true)
      case 'close-window':
        return closeWindow(action.windowId)
      case 'go-back':
        return goBack(action.tabId)
      case 'go-forward':
        return goForward(action.tabId)
      case 'go-home':
        return goHome()
      case 'navigate-to-url':
        return navigateToUrl(action.url!)
      case 'open-bookmark':
        return openBookmark(action.url!)
      case 'create-bookmark':
        return createBookmark(action.title, action.url!)
      case 'remove-bookmark':
        return removeBookmark(action.bookmarkId!)
      case 'remove-history-item':
        return removeHistoryItem(action.url!)
      case 'open-dev-tools':
        return openDevTools()
      case 'open-extensions':
        return openExtensionsPage()
      case 'open-settings':
        return openSettings()
      case 'open-downloads':
        return openDownloads()
      case 'open-bookmarks-manager':
        return openBookmarksManager()
      case 'open-history':
        return openHistoryPage()
      default:
        throw new Error(`Unknown action: ${action.action}`)
    }
  }

  return {
    isLoading,
    error,
    // Tab actions
    switchToTab,
    closeTab,
    duplicateTab,
    pinTab,
    muteTab,
    reloadTab,
    moveTab,
    // Window actions
    newWindow,
    closeWindow,
    // Navigation actions
    goBack,
    goForward,
    goHome,
    navigateToUrl,
    // Bookmark actions
    createBookmark,
    removeBookmark,
    openBookmark,
    // History actions
    removeHistoryItem,
    clearHistory,
    // Developer tools
    openDevTools,
    openExtensionsPage,
    // Browser settings
    openSettings,
    openDownloads,
    openBookmarksManager,
    openHistoryPage,
    // Data management
    clearBrowsingData,
    // Search actions
    searchTabs,
    searchBookmarks,
    searchHistory,
    // Generic actions
    getAllActions,
    executeAction,
  }
}

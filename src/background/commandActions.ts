import type { CommandAction } from '@/types/command'
import browser from 'webextension-polyfill'

export class CommandActionHandler {
  // Get current active tab
  async getCurrentTab() {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    return tab
  }

  // Get all tabs
  async getAllTabs() {
    return browser.tabs.query({})
  }

  // Generate default actions
  async generateDefaultActions(): Promise<CommandAction[]> {
    const currentTab = await this.getCurrentTab()
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const cmdKey = isMac ? '⌘' : 'Ctrl'

    const actions: CommandAction[] = [
      // Tab Management
      {
        id: 'new-tab',
        title: 'New Tab',
        description: 'Open a new tab',
        type: 'action',
        action: 'new-tab',
        emoji: true,
        emojiChar: '✨',
        keyboardShortcut: [cmdKey, 'T'],
        category: 'Tab Management',
      },
      {
        id: 'close-tab',
        title: 'Close Tab',
        description: 'Close the current tab',
        type: 'action',
        action: 'close-tab',
        emoji: true,
        emojiChar: '❌',
        keyboardShortcut: [cmdKey, 'W'],
        category: 'Tab Management',
      },
      {
        id: 'duplicate-tab',
        title: 'Duplicate Tab',
        description: 'Duplicate the current tab',
        type: 'action',
        action: 'duplicate-tab',
        emoji: true,
        emojiChar: '📋',
        keyboardShortcut: [cmdKey, 'Shift', 'D'],
        category: 'Tab Management',
      },
      {
        id: 'reload-tab',
        title: 'Reload Tab',
        description: 'Reload the current tab',
        type: 'action',
        action: 'reload-tab',
        emoji: true,
        emojiChar: '♻️',
        keyboardShortcut: [cmdKey, 'R'],
        category: 'Tab Management',
      },
      {
        id: 'pin-tab',
        title: currentTab?.pinned ? 'Unpin Tab' : 'Pin Tab',
        description: currentTab?.pinned ? 'Unpin the current tab' : 'Pin the current tab',
        type: 'action',
        action: 'pin-tab',
        emoji: true,
        emojiChar: '📌',
        keyboardShortcut: [isMac ? '⌥' : 'Alt', 'Shift', 'P'],
        category: 'Tab Management',
      },
      {
        id: 'mute-tab',
        title: currentTab?.mutedInfo?.muted ? 'Unmute Tab' : 'Mute Tab',
        description: currentTab?.mutedInfo?.muted ? 'Unmute the current tab' : 'Mute the current tab',
        type: 'action',
        action: 'mute-tab',
        emoji: true,
        emojiChar: currentTab?.mutedInfo?.muted ? '🔈' : '🔇',
        keyboardShortcut: [isMac ? '⌥' : 'Alt', 'Shift', 'M'],
        category: 'Tab Management',
      },

      // Window Management
      {
        id: 'new-window',
        title: 'New Window',
        description: 'Open a new window',
        type: 'action',
        action: 'new-window',
        emoji: true,
        emojiChar: '🪟',
        keyboardShortcut: [cmdKey, 'N'],
        category: 'Window Management',
      },
      {
        id: 'new-incognito-window',
        title: 'New Incognito Window',
        description: 'Open a new incognito window',
        type: 'action',
        action: 'new-incognito-window',
        emoji: true,
        emojiChar: '🕵️',
        keyboardShortcut: [cmdKey, 'Shift', 'N'],
        category: 'Window Management',
      },
      {
        id: 'close-window',
        title: 'Close Window',
        description: 'Close the current window',
        type: 'action',
        action: 'close-window',
        emoji: true,
        emojiChar: '🗑️',
        keyboardShortcut: [cmdKey, 'Shift', 'W'],
        category: 'Window Management',
      },

      // Navigation
      {
        id: 'go-back',
        title: 'Go Back',
        description: 'Go back to the previous page',
        type: 'action',
        action: 'go-back',
        emoji: true,
        emojiChar: '⬅️',
        keyboardShortcut: [isMac ? '⌘' : 'Alt', '←'],
        category: 'Navigation',
      },
      {
        id: 'go-forward',
        title: 'Go Forward',
        description: 'Go forward to the next page',
        type: 'action',
        action: 'go-forward',
        emoji: true,
        emojiChar: '➡️',
        keyboardShortcut: [isMac ? '⌘' : 'Alt', '→'],
        category: 'Navigation',
      },
      {
        id: 'go-home',
        title: 'Go Home',
        description: 'Go to the home page',
        type: 'action',
        action: 'go-home',
        emoji: true,
        emojiChar: '🏠',
        category: 'Navigation',
      },

      // Bookmarks
      {
        id: 'create-bookmark',
        title: 'Bookmark This Page',
        description: 'Add current page to bookmarks',
        type: 'action',
        action: 'create-bookmark',
        emoji: true,
        emojiChar: '⭐',
        keyboardShortcut: [cmdKey, 'D'],
        category: 'Bookmark Management',
      },
      {
        id: 'open-bookmarks-manager',
        title: 'Bookmark Manager',
        description: 'Open the bookmark manager',
        type: 'action',
        action: 'open-bookmarks-manager',
        emoji: true,
        emojiChar: '📚',
        keyboardShortcut: [cmdKey, 'Shift', 'B'],
        category: 'Bookmark Management',
      },

      // Developer Tools
      {
        id: 'open-dev-tools',
        title: 'Developer Tools',
        description: 'Open developer tools',
        type: 'action',
        action: 'open-dev-tools',
        emoji: true,
        emojiChar: '🔧',
        keyboardShortcut: ['F12'],
        category: 'Developer Tools',
      },

      // Browser Settings
      {
        id: 'open-settings',
        title: 'Settings',
        description: 'Open browser settings',
        type: 'action',
        action: 'open-settings',
        emoji: true,
        emojiChar: '⚙️',
        category: 'Browser Settings',
      },
      {
        id: 'open-extensions',
        title: 'Extensions',
        description: 'Manage extensions',
        type: 'action',
        action: 'open-extensions',
        emoji: true,
        emojiChar: '🧩',
        category: 'Browser Settings',
      },
      {
        id: 'open-downloads',
        title: 'Downloads',
        description: 'View downloads',
        type: 'action',
        action: 'open-downloads',
        emoji: true,
        emojiChar: '📦',
        keyboardShortcut: [cmdKey, 'Shift', 'J'],
        category: 'Browser Settings',
      },
      {
        id: 'open-history',
        title: 'History',
        description: 'View browsing history',
        type: 'action',
        action: 'open-history',
        emoji: true,
        emojiChar: '🗂️',
        keyboardShortcut: [cmdKey, 'H'],
        category: 'Browser Settings',
      },

      // Productivity
      {
        id: 'clear-browsing-data',
        title: 'Clear Browsing Data',
        description: 'Clear cookies, cache, and history',
        type: 'action',
        action: 'clear-browsing-data',
        emoji: true,
        emojiChar: '🧹',
        category: 'Productivity',
      },
      {
        id: 'fullscreen',
        title: 'Toggle Fullscreen',
        description: 'Enter or exit fullscreen mode',
        type: 'action',
        action: 'fullscreen',
        emoji: true,
        emojiChar: '🖥️',
        keyboardShortcut: ['F11'],
        category: 'Productivity',
      },
      {
        id: 'zoom-in',
        title: 'Zoom In',
        description: 'Increase page zoom level',
        type: 'action',
        action: 'zoom-in',
        emoji: true,
        emojiChar: '🔍',
        keyboardShortcut: [cmdKey, '+'],
        category: 'Productivity',
      },
      {
        id: 'zoom-out',
        title: 'Zoom Out',
        description: 'Decrease page zoom level',
        type: 'action',
        action: 'zoom-out',
        emoji: true,
        emojiChar: '🔍',
        keyboardShortcut: [cmdKey, '-'],
        category: 'Productivity',
      },
      {
        id: 'zoom-reset',
        title: 'Reset Zoom',
        description: 'Reset page zoom to 100%',
        type: 'action',
        action: 'zoom-reset',
        emoji: true,
        emojiChar: '🔍',
        keyboardShortcut: [cmdKey, '0'],
        category: 'Productivity',
      },
      {
        id: 'find-in-page',
        title: 'Find in Page',
        description: 'Search for text on the current page',
        type: 'action',
        action: 'find-in-page',
        emoji: true,
        emojiChar: '🔎',
        keyboardShortcut: [cmdKey, 'F'],
        category: 'Productivity',
      },
      {
        id: 'print-page',
        title: 'Print Page',
        description: 'Print the current page',
        type: 'action',
        action: 'print-page',
        emoji: true,
        emojiChar: '🖨️',
        keyboardShortcut: [cmdKey, 'P'],
        category: 'Productivity',
      },
      {
        id: 'view-source',
        title: 'View Page Source',
        description: 'View the HTML source of the current page',
        type: 'action',
        action: 'view-source',
        emoji: true,
        emojiChar: '📄',
        keyboardShortcut: [cmdKey, 'U'],
        category: 'Developer Tools',
      },
      {
        id: 'inspect-element',
        title: 'Inspect Element',
        description: 'Open developer tools and inspect elements',
        type: 'action',
        action: 'inspect-element',
        emoji: true,
        emojiChar: '🔍',
        keyboardShortcut: [cmdKey, 'Shift', 'I'],
        category: 'Developer Tools',
      },
      {
        id: 'console',
        title: 'JavaScript Console',
        description: 'Open the JavaScript console',
        type: 'action',
        action: 'console',
        emoji: true,
        emojiChar: '💻',
        keyboardShortcut: [cmdKey, 'Shift', 'J'],
        category: 'Developer Tools',
      },
      {
        id: 'network-tab',
        title: 'Network Tab',
        description: 'Open developer tools network tab',
        type: 'action',
        action: 'network-tab',
        emoji: true,
        emojiChar: '🌐',
        category: 'Developer Tools',
      },
      {
        id: 'performance-tab',
        title: 'Performance Tab',
        description: 'Open developer tools performance tab',
        type: 'action',
        action: 'performance-tab',
        emoji: true,
        emojiChar: '⚡',
        category: 'Developer Tools',
      },
      {
        id: 'application-tab',
        title: 'Application Tab',
        description: 'Open developer tools application tab',
        type: 'action',
        action: 'application-tab',
        emoji: true,
        emojiChar: '📱',
        category: 'Developer Tools',
      },
      {
        id: 'security-tab',
        title: 'Security Tab',
        description: 'Open developer tools security tab',
        type: 'action',
        action: 'security-tab',
        emoji: true,
        emojiChar: '🔒',
        category: 'Developer Tools',
      },
      {
        id: 'task-manager',
        title: 'Task Manager',
        description: 'Open browser task manager',
        type: 'action',
        action: 'task-manager',
        emoji: true,
        emojiChar: '📊',
        keyboardShortcut: ['Shift', 'Esc'],
        category: 'Browser Settings',
      },
      {
        id: 'clear-cache',
        title: 'Clear Cache',
        description: 'Clear browser cache only',
        type: 'action',
        action: 'clear-cache',
        emoji: true,
        emojiChar: '🗑️',
        category: 'Productivity',
      },
      {
        id: 'clear-cookies',
        title: 'Clear Cookies',
        description: 'Clear browser cookies',
        type: 'action',
        action: 'clear-cookies',
        emoji: true,
        emojiChar: '🍪',
        category: 'Productivity',
      },
      {
        id: 'toggle-javascript',
        title: 'Toggle JavaScript',
        description: 'Enable or disable JavaScript for current site',
        type: 'action',
        action: 'toggle-javascript',
        emoji: true,
        emojiChar: '⚙️',
        category: 'Developer Tools',
      },
      {
        id: 'toggle-images',
        title: 'Toggle Images',
        description: 'Enable or disable images for current site',
        type: 'action',
        action: 'toggle-images',
        emoji: true,
        emojiChar: '🖼️',
        category: 'Productivity',
      },
      {
        id: 'copy-url',
        title: 'Copy URL',
        description: 'Copy current page URL to clipboard',
        type: 'action',
        action: 'copy-url',
        emoji: true,
        emojiChar: '📋',
        category: 'Productivity',
      },
      {
        id: 'copy-title',
        title: 'Copy Title',
        description: 'Copy current page title to clipboard',
        type: 'action',
        action: 'copy-title',
        emoji: true,
        emojiChar: '📋',
        category: 'Productivity',
      },
      {
        id: 'save-page',
        title: 'Save Page',
        description: 'Save the current page',
        type: 'action',
        action: 'save-page',
        emoji: true,
        emojiChar: '💾',
        keyboardShortcut: [cmdKey, 'S'],
        category: 'Productivity',
      },
    ]

    return actions
  }

  // Get all tabs as actions
  async getTabActions(): Promise<CommandAction[]> {
    const tabs = await this.getAllTabs()
    const currentTab = await this.getCurrentTab()
    return tabs.map((tab) => ({
      id: `tab-${tab.id}`,
      title: tab.title || 'Untitled',
      description: tab.url || '',
      type: 'tab' as const,
      action: 'switch-tab',
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      tabId: tab.id,
      windowId: tab.windowId,
      index: tab.index,
      pinned: tab.pinned,
      muted: tab.mutedInfo?.muted,
      active: tab.id === currentTab?.id,
      category: 'Tab Management',
    }))
  }

  // Get bookmarks as actions
  async getBookmarkActions(): Promise<CommandAction[]> {
    const bookmarks: CommandAction[] = []

    const processBookmarks = (nodes: browser.Bookmarks.BookmarkTreeNode[]) => {
      for (const node of nodes) {
        if (node.url) {
          bookmarks.push({
            id: `bookmark-${node.id}`,
            title: node.title,
            description: node.url,
            type: 'bookmark',
            action: 'open-bookmark',
            url: node.url,
            bookmarkId: node.id,
            parentId: node.parentId,
            emoji: true,
            emojiChar: '⭐',
            category: 'Bookmark Management',
          })
        }
        if (node.children) {
          processBookmarks(node.children)
        }
      }
    }

    try {
      const bookmarkTree = await browser.bookmarks.getTree()
      processBookmarks(bookmarkTree)
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    }

    return bookmarks
  }

  // Get history as actions
  async getHistoryActions(maxResults = 100): Promise<CommandAction[]> {
    try {
      const historyItems = await browser.history.search({
        text: '',
        maxResults,
        startTime: 0,
      })

      return historyItems.map((item) => ({
        id: `history-${item.id}`,
        title: item.title || 'Untitled',
        description: item.url || '',
        type: 'history' as const,
        action: 'navigate-to-url',
        url: item.url,
        visitCount: item.visitCount,
        lastVisitTime: item.lastVisitTime,
        emoji: true,
        emojiChar: '🕘',
        category: 'History',
      }))
    } catch (error) {
      console.error('Failed to load history:', error)
      return []
    }
  }

  // Get all actions
  async getAllActions(): Promise<CommandAction[]> {
    console.log('CommandHandler: Starting getAllActions...')
    try {
      console.log('CommandHandler: Loading actions from all sources...')
      const [defaultActions, tabActions, bookmarkActions, historyActions] = await Promise.allSettled([
        this.generateDefaultActions(),
        this.getTabActions(),
        this.getBookmarkActions(),
        this.getHistoryActions(),
      ])
      console.log('CommandHandler: All promises settled')

      const results: CommandAction[] = []

      if (defaultActions.status === 'fulfilled') {
        results.push(...defaultActions.value)
      } else {
        console.error('Failed to load default actions:', defaultActions.reason)
      }

      if (tabActions.status === 'fulfilled') {
        results.push(...tabActions.value)
      } else {
        console.error('Failed to load tab actions:', tabActions.reason)
      }

      if (bookmarkActions.status === 'fulfilled') {
        results.push(...bookmarkActions.value)
      } else {
        console.error('Failed to load bookmark actions:', bookmarkActions.reason)
      }

      if (historyActions.status === 'fulfilled') {
        results.push(...historyActions.value)
      } else {
        console.error('Failed to load history actions:', historyActions.reason)
      }

      console.log('CommandHandler: Returning', results.length, 'total actions')
      return results
    } catch (error) {
      console.error('Failed to get all actions:', error)
      // Return at least default actions as fallback
      try {
        console.log('CommandHandler: Using fallback default actions')
        return await this.generateDefaultActions()
      } catch (fallbackError) {
        console.error('Failed to get fallback actions:', fallbackError)
        return []
      }
    }
  }

  // Search tabs
  async searchTabs(query: string): Promise<CommandAction[]> {
    const tabs = await this.getTabActions()
    if (!query) return tabs

    const queryLower = query?.toLowerCase()
    return tabs.filter(
      (tab) =>
        tab.title?.toLowerCase().includes(queryLower) || (tab.url && tab.url?.toLowerCase().includes(queryLower)),
    )
  }

  // Search bookmarks
  async searchBookmarks(query: string): Promise<CommandAction[]> {
    try {
      const results = await browser.bookmarks.search({ query })
      return results
        .filter((bookmark) => bookmark.url)
        .map((bookmark) => ({
          id: `bookmark-${bookmark.id}`,
          title: bookmark.title,
          description: bookmark.url!,
          type: 'bookmark' as const,
          action: 'open-bookmark',
          url: bookmark.url!,
          bookmarkId: bookmark.id,
          parentId: bookmark.parentId,
          emoji: true,
          emojiChar: '⭐',
          category: 'Bookmark Management',
        }))
    } catch (error) {
      console.error('Failed to search bookmarks:', error)
      return []
    }
  }

  // Search history
  async searchHistory(query: string, maxResults = 50): Promise<CommandAction[]> {
    try {
      const results = await browser.history.search({
        text: query,
        maxResults,
        startTime: 0,
      })

      return results.map((item) => ({
        id: `history-${item.id}`,
        title: item.title || 'Untitled',
        description: item.url || '',
        type: 'history' as const,
        action: 'navigate-to-url',
        url: item.url,
        visitCount: item.visitCount,
        lastVisitTime: item.lastVisitTime,
        emoji: true,
        emojiChar: '🕘',
        category: 'History',
      }))
    } catch (error) {
      console.error('Failed to search history:', error)
      return []
    }
  }
}

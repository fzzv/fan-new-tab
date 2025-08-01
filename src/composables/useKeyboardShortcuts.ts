import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: (event: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts() {
  const shortcuts = new Map<string, KeyboardShortcut>()

  // Generate unique key for shortcut
  function getShortcutKey(shortcut: Omit<KeyboardShortcut, 'callback' | 'description'>): string {
    const modifiers = []
    if (shortcut.ctrlKey) modifiers.push('ctrl')
    if (shortcut.metaKey) modifiers.push('meta')
    if (shortcut.shiftKey) modifiers.push('shift')
    if (shortcut.altKey) modifiers.push('alt')

    return [...modifiers, shortcut.key?.toLowerCase()].join('+')
  }

  // Check if event matches shortcut
  function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return (
      event.key?.toLowerCase() === shortcut.key?.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.metaKey === !!shortcut.metaKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.altKey === !!shortcut.altKey
    )
  }

  // Handle keydown events
  function handleKeydown(event: KeyboardEvent) {
    for (const shortcut of shortcuts.values()) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.callback(event)
        break
      }
    }
  }

  // Register a keyboard shortcut
  function registerShortcut(shortcut: KeyboardShortcut) {
    const key = getShortcutKey(shortcut)
    shortcuts.set(key, shortcut)
  }

  // Unregister a keyboard shortcut
  function unregisterShortcut(shortcut: Omit<KeyboardShortcut, 'callback' | 'description'>) {
    const key = getShortcutKey(shortcut)
    shortcuts.delete(key)
  }

  // Clear all shortcuts
  function clearShortcuts() {
    shortcuts.clear()
  }

  // Get platform-specific modifier key
  function getModifierKey(): 'ctrlKey' | 'metaKey' {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'metaKey' : 'ctrlKey'
  }

  // Format shortcut for display
  function formatShortcut(shortcut: Omit<KeyboardShortcut, 'callback' | 'description'>): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const parts = []

    if (shortcut.ctrlKey) parts.push(isMac ? '⌃' : 'Ctrl')
    if (shortcut.metaKey) parts.push(isMac ? '⌘' : 'Meta')
    if (shortcut.shiftKey) parts.push(isMac ? '⇧' : 'Shift')
    if (shortcut.altKey) parts.push(isMac ? '⌥' : 'Alt')

    // Format key name
    let keyName = shortcut.key
    if (keyName.length === 1) {
      keyName = keyName.toUpperCase()
    } else {
      // Handle special keys
      const specialKeys: Record<string, string> = {
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
        Enter: '⏎',
        Escape: 'Esc',
        Backspace: '⌫',
        Delete: '⌦',
        Tab: '⇥',
        Space: '␣',
      }
      keyName = specialKeys[keyName] || keyName
    }

    parts.push(keyName)
    return parts.join(isMac ? '' : '+')
  }

  // Setup event listeners
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown, true)
  })

  // Cleanup event listeners
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown, true)
    clearShortcuts()
  })

  return {
    registerShortcut,
    unregisterShortcut,
    clearShortcuts,
    getModifierKey,
    formatShortcut,
    shortcuts: shortcuts as ReadonlyMap<string, KeyboardShortcut>,
  }
}

// Global keyboard shortcut handler for command palette
export function useGlobalShortcuts(commandPalette: { toggle: () => void }) {
  const { registerShortcut, getModifierKey } = useKeyboardShortcuts()

  onMounted(() => {
    const modifierKey = getModifierKey()

    // Register Ctrl+Shift+K / Cmd+Shift+K to open command palette
    registerShortcut({
      key: 'k',
      [modifierKey]: true,
      shiftKey: true,
      callback: () => {
        commandPalette.toggle()
      },
      description: 'Open command palette',
    })
  })
}

// Predefined shortcuts for common actions
export const COMMON_SHORTCUTS = {
  // Tab management
  NEW_TAB: { key: 't', ctrlKey: true },
  CLOSE_TAB: { key: 'w', ctrlKey: true },
  RELOAD_TAB: { key: 'r', ctrlKey: true },
  DUPLICATE_TAB: { key: 'd', ctrlKey: true, shiftKey: true },

  // Navigation
  GO_BACK: { key: 'ArrowLeft', altKey: true },
  GO_FORWARD: { key: 'ArrowRight', altKey: true },
  GO_HOME: { key: 'Home', altKey: true },

  // Bookmarks
  BOOKMARK_PAGE: { key: 'd', ctrlKey: true },
  BOOKMARK_MANAGER: { key: 'b', ctrlKey: true, shiftKey: true },

  // Developer tools
  DEV_TOOLS: { key: 'F12' },
  DEV_TOOLS_ALT: { key: 'i', ctrlKey: true, shiftKey: true },

  // Window management
  NEW_WINDOW: { key: 'n', ctrlKey: true },
  NEW_INCOGNITO: { key: 'n', ctrlKey: true, shiftKey: true },
  CLOSE_WINDOW: { key: 'w', ctrlKey: true, shiftKey: true },

  // History and downloads
  HISTORY: { key: 'h', ctrlKey: true },
  DOWNLOADS: { key: 'j', ctrlKey: true, shiftKey: true },

  // Search
  FIND_IN_PAGE: { key: 'f', ctrlKey: true },
  FIND_NEXT: { key: 'g', ctrlKey: true },
  FIND_PREVIOUS: { key: 'g', ctrlKey: true, shiftKey: true },
} as const

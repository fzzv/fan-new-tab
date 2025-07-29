export interface CommandAction {
  id: string
  title: string
  description: string
  type: 'action' | 'tab' | 'bookmark' | 'history' | 'url'
  action: string
  emoji?: boolean
  emojiChar?: string
  icon?: string
  favIconUrl?: string
  url?: string
  keyboardShortcut?: string[]
  category?: string
  // Tab specific properties
  tabId?: number
  windowId?: number
  index?: number
  pinned?: boolean
  muted?: boolean
  // Bookmark specific properties
  bookmarkId?: string
  parentId?: string
  // History specific properties
  visitCount?: number
  lastVisitTime?: number
}

export interface CommandPaletteState {
  isOpen: boolean
  searchQuery: string
  selectedIndex: number
  actions: CommandAction[]
  filteredActions: CommandAction[]
  isLoading: boolean
  error: string | null
}

export interface CommandPrefix {
  prefix: string
  description: string
  category: string
}

export const COMMAND_PREFIXES: CommandPrefix[] = [
  { prefix: '/tabs', description: 'Search and manage open tabs', category: 'Tab Management' },
  { prefix: '/bookmarks', description: 'Search and manage bookmarks', category: 'Bookmark Management' },
  { prefix: '/history', description: 'Search browsing history', category: 'History' },
  { prefix: '/actions', description: 'Browse all available actions', category: 'Actions' },
  { prefix: '/remove', description: 'Remove bookmarks or close tabs', category: 'Removal' },
]

export type CommandCategory = 
  | 'Tab Management'
  | 'Window Management' 
  | 'Navigation'
  | 'Bookmark Management'
  | 'History'
  | 'Developer Tools'
  | 'Browser Settings'
  | 'Productivity'
  | 'Search'
  | 'Actions'
  | 'Removal'

export interface BrowserActionRequest {
  action: string
  data?: any
  tabId?: number
}

export interface BrowserActionResponse {
  success: boolean
  data?: any
  error?: string
}

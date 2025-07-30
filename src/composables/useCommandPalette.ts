import { ref, computed, watch, nextTick } from 'vue'
import type { CommandAction, CommandPaletteState } from '@/types/command'
import { useBrowserActions } from './useBrowserActions'

export function useCommandPalette() {
  const browserActions = useBrowserActions()

  const state = ref<CommandPaletteState>({
    isOpen: false,
    searchQuery: '',
    selectedIndex: 0,
    actions: [],
    filteredActions: [],
    isLoading: false,
    error: null,
  })

  // Track if the document is currently visible to prevent flashing
  const isDocumentVisible = ref(!document.hidden)

  // Computed properties
  const isOpen = computed(() => state.value.isOpen && isDocumentVisible.value)
  const searchQuery = computed(() => state.value.searchQuery)
  const selectedIndex = computed(() => state.value.selectedIndex)
  const filteredActions = computed(() => state.value.filteredActions)
  const isLoading = computed(() => state.value.isLoading || browserActions.isLoading.value)
  const error = computed(() => state.value.error || browserActions.error.value)

  // Check if query has a command prefix
  const currentPrefix = computed(() => {
    const query = state.value.searchQuery.toLowerCase()
    return ['/tabs', '/bookmarks', '/history', '/actions', '/remove'].find((prefix) => query.startsWith(prefix))
  })

  // Get search term without prefix
  const searchTerm = computed(() => {
    const prefix = currentPrefix.value
    if (prefix) {
      return state.value.searchQuery.slice(prefix.length).trim()
    }
    return state.value.searchQuery.trim()
  })

  // Fuzzy search function
  function fuzzyMatch(text: string, query: string): boolean {
    if (!query) return true

    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()

    // Exact match gets highest priority
    if (textLower.includes(queryLower)) return true

    // Fuzzy match - check if all characters in query appear in order
    let queryIndex = 0
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++
      }
    }
    return queryIndex === queryLower.length
  }

  // Filter actions based on search query and prefix
  function filterActions() {
    const prefix = currentPrefix.value
    const term = searchTerm.value
    console.log('Filtering actions with prefix:', prefix, 'term:', term, 'total actions:', state.value.actions.length)
    let filtered = [...state.value.actions]

    // Filter by prefix first
    if (prefix === '/tabs') {
      filtered = filtered.filter((action) => action.type === 'tab')
    } else if (prefix === '/bookmarks') {
      filtered = filtered.filter((action) => action.type === 'bookmark')
    } else if (prefix === '/history') {
      filtered = filtered.filter((action) => action.type === 'history')
    } else if (prefix === '/actions') {
      filtered = filtered.filter((action) => action.type === 'action')
    } else if (prefix === '/remove') {
      filtered = filtered.filter(
        (action) => action.type === 'bookmark' || action.type === 'tab' || action.type === 'history',
      )
    }

    // Then filter by search term
    if (term) {
      filtered = filtered.filter(
        (action) =>
          fuzzyMatch(action.title, term) ||
          fuzzyMatch(action.description, term) ||
          (action.url && fuzzyMatch(action.url, term)),
      )
    }

    // Sort by relevance
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const queryLower = term.toLowerCase()

      // Exact matches first
      const aExact = aTitle.includes(queryLower)
      const bExact = bTitle.includes(queryLower)

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      // Then by title length (shorter titles first for exact matches)
      if (aExact && bExact) {
        return aTitle.length - bTitle.length
      }

      // Finally alphabetical
      return aTitle.localeCompare(bTitle)
    })

    state.value.filteredActions = filtered
    state.value.selectedIndex = 0
    console.log('Filtered actions result:', filtered.length, 'actions')
  }

  // Watch for search query changes
  watch(
    () => state.value.searchQuery,
    (newQuery, oldQuery) => {
      console.log('Search query changed from:', oldQuery, 'to:', newQuery)
      filterActions()
    },
  )

  // Open command palette
  async function open() {
    if (state.value.isOpen) return

    // Don't open if document is hidden (tab is not active)
    if (document.hidden) {
      return
    }

    // Opening command palette
    state.value.isOpen = true
    state.value.searchQuery = ''
    state.value.selectedIndex = 0
    state.value.error = null

    await loadActions()

    // Focus the input after opening
    await nextTick()
    const input = document.querySelector('.command-palette-input') as HTMLInputElement
    if (input) {
      input.focus()
    }
  }

  // Close command palette
  function close() {
    if (!state.value.isOpen) return

    state.value.isOpen = false
    state.value.searchQuery = ''
    state.value.selectedIndex = 0
    state.value.error = null
  }

  // Update document visibility state
  function updateDocumentVisibility() {
    isDocumentVisible.value = !document.hidden

    // If document becomes hidden and command palette is open, close it
    if (!isDocumentVisible.value && state.value.isOpen) {
      close()
    }
  }

  // Toggle command palette
  function toggle() {
    if (state.value.isOpen) {
      close()
    } else {
      open()
    }
  }

  // Load all available actions
  async function loadActions() {
    try {
      state.value.isLoading = true
      state.value.error = null

      const actions = await browserActions.getAllActions()
      state.value.actions = actions
      filterActions()
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to load actions'
    } finally {
      state.value.isLoading = false
    }
  }

  // Set search query
  function setSearchQuery(query: string) {
    console.log('Setting search query:', query)
    state.value.searchQuery = query
  }

  // Navigate selection
  function selectNext() {
    if (state.value.filteredActions.length === 0) return
    state.value.selectedIndex = (state.value.selectedIndex + 1) % state.value.filteredActions.length
  }

  function selectPrevious() {
    if (state.value.filteredActions.length === 0) return
    state.value.selectedIndex =
      state.value.selectedIndex === 0 ? state.value.filteredActions.length - 1 : state.value.selectedIndex - 1
  }

  function selectIndex(index: number) {
    if (index >= 0 && index < state.value.filteredActions.length) {
      state.value.selectedIndex = index
    }
  }

  // Execute selected action
  async function executeSelected() {
    const selectedAction = state.value.filteredActions[state.value.selectedIndex]
    if (!selectedAction) return

    try {
      await executeAction(selectedAction)
      close()
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to execute action'
    }
  }

  // Execute specific action
  async function executeAction(action: CommandAction) {
    const prefix = currentPrefix.value

    // Handle remove prefix specially
    if (prefix === '/remove') {
      if (action.type === 'tab') {
        await browserActions.closeTab(action.tabId!)
      } else if (action.type === 'bookmark') {
        await browserActions.removeBookmark(action.bookmarkId!)
      } else if (action.type === 'history') {
        await browserActions.removeHistoryItem(action.url!)
      }
    } else {
      await browserActions.executeAction(action)
    }
  }

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (!state.value.isOpen) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'ArrowDown':
        event.preventDefault()
        selectNext()
        break
      case 'ArrowUp':
        event.preventDefault()
        selectPrevious()
        break
      case 'Enter':
        event.preventDefault()
        executeSelected()
        break
      case 'Tab': {
        event.preventDefault()
        // Auto-complete prefix if available
        const prefixes = ['/tabs', '/bookmarks', '/history', '/actions', '/remove']
        const query = state.value.searchQuery.toLowerCase()
        const matchingPrefix = prefixes.find((p) => p.startsWith(query) && p !== query)
        if (matchingPrefix) {
          setSearchQuery(matchingPrefix + ' ')
        }
        break
      }
    }
  }

  // Search specific data types
  async function searchWithPrefix(prefix: string, query: string = '') {
    setSearchQuery(prefix + (query ? ' ' + query : ''))

    try {
      state.value.isLoading = true

      if (prefix === '/tabs') {
        const results = await browserActions.searchTabs(query)
        state.value.actions = [...state.value.actions.filter((a) => a.type !== 'tab'), ...results]
      } else if (prefix === '/bookmarks') {
        const results = await browserActions.searchBookmarks(query)
        state.value.actions = [...state.value.actions.filter((a) => a.type !== 'bookmark'), ...results]
      } else if (prefix === '/history') {
        const results = await browserActions.searchHistory(query)
        state.value.actions = [...state.value.actions.filter((a) => a.type !== 'history'), ...results]
      }

      filterActions()
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Search failed'
    } finally {
      state.value.isLoading = false
    }
  }

  return {
    // State
    isOpen,
    searchQuery,
    selectedIndex,
    filteredActions,
    isLoading,
    error,
    currentPrefix,
    searchTerm,
    isDocumentVisible,
    // Actions
    open,
    close,
    toggle,
    setSearchQuery,
    selectNext,
    selectPrevious,
    selectIndex,
    executeSelected,
    executeAction,
    handleKeydown,
    searchWithPrefix,
    loadActions,
    updateDocumentVisibility,
  }
}

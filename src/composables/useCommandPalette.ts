import { computed, nextTick, ref, watch } from 'vue'
import type { CommandAction, CommandPaletteState } from '@/types/command'
import { useBrowserActions } from './useBrowserActions'

const INSTRUCTION_LIST = ['/tabs', '/bookmarks', '/history', '/actions', '/remove', '/close', '/delete']

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

  // Enhanced keyboard navigation state
  const keyState = ref<Record<string, boolean>>({})
  const isKeyboardNavigating = ref(false)
  const navigationTimeout = ref<number | null>(null)

  // Scroll management
  const scrollContainerRef = ref<HTMLElement | null>(null)

  const isOpen = computed(() => state.value.isOpen)
  const searchQuery = computed(() => state.value.searchQuery)
  const selectedIndex = computed(() => state.value.selectedIndex)
  const filteredActions = computed(() => state.value.filteredActions)
  const isLoading = computed(() => state.value.isLoading || browserActions.isLoading.value)
  const error = computed(() => state.value.error || browserActions.error.value)

  // 检查输入是否有指令前缀
  const currentPrefix = computed(() => {
    const query = state.value.searchQuery?.toLowerCase()
    return INSTRUCTION_LIST.find((prefix) => query.startsWith(prefix))
  })

  // 获取不含前缀的搜索词
  const searchTerm = computed(() => {
    const prefix = currentPrefix.value
    if (prefix) {
      return state.value.searchQuery.slice(prefix.length).trim()
    }
    return state.value.searchQuery.trim()
  })

  // 模糊搜索
  function fuzzyMatch(text: string, query: string): boolean {
    if (!query) return true

    const textLower = text?.toLowerCase()
    const queryLower = query?.toLowerCase()

    // 完全匹配的优先级最高
    if (textLower.includes(queryLower)) return true

    // 模糊匹配 - 检查查询中的所有字符是否按顺序出现
    let queryIndex = 0
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++
      }
    }
    return queryIndex === queryLower.length
  }

  // 根据搜索查询和前缀来筛选 action
  function filterActions() {
    const prefix = currentPrefix.value
    const term = searchTerm.value
    let filtered = [...state.value.actions]

    // 首先按前缀进行筛选
    if (prefix === '/tabs' || prefix === '/close') {
      filtered = filtered.filter((action) => action.type === 'tab')
    } else if (prefix === '/bookmarks' || prefix === '/remove') {
      filtered = filtered.filter((action) => action.type === 'bookmark')
    } else if (prefix === '/history' || prefix === '/delete') {
      filtered = filtered.filter((action) => action.type === 'history')
    } else if (prefix === '/actions') {
      filtered = filtered.filter((action) => action.type === 'action')
    }

    // 然后根据搜索关键词进行筛选
    if (term) {
      filtered = filtered.filter(
        (action) =>
          fuzzyMatch(action.title, term) ||
          fuzzyMatch(action.description, term) ||
          (action.url && fuzzyMatch(action.url, term)),
      )
    }

    // 按相关性排序
    filtered.sort((a, b) => {
      const aTitle = a.title?.toLowerCase()
      const bTitle = b.title?.toLowerCase()
      const queryLower = term?.toLowerCase()

      // 如果没有搜索词，按类型优先级排序：tabs > bookmarks > history > actions
      if (!term) {
        const getTypePriority = (type: string) => {
          switch (type) {
            case 'tab':
              return 1
            case 'bookmark':
              return 2
            case 'history':
              return 3
            case 'action':
              return 4
            default:
              return 5
          }
        }

        const aPriority = getTypePriority(a.type)
        const bPriority = getTypePriority(b.type)

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        // 同类型内，优先显示当前活跃的标签页
        if (a.type === 'tab' && b.type === 'tab') {
          if (a.active && !b.active) return -1
          if (!a.active && b.active) return 1
        }

        // 同类型内按字母顺序排列
        return aTitle.localeCompare(bTitle)
      }

      // 有搜索词时，按相关性排序
      // 首先呈现完全匹配的结果
      const aExact = aTitle.includes(queryLower)
      const bExact = bTitle.includes(queryLower)

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      // 然后按照标题长度排序（对于完全匹配的情况，标题越短排在越前）
      if (aExact && bExact) {
        return aTitle.length - bTitle.length
      }

      // 最后按字母顺序排列
      return aTitle.localeCompare(bTitle)
    })

    state.value.filteredActions = filtered
    state.value.selectedIndex = 0
  }

  // 监听搜索查询的变化
  watch(
    () => state.value.searchQuery,
    () => {
      filterActions()
    },
  )

  // 打开搜索面板
  async function open() {
    if (state.value.isOpen) return

    state.value.isOpen = true
    state.value.searchQuery = ''
    state.value.selectedIndex = 0
    state.value.error = null

    await loadActions()

    // 打开后聚焦输入框
    await nextTick()
    const input = document.querySelector('.command-palette-input') as HTMLInputElement
    if (input) {
      input.focus()
    }
  }

  // 关闭搜索面板
  function close() {
    if (!state.value.isOpen) return

    state.value.isOpen = false
    state.value.searchQuery = ''
    state.value.selectedIndex = 0
    state.value.error = null
  }

  function toggle() {
    if (state.value.isOpen) {
      close()
    } else {
      open()
    }
  }

  // 加载所有 action
  async function loadActions() {
    try {
      state.value.isLoading = true
      state.value.error = null

      state.value.actions = await browserActions.getAllActions()
      filterActions()
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to load actions'
    } finally {
      state.value.isLoading = false
    }
  }

  function setSearchQuery(query: string) {
    state.value.searchQuery = query
  }

  // select的选项需滚动到可视范围内
  function scrollToSelected(immediate = false) {
    if (!scrollContainerRef.value || state.value.filteredActions.length === 0) return

    const container = scrollContainerRef.value

    // 根据所选项的索引位置找到该项
    const items = container.children
    const selectedElement = items[state.value.selectedIndex] as HTMLElement
    if (!selectedElement) return

    // 滚动到可视范围内
    selectedElement.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: immediate || isKeyboardNavigating.value ? 'instant' : 'smooth',
    })
  }

  function selectNext() {
    if (state.value.filteredActions.length === 0) return

    isKeyboardNavigating.value = true
    state.value.selectedIndex = (state.value.selectedIndex + 1) % state.value.filteredActions.length

    // 进行滚动
    nextTick(() => {
      scrollToSelected()
    })

    // Reset keyboard navigation flag after a delay
    if (navigationTimeout.value) {
      clearTimeout(navigationTimeout.value)
    }
    navigationTimeout.value = window.setTimeout(() => {
      isKeyboardNavigating.value = false
    }, 500)
  }

  function selectPrevious() {
    if (state.value.filteredActions.length === 0) return

    isKeyboardNavigating.value = true
    state.value.selectedIndex =
      state.value.selectedIndex === 0 ? state.value.filteredActions.length - 1 : state.value.selectedIndex - 1

    // Auto-scroll to keep selection visible
    nextTick(() => {
      scrollToSelected()
    })

    // Reset keyboard navigation flag after a delay
    if (navigationTimeout.value) {
      clearTimeout(navigationTimeout.value)
    }
    navigationTimeout.value = window.setTimeout(() => {
      isKeyboardNavigating.value = false
    }, 500)
  }

  function selectIndex(index: number, fromMouse = false) {
    if (index >= 0 && index < state.value.filteredActions.length) {
      // Ignore mouse selection when in keyboard navigation mode
      if (fromMouse && isKeyboardNavigating.value) {
        return
      }

      state.value.selectedIndex = index

      // Auto-scroll to keep selection visible (smooth for mouse, instant for keyboard)
      nextTick(() => {
        scrollToSelected(!fromMouse)
      })
    }
  }

  // 执行所选的 action
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

  // 执行指定的action
  async function executeAction(action: CommandAction) {
    const prefix = currentPrefix.value

    if (prefix && ['/remove', '/close', '/delete'].includes(prefix)) {
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

  // Enhanced keyboard handling with continuous key press support
  let continuousNavigationTimer: number | null = null

  function handleKeydown(event: KeyboardEvent) {
    if (!state.value.isOpen) return

    const wasPressed = keyState.value[event.key]
    keyState.value[event.key] = true

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!wasPressed) {
          selectNext()
          // Start continuous navigation after initial delay
          if (continuousNavigationTimer) clearTimeout(continuousNavigationTimer)
          continuousNavigationTimer = window.setTimeout(() => {
            startContinuousNavigation('down')
          }, 300)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!wasPressed) {
          selectPrevious()
          // Start continuous navigation after initial delay
          if (continuousNavigationTimer) clearTimeout(continuousNavigationTimer)
          continuousNavigationTimer = window.setTimeout(() => {
            startContinuousNavigation('up')
          }, 300)
        }
        break
      case 'Enter':
        event.preventDefault()
        executeSelected()
        break
      case 'Tab': {
        event.preventDefault()
        // 如果有前缀，则自动补全
        const prefixes = INSTRUCTION_LIST
        const query = state.value.searchQuery?.toLowerCase()
        const matchingPrefix = prefixes.find((p) => p.startsWith(query) && p !== query)
        if (matchingPrefix) {
          setSearchQuery(matchingPrefix + ' ')
        }
        break
      }
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (!state.value.isOpen) return

    // Clear key state when key is released
    keyState.value[event.key] = false

    // Stop continuous navigation when arrow keys are released
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (continuousNavigationTimer) {
        clearTimeout(continuousNavigationTimer)
        continuousNavigationTimer = null
      }
    }
  }

  // Continuous navigation support
  function startContinuousNavigation(direction: 'up' | 'down') {
    const navigate = () => {
      if (!state.value.isOpen) return

      const key = direction === 'down' ? 'ArrowDown' : 'ArrowUp'
      if (keyState.value[key]) {
        if (direction === 'down') {
          selectNext()
        } else {
          selectPrevious()
        }

        // Continue navigation if key is still pressed
        continuousNavigationTimer = window.setTimeout(navigate, 150) // 150ms interval for smooth continuous navigation
      }
    }

    navigate()
  }

  // 根据指令进行搜索
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
    isKeyboardNavigating,
    // Refs for scroll management
    scrollContainerRef,
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
    handleKeyup,
    scrollToSelected,
    searchWithPrefix,
    loadActions,
  }
}

<template>
  <Transition name="command-palette" @after-leave="onAfterLeave">
    <div
      v-if="isOpen && isDocumentVisible"
      class="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm command-palette-overlay"
      @click="commandPalette.close"
      @keydown="commandPalette.handleKeydown"
    >
        <div
          class="mt-[10vh] w-full max-w-4xl mx-4 bg-card border border-border rounded-lg shadow-2xl overflow-hidden"
          @click.stop
        >
          <!-- Search Input Section -->
          <div class="p-4 border-b border-border">
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Icon icon="material-symbols:search" class="w-4 h-4" />
              </div>
              <input
                ref="searchInput"
                :value="searchQuery"
                @input="handleSearchInput"
                class="w-full pl-10 pr-4 py-3 bg-transparent text-foreground placeholder-muted-foreground border-0 outline-none text-sm"
                placeholder="Type a command or search..."
                autocomplete="off"
                spellcheck="false"
              />
            </div>

            <!-- Command Prefixes Help -->
            <div v-if="!searchQuery && !isLoading && (searchTerm || currentPrefix)" class="flex flex-wrap gap-2 mt-3">
              <button
                v-for="prefix in COMMAND_PREFIXES"
                :key="prefix.prefix"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-md transition-colors"
                @click="commandPalette.setSearchQuery(prefix.prefix + ' ')"
              >
                {{ prefix.prefix }}
                <span class="text-xs opacity-75">{{ prefix.description }}</span>
              </button>
            </div>
          </div>

          <!-- Main Content Container with Sidebar -->
          <div class="flex max-h-[65vh] min-h-[350px]">
            <!-- Left Sidebar (shown when no manual search or when category is selected) -->
            <CommandPaletteSidebar
              v-if="shouldShowSidebar"
              :selected-category="selectedCategory"
              :tab-count="tabCount"
              :bookmark-count="bookmarkCount"
              :history-count="historyCount"
              @select-category="handleCategorySelect"
              class="hidden sm:flex"
            />

            <!-- Right Content Area -->
            <div class="flex-1 min-w-0 flex flex-col">
              <!-- Content Area -->
              <div class="flex-1 min-h-0 overflow-hidden p-4">
                <!-- Loading State -->
                <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"
                  ></div>
                  <p class="text-sm text-muted-foreground">Loading actions...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
                  <Icon icon="material-symbols:error" class="w-8 h-8 text-destructive mb-3" />
                  <p class="text-sm text-destructive mb-4">{{ error }}</p>
                  <button
                    class="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary-hover rounded-md transition-colors"
                    @click="commandPalette.loadActions"
                  >
                    Try again
                  </button>
                </div>

                <!-- Results -->
                <div v-else-if="filteredActions.length > 0" class="overflow-y-auto max-h-full">
                  <CommandPaletteItem
                    v-for="(action, index) in filteredActions"
                    :key="action.id"
                    :action="action"
                    :is-selected="index === selectedIndex"
                    :search-query="searchTerm"
                    :is-remove-mode="currentPrefix === '/remove'"
                    :show-type-badge="!currentPrefix || currentPrefix === '/actions'"
                    @click="
                      () => {
                        commandPalette.selectIndex(index)
                        commandPalette.executeSelected()
                      }
                    "
                    @hover="commandPalette.selectIndex(index)"
                  />
                </div>

                <!-- No Results -->
                <div v-else-if="searchQuery" class="flex flex-col items-center justify-center py-12 text-center">
                  <Icon icon="material-symbols:search-off" class="w-8 h-8 text-muted-foreground mb-3" />
                  <p class="text-sm text-foreground mb-2">No results found for "{{ searchQuery }}"</p>
                  <p class="text-xs text-muted-foreground">
                    Try using command prefixes like /tabs, /bookmarks, or /history
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <div class="flex items-center">
                  <span v-if="filteredActions.length > 0" class="text-xs text-muted-foreground">
                    {{ filteredActions.length }} result{{ filteredActions.length === 1 ? '' : 's' }}
                  </span>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1">
                    <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">↑</kbd>
                    <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">↓</kbd>
                    <span class="text-xs text-muted-foreground ml-1">navigate</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">↵</kbd>
                    <span class="text-xs text-muted-foreground ml-1">select</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">esc</kbd>
                    <span class="text-xs text-muted-foreground ml-1">close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import browser from 'webextension-polyfill'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { COMMAND_PREFIXES } from '@/types/command'
import CommandPaletteItem from './CommandPaletteItem.vue'
import CommandPaletteSidebar from './CommandPaletteSidebar.vue'

const commandPalette = useCommandPalette()

// Use the composable directly to maintain reactivity
const isOpen = commandPalette.isOpen
const searchQuery = commandPalette.searchQuery
const selectedIndex = commandPalette.selectedIndex
const filteredActions = commandPalette.filteredActions
const isLoading = commandPalette.isLoading
const error = commandPalette.error
const currentPrefix = commandPalette.currentPrefix
const searchTerm = commandPalette.searchTerm
const isDocumentVisible = commandPalette.isDocumentVisible

// Sidebar state
const selectedCategory = ref('all')
const isManualSearch = ref(false) // Track if user manually typed in search

// Computed property to determine when to show sidebar
const shouldShowSidebar = computed(() => {
  // Always show sidebar when no search term
  if (!searchTerm.value && !currentPrefix.value) {
    return true
  }

  // Show sidebar when a category is selected (prefix search) and not manual search
  if (currentPrefix.value && !isManualSearch.value) {
    return true
  }

  // Hide sidebar for manual searches
  return false
})

// Handle search input changes
function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  const newValue = target.value

  // Detect if this is a manual search (not triggered by category selection)
  const isPrefix =
    newValue.startsWith('/tabs ') || newValue.startsWith('/bookmarks ') || newValue.startsWith('/history ')

  // If user is typing and it's not just a prefix, mark as manual search
  if (newValue && !isPrefix) {
    isManualSearch.value = true
    selectedCategory.value = 'all' // Reset category selection
  } else if (!newValue) {
    // If search is cleared, reset to category view
    isManualSearch.value = false
    selectedCategory.value = 'all'
  } else if (isPrefix && !isManualSearch.value) {
    // Update selected category based on prefix
    updateSelectedCategoryFromPrefix(newValue)
  }

  commandPalette.setSearchQuery(newValue)
}

// Update selected category based on search prefix
function updateSelectedCategoryFromPrefix(searchValue: string) {
  if (searchValue.startsWith('/tabs ')) {
    selectedCategory.value = 'tabs'
  } else if (searchValue.startsWith('/bookmarks ')) {
    selectedCategory.value = 'bookmarks'
  } else if (searchValue.startsWith('/history ')) {
    selectedCategory.value = 'history'
  } else {
    selectedCategory.value = 'all'
  }
}

// Handle category selection
function handleCategorySelect(categoryId: string) {
  selectedCategory.value = categoryId
  isManualSearch.value = false // Reset manual search flag

  // Set appropriate prefix based on category
  switch (categoryId) {
    case 'tabs':
      commandPalette.setSearchQuery('/tabs ')
      break
    case 'bookmarks':
      commandPalette.setSearchQuery('/bookmarks ')
      break
    case 'history':
      commandPalette.setSearchQuery('/history ')
      break
    case 'all':
    default:
      commandPalette.setSearchQuery('')
      break
  }
}

// Computed counts for sidebar
const tabCount = computed(() => {
  return filteredActions.value.filter((action) => action.type === 'tab').length
})

const bookmarkCount = computed(() => {
  return filteredActions.value.filter((action) => action.type === 'bookmark').length
})

const historyCount = computed(() => {
  return filteredActions.value.filter((action) => action.type === 'history').length
})

const searchInput = ref<HTMLInputElement>()

// Focus input when opened and reset state
watch(isOpen, async (newValue) => {
  if (newValue) {
    // Reset state when opening command palette
    isManualSearch.value = false
    selectedCategory.value = 'all'

    await nextTick()
    searchInput.value?.focus()
  }
})

// Handle cleanup after transition
function onAfterLeave() {
  // Reset any state if needed
}

// Listen for messages from background script
function handleMessage(message: any) {
  console.log('Command Palette: Received message:', message)
  if (message.action === 'toggle-command-palette') {
    console.log('Command Palette: Toggling command palette')
    commandPalette.toggle()
  }
}

// Handle document visibility changes to prevent flashing on tab switch
function handleVisibilityChange() {
  commandPalette.updateDocumentVisibility()
}

// Handle window blur events as additional safety measure
function handleWindowBlur() {
  if (isOpen.value) {
    console.log('Command Palette: Window lost focus, closing command palette')
    commandPalette.close()
  }
}

onMounted(() => {
  // Listen for messages from background script
  browser.runtime.onMessage.addListener(handleMessage)

  // Listen for document visibility changes to handle tab switching
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Listen for window blur events as additional safety measure
  window.addEventListener('blur', handleWindowBlur)

  // Load initial actions
  commandPalette.loadActions()
})

onUnmounted(() => {
  browser.runtime.onMessage.removeListener(handleMessage)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
})
</script>

<style scoped>
/* Transition styles for command palette */
.command-palette-enter-active,
.command-palette-leave-active {
  transition: all 0.2s ease;
}

.command-palette-enter-from,
.command-palette-leave-to {
  opacity: 0;
}

.command-palette-enter-from .command-palette-container,
.command-palette-leave-to .command-palette-container {
  transform: scale(0.95) translateY(-10px);
}

.command-palette-enter-to .command-palette-container,
.command-palette-leave-from .command-palette-container {
  transform: scale(1) translateY(0);
}
</style>

<template>
  <Teleport to="body">
    <Transition name="command-palette" @after-leave="onAfterLeave">
      <div
        v-if="isOpen"
        class="command-palette-overlay"
        @click="commandPalette.close"
        @keydown="commandPalette.handleKeydown"
      >
        <div
          class="command-palette-container"
          @click.stop
        >
          <!-- Search Input -->
          <div class="command-palette-header">
            <div class="search-container">
              <div class="search-icon">
                <Icon
                  icon="material-symbols:search"
                  class="search-icon-svg"
                />
              </div>
              <input
                ref="searchInput"
                :value="searchQuery"
                @input="handleSearchInput"
                class="command-palette-input"
                placeholder="Type a command or search..."
                autocomplete="off"
                spellcheck="false"
              />
            </div>

            <!-- Command Prefixes Help -->
            <div v-if="!searchQuery && !isLoading" class="command-prefixes">
              <button
                v-for="prefix in COMMAND_PREFIXES"
                :key="prefix.prefix"
                class="prefix-button"
                @click="commandPalette.setSearchQuery(prefix.prefix + ' ')"
              >
                {{ prefix.prefix }}
                <span class="prefix-description">{{ prefix.description }}</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading actions...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <Icon icon="material-symbols:error" class="error-icon" />
            <p class="error-text">{{ error }}</p>
            <button
              class="retry-button"
              @click="commandPalette.loadActions"
            >
              Try again
            </button>
          </div>

          <!-- Results -->
          <div v-else-if="filteredActions.length > 0" class="command-palette-results">
            <CommandPaletteItem
              v-for="(action, index) in filteredActions"
              :key="action.id"
              :action="action"
              :is-selected="index === selectedIndex"
              :search-query="searchTerm"
              :is-remove-mode="currentPrefix === '/remove'"
              :show-type-badge="!currentPrefix || currentPrefix === '/actions'"
              @click="commandPalette.selectIndex(index); commandPalette.executeSelected()"
              @hover="commandPalette.selectIndex(index)"
            />
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery" class="no-results">
            <Icon icon="material-symbols:search-off" class="no-results-icon" />
            <p class="no-results-text">
              No results found for "{{ searchQuery }}"
            </p>
            <p class="no-results-hint">
              Try using command prefixes like /tabs, /bookmarks, or /history
            </p>
          </div>

          <!-- Footer -->
          <div class="command-palette-footer">
            <div class="footer-left">
              <span v-if="filteredActions.length > 0" class="result-count">
                {{ filteredActions.length }} result{{ filteredActions.length === 1 ? '' : 's' }}
              </span>
            </div>
            <div class="footer-right">
              <div class="shortcut-group">
                <kbd class="shortcut-key">↑</kbd>
                <kbd class="shortcut-key">↓</kbd>
                <span class="shortcut-label">navigate</span>
              </div>
              <div class="shortcut-group">
                <kbd class="shortcut-key">↵</kbd>
                <span class="shortcut-label">select</span>
              </div>
              <div class="shortcut-group">
                <kbd class="shortcut-key">esc</kbd>
                <span class="shortcut-label">close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'
import browser from 'webextension-polyfill'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { COMMAND_PREFIXES } from '@/types/command'
import CommandPaletteItem from './CommandPaletteItem.vue'

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

// Handle search input changes
function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  commandPalette.setSearchQuery(target.value)
}

const searchInput = ref<HTMLInputElement>()

// Focus input when opened
watch(isOpen, async (newValue) => {
  if (newValue) {
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

onMounted(() => {
  // Listen for messages from background script
  browser.runtime.onMessage.addListener(handleMessage)

  // Load initial actions
  commandPalette.loadActions()
})

onUnmounted(() => {
  browser.runtime.onMessage.removeListener(handleMessage)
})
</script>

<style scoped>
/* Overlay */
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* Container */
.command-palette-container {
  margin-top: 10vh;
  width: 100%;
  max-width: 672px; /* 2xl */
  margin-left: 16px;
  margin-right: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* Header */
.command-palette-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  padding-left: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-icon-svg {
  height: 20px;
  width: 20px;
  color: #9ca3af;
}

.command-palette-input {
  display: block;
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 0;
  background-color: transparent;
  color: #111827;
  font-size: 18px;
  line-height: 1.5;
}

.command-palette-input::placeholder {
  color: #6b7280;
}

.command-palette-input:focus {
  outline: none;
  box-shadow: none;
}

/* Command Prefixes */
.command-prefixes {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prefix-button {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.prefix-button:hover {
  background-color: #e5e7eb;
}

.prefix-description {
  margin-left: 4px;
  color: #6b7280;
}

/* Loading State */
.loading-state {
  padding: 32px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-bottom-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

/* Error State */
.error-state {
  padding: 32px;
  text-align: center;
}

.error-icon {
  height: 32px;
  width: 32px;
  color: #ef4444;
  margin: 0 auto;
}

.error-text {
  margin-top: 8px;
  font-size: 14px;
  color: #dc2626;
}

.retry-button {
  margin-top: 8px;
  font-size: 14px;
  color: #2563eb;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.retry-button:hover {
  text-decoration: none;
}

/* Results */
.command-palette-results {
  max-height: 384px; /* 96 * 4px */
  overflow-y: auto;
}

/* No Results */
.no-results {
  padding: 32px;
  text-align: center;
}

.no-results-icon {
  height: 32px;
  width: 32px;
  color: #9ca3af;
  margin: 0 auto;
}

.no-results-text {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

.no-results-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
}

/* Footer */
.command-palette-footer {
  padding: 12px 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.shortcut-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shortcut-key {
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.shortcut-label {
  color: #6b7280;
}

/* Transitions */
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

/* Custom scrollbar */
.command-palette-results::-webkit-scrollbar {
  width: 6px;
}

.command-palette-results::-webkit-scrollbar-track {
  background: transparent;
}

.command-palette-results::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.command-palette-results::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .command-palette-container {
    background-color: #1f2937;
    border-color: #374151;
  }

  .command-palette-header {
    border-bottom-color: #374151;
  }

  .command-palette-input {
    color: #f9fafb;
  }

  .prefix-button {
    background-color: #374151;
    color: #d1d5db;
  }

  .prefix-button:hover {
    background-color: #4b5563;
  }

  .prefix-description {
    color: #9ca3af;
  }

  .loading-text {
    color: #9ca3af;
  }

  .error-text {
    color: #fca5a5;
  }

  .retry-button {
    color: #60a5fa;
  }

  .no-results-text {
    color: #9ca3af;
  }

  .no-results-hint {
    color: #6b7280;
  }

  .command-palette-footer {
    background-color: #111827;
    border-top-color: #374151;
    color: #9ca3af;
  }

  .shortcut-key {
    color: #e5e7eb;
    background-color: #374151;
    border-color: #4b5563;
  }

  .shortcut-label {
    color: #9ca3af;
  }

  .command-palette-results::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }

  .command-palette-results::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.7);
  }
}
</style>

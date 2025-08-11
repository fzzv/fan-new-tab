<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import browser from 'webextension-polyfill'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { COMMAND_PREFIXES } from '@/types/command'
import CommandPaletteItem from './CommandPaletteItem.vue'
import CommandPaletteSidebar from './CommandPaletteSidebar.vue'

const {
  isOpen,
  searchQuery,
  selectedIndex,
  filteredActions,
  isLoading,
  error,
  currentPrefix,
  searchTerm,
  scrollContainerRef,
  setSearchQuery,
  toggle,
  close,
  loadActions,
  handleKeydown,
  handleKeyup,
  scrollToSelected,
  selectIndex,
  executeSelected,
  handleAutoComplete,
  handleSmartBackspace,
  isAutoCompleting,
} = useCommandPalette()

const selectedCategory = ref('all')
// 是否用户手动输入进行搜索
const isManualSearch = ref(false)

// Watch for selected index changes to update scroll
watch(selectedIndex, () => {
  nextTick(() => {
    scrollToSelected()
  })
})

// 检查上一次输入的事件是否为删除键操作，以防止自动补全功能的启动
const lastInputWasBackspace = ref(false)

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  let newValue = target.value

  // 如果尚未开启自动补全功能且上一次输入的不是删除键操作，则启用自动补全功能
  if (!isAutoCompleting.value && !lastInputWasBackspace.value) {
    const autoCompletedValue = handleAutoComplete(newValue)
    if (autoCompletedValue !== newValue) {
      newValue = autoCompletedValue
      // 将输入框中的内容更新为自动补全后的值
      target.value = newValue
      // 命令末尾增加空格
      const spaceIndex = newValue.indexOf(' ')
      if (spaceIndex !== -1) {
        target.setSelectionRange(spaceIndex + 1, spaceIndex + 1)
      }
    }
  }

  // 在处理完成后重置删除键标志
  lastInputWasBackspace.value = false

  // 检测这是否是手动搜索（不是由类别选择触发的）
  const isPrefix =
    newValue.startsWith('/tabs ') || newValue.startsWith('/bookmarks ') || newValue.startsWith('/history ')

  // 如果用户正在输入并且它不仅仅是一个前缀，则标记为手动搜索
  if (newValue && !isPrefix) {
    isManualSearch.value = true
    // 重置侧边栏分类为全部
    selectedCategory.value = 'all'
  } else if (!newValue) {
    // 如果搜索被清除，则重置为类别视图
    isManualSearch.value = false
    selectedCategory.value = 'all'
  } else if (isPrefix && !isManualSearch.value) {
    // 根据前缀更新所选类别
    updateSelectedCategoryFromPrefix(newValue)
  }

  setSearchQuery(newValue, isAutoCompleting.value)
}

// 如果删除的是命令的最后一个字母，则删除整个命令
function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    lastInputWasBackspace.value = true
    const target = event.target as HTMLInputElement
    const currentValue = target.value
    const cursorPosition = target.selectionStart || 0

    if (cursorPosition === currentValue.length) {
      const smartValue = handleSmartBackspace(currentValue)
      if (smartValue !== currentValue.slice(0, -1)) {
        event.preventDefault()
        target.value = smartValue
        setSearchQuery(smartValue)

        if (!smartValue) {
          isManualSearch.value = false
          selectedCategory.value = 'all'
        }
        return
      }
    }
  }

  // Let the global keydown handler process other keys
  handleKeydown(event)
}

// 根据搜索前缀更新所选类别
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

function handleCategorySelect(categoryId: string) {
  selectedCategory.value = categoryId
  isManualSearch.value = false

  // 根据类别设置搜索的前缀
  switch (categoryId) {
    case 'tabs':
      setSearchQuery('/tabs ')
      break
    case 'bookmarks':
      setSearchQuery('/bookmarks ')
      break
    case 'history':
      setSearchQuery('/history ')
      break
    case 'all':
    default:
      setSearchQuery('')
      break
  }
}

// 侧边栏分类角标的数量
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

// 打开面板时，初始化内容，并且聚焦
watch(isOpen, async (newValue) => {
  if (newValue) {
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

function handleMessage(message: any) {
  if (message.action === 'toggle-command-palette') {
    console.log('Command Palette: Toggling command palette')
    toggle()
  }
}

// 切换到其他标签页，需要关闭面板
function handleWindowBlur() {
  if (isOpen.value) {
    close()
  }
}

onMounted(() => {
  // 监听从 background 发送的 script
  browser.runtime.onMessage.addListener(handleMessage)

  // 监听全局键盘事件
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('keyup', handleKeyup)

  window.addEventListener('blur', handleWindowBlur)

  // Load initial actions
  loadActions()
})

onUnmounted(() => {
  browser.runtime.onMessage.removeListener(handleMessage)

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keyup', handleKeyup)

  window.removeEventListener('blur', handleWindowBlur)
})
</script>

<template>
  <Transition name="command-palette" @after-leave="onAfterLeave">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm command-palette-overlay"
      @click="close"
      @keydown="handleKeydown"
    >
      <div class="mt-[10vh] w-full max-w-4xl mx-4 bg-card border border-border rounded-lg overflow-hidden" @click.stop>
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
              @keydown="handleInputKeydown"
              class="w-full pl-10 pr-4 py-3 bg-transparent text-foreground placeholder-muted-foreground border-0 outline-none text-sm"
              placeholder="请输入指令或者想要搜索的内容..."
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
              @click="setSearchQuery(prefix.prefix + ' ')"
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
                <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p class="text-sm text-muted-foreground">加载中...</p>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
                <Icon icon="material-symbols:error" class="w-8 h-8 text-destructive mb-3" />
                <p class="text-sm text-destructive mb-4">{{ error }}</p>
                <button
                  class="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary-hover rounded-md transition-colors"
                  @click="loadActions"
                >
                  再试一次
                </button>
              </div>

              <!-- Results -->
              <div
                v-else-if="filteredActions.length > 0"
                :ref="(el) => (scrollContainerRef = el as HTMLElement)"
                class="overflow-y-auto max-h-full"
              >
                <CommandPaletteItem
                  v-for="(action, index) in filteredActions"
                  :key="action.id"
                  :action="action"
                  :is-selected="index === selectedIndex"
                  :search-query="searchTerm"
                  :is-remove-mode="!!currentPrefix && ['/remove', '/close', '/delete'].includes(currentPrefix)"
                  :show-type-badge="!currentPrefix || currentPrefix === '/actions'"
                  @click="
                    () => {
                      selectIndex(index, true)
                      executeSelected()
                    }
                  "
                  @hover="selectIndex(index, true)"
                />
              </div>

              <!-- No Results -->
              <div v-else-if="searchQuery" class="flex flex-col items-center justify-center py-12 text-center">
                <Icon icon="material-symbols:search-off" class="w-8 h-8 text-muted-foreground mb-3" />
                <p class="text-sm text-foreground mb-2">没有找到有关 "{{ searchQuery }}" 的搜索结果</p>
                <p class="text-xs text-muted-foreground">可以尝试使用指令 /tabs, /bookmarks, /history 进行搜索</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="h-16 flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30">
              <div class="flex items-center">
                <span v-if="filteredActions.length > 0" class="text-xs text-muted-foreground">
                  {{ filteredActions.length }}条
                </span>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">↑</kbd>
                  <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">↓</kbd>
                  <span class="text-xs text-muted-foreground ml-1">选择</span>
                </div>
                <div class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">↵</kbd>
                  <span class="text-xs text-muted-foreground ml-1">确认</span>
                </div>
                <div class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">esc</kbd>
                  <span class="text-xs text-muted-foreground ml-1">关闭</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

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

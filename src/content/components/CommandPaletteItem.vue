<template>
  <div
    :class="[
      'flex items-center px-4 py-3 cursor-pointer transition-all border-l-2 border-transparent',
      'hover:bg-accent hover:text-accent-foreground',
      {
        'bg-primary/10 border-l-primary text-primary-foreground': isSelected,
        'opacity-75': isRemoveMode
      }
    ]"
    @click="$emit('click')"
    @mouseenter="$emit('hover')"
  >
    <!-- Icon/Emoji -->
    <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
      <div v-if="action.emoji && action.emojiChar" class="text-lg leading-none">
        {{ action.emojiChar }}
      </div>
      <img
        v-else-if="action.favIconUrl"
        :src="action.favIconUrl"
        :alt="action.title"
        class="w-5 h-5 rounded"
        @error="onImageError"
      />
      <Icon
        v-else-if="action.icon"
        :icon="action.icon"
        class="w-5 h-5 text-muted-foreground"
      />
      <div v-else class="w-5 h-5 bg-muted rounded flex items-center justify-center">
        <Icon
          :icon="getDefaultIcon(action.type)"
          class="w-3 h-3 text-muted-foreground"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <!-- Title with highlighting -->
          <div class="flex items-center gap-2 text-sm font-medium text-foreground truncate">
            <span v-if="isRemoveMode" class="text-destructive">
              {{ getRemovePrefix(action.type) }}
            </span>
            <HighlightedText :text="action.title" :query="searchQuery" />
            <!-- Type Badge -->
            <span
              v-if="showTypeBadge"
              :class="[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0 ml-auto',
                getTypeBadgeClass(action.type)
              ]"
              :aria-label="`Source: ${getTypeBadgeText(action.type)}`"
              role="img"
            >
              <Icon :icon="getTypeBadgeIcon(action.type)" class="w-2.5 h-2.5" aria-hidden="true" />
              <span class="leading-none">{{ getTypeBadgeText(action.type) }}</span>
            </span>
          </div>

          <!-- Description/URL -->
          <div class="text-xs text-muted-foreground truncate mt-1">
            <HighlightedText :text="action.description" :query="searchQuery" />
          </div>
        </div>

        <!-- Right Side Content -->
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          <!-- Keyboard Shortcut -->
          <div v-if="action.keyboardShortcut && !isRemoveMode" class="flex items-center gap-1">
            <kbd
              v-for="key in action.keyboardShortcut"
              :key="key"
              class="px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground border border-border rounded"
            >
              {{ key }}
            </kbd>
          </div>

          <!-- Tab/Window Info -->
          <div v-if="action.type === 'tab'" class="flex items-center gap-1">
            <Icon
              v-if="action.pinned"
              icon="material-symbols:push-pin"
              class="w-3 h-3 text-blue-500"
              title="Pinned"
            />
            <Icon
              v-if="action.muted"
              icon="material-symbols:volume-off"
              class="w-3 h-3 text-red-500"
              title="Muted"
            />
          </div>

          <!-- Remove Mode Indicator -->
          <div v-if="isRemoveMode" class="flex-shrink-0">
            <Icon
              icon="material-symbols:delete"
              class="w-4 h-4 text-destructive"
            />
          </div>
        </div>
      </div>

      <!-- Additional Info for History Items -->
      <div v-if="action.type === 'history' && (action.visitCount || action.lastVisitTime)" class="mt-2">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span v-if="action.visitCount">
            {{ action.visitCount }} visit{{ action.visitCount === 1 ? '' : 's' }}
          </span>
          <span v-if="action.lastVisitTime">
            {{ formatDate(action.lastVisitTime) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { CommandAction } from '@/types/command'
import HighlightedText from './HighlightedText.vue'

interface Props {
  action: CommandAction
  isSelected: boolean
  searchQuery: string
  isRemoveMode?: boolean
  showTypeBadge?: boolean
}

defineProps<Props>()

defineEmits<{
  click: []
  hover: []
}>()

// Get default icon based on action type
function getDefaultIcon(type: string): string {
  const iconMap: Record<string, string> = {
    action: 'material-symbols:bolt',
    tab: 'material-symbols:tab',
    bookmark: 'material-symbols:bookmark',
    history: 'material-symbols:history',
    url: 'material-symbols:link',
  }
  return iconMap[type] || 'material-symbols:help'
}

// Get remove prefix text
function getRemovePrefix(type: string): string {
  const prefixMap: Record<string, string> = {
    tab: 'Close',
    bookmark: 'Remove',
    history: 'Delete',
  }
  return prefixMap[type] || 'Remove'
}

// Get type badge class for styling
function getTypeBadgeClass(type: string): string {
  const classMap: Record<string, string> = {
    tab: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    bookmark: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    history: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    action: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    url: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  }
  return classMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

// Get type badge icon
function getTypeBadgeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    tab: 'material-symbols:tab',
    bookmark: 'material-symbols:bookmark',
    history: 'material-symbols:history',
    action: 'material-symbols:settings',
    url: 'material-symbols:link',
  }
  return iconMap[type] || 'material-symbols:help'
}

// Get type badge text
function getTypeBadgeText(type: string): string {
  const textMap: Record<string, string> = {
    tab: 'TAB',
    bookmark: 'BOOKMARK',
    history: 'HISTORY',
    action: 'ACTION',
    url: 'URL',
  }
  return textMap[type] || 'ITEM'
}

// Handle favicon load error
function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Format date for history items
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>

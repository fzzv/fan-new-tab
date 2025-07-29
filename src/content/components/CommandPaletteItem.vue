<template>
  <div
    class="command-palette-item"
    :class="{
      'selected': isSelected,
      'remove-mode': isRemoveMode
    }"
    @click="$emit('click')"
    @mouseenter="$emit('hover')"
  >
    <!-- Icon/Emoji -->
    <div class="item-icon">
      <div v-if="action.emoji && action.emojiChar" class="emoji">
        {{ action.emojiChar }}
      </div>
      <img
        v-else-if="action.favIconUrl"
        :src="action.favIconUrl"
        :alt="action.title"
        class="favicon"
        @error="onImageError"
      />
      <Icon
        v-else-if="action.icon"
        :icon="action.icon"
        class="icon"
      />
      <div v-else class="default-icon">
        <Icon
          :icon="getDefaultIcon(action.type)"
          class="default-icon-svg"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="item-content">
      <div class="content-row">
        <div class="content-main">
          <!-- Title with highlighting -->
          <div class="item-title">
            <span v-if="isRemoveMode" class="remove-prefix">
              {{ getRemovePrefix(action.type) }}
            </span>
            <HighlightedText :text="action.title" :query="searchQuery" />
            <!-- Type Badge -->
            <span
              v-if="showTypeBadge"
              class="type-badge"
              :class="getTypeBadgeClass(action.type)"
              :aria-label="`Source: ${getTypeBadgeText(action.type)}`"
              role="img"
            >
              <Icon :icon="getTypeBadgeIcon(action.type)" class="badge-icon" aria-hidden="true" />
              <span class="badge-text">{{ getTypeBadgeText(action.type) }}</span>
            </span>
          </div>

          <!-- Description/URL -->
          <div class="item-description">
            <HighlightedText :text="action.description" :query="searchQuery" />
          </div>
        </div>

        <!-- Keyboard Shortcut -->
        <div v-if="action.keyboardShortcut && !isRemoveMode" class="keyboard-shortcut">
          <div class="shortcut-keys">
            <kbd
              v-for="key in action.keyboardShortcut"
              :key="key"
              class="shortcut-key"
            >
              {{ key }}
            </kbd>
          </div>
        </div>

        <!-- Tab/Window Info -->
        <div v-if="action.type === 'tab'" class="tab-info">
          <Icon
            v-if="action.pinned"
            icon="material-symbols:push-pin"
            class="tab-icon pinned"
            title="Pinned"
          />
          <Icon
            v-if="action.muted"
            icon="material-symbols:volume-off"
            class="tab-icon muted"
            title="Muted"
          />
        </div>

        <!-- Remove Mode Indicator -->
        <div v-if="isRemoveMode" class="remove-indicator">
          <Icon
            icon="material-symbols:delete"
            class="remove-icon"
          />
        </div>
      </div>

      <!-- Additional Info for History Items -->
      <div v-if="action.type === 'history' && (action.visitCount || action.lastVisitTime)" class="history-info">
        <div class="history-details">
          <span v-if="action.visitCount" class="visit-count">
            {{ action.visitCount }} visit{{ action.visitCount === 1 ? '' : 's' }}
          </span>
          <span v-if="action.lastVisitTime" class="last-visit">
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
    tab: 'badge-tab',
    bookmark: 'badge-bookmark',
    history: 'badge-history',
    action: 'badge-action',
    url: 'badge-action',
  }
  return classMap[type] || 'badge-action'
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
/* Item Container */
.command-palette-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.command-palette-item:hover {
  background-color: #f9fafb;
}

.command-palette-item.selected {
  background-color: #eff6ff;
  border-left-color: #3b82f6;
}

.command-palette-item.remove-mode {
  opacity: 0.75;
}

/* Icon */
.item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.emoji {
  font-size: 18px;
  line-height: 1;
}

.favicon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.default-icon {
  width: 20px;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-icon-svg {
  width: 12px;
  height: 12px;
  color: #6b7280;
}

/* Content */
.item-content {
  flex: 1;
  min-width: 0;
}

.content-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-main {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-prefix {
  color: #dc2626;
  margin-right: 4px;
}

/* Type Badge */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  margin-left: auto;
}

.badge-icon {
  width: 10px;
  height: 10px;
}

.badge-text {
  line-height: 1;
}

/* Badge Color Variants */
.badge-tab {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.badge-bookmark {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.badge-history {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.badge-action {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #86efac;
}

.item-description {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

/* Keyboard Shortcut */
.keyboard-shortcut {
  flex-shrink: 0;
  margin-left: 8px;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shortcut-key {
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

/* Tab Info */
.tab-info {
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-icon {
  width: 12px;
  height: 12px;
}

.tab-icon.pinned {
  color: #3b82f6;
}

.tab-icon.muted {
  color: #ef4444;
}

/* Remove Indicator */
.remove-indicator {
  flex-shrink: 0;
  margin-left: 8px;
}

.remove-icon {
  width: 16px;
  height: 16px;
  color: #ef4444;
}

/* History Info */
.history-info {
  margin-top: 4px;
}

.history-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.visit-count,
.last-visit {
  color: #9ca3af;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .command-palette-item:hover {
    background-color: #374151;
  }

  .command-palette-item.selected {
    background-color: rgba(59, 130, 246, 0.2);
  }

  .item-title {
    color: #f9fafb;
  }

  .remove-prefix {
    color: #fca5a5;
  }

  .item-description {
    color: #9ca3af;
  }

  .icon {
    color: #9ca3af;
  }

  .default-icon {
    background-color: #4b5563;
  }

  .default-icon-svg {
    color: #9ca3af;
  }

  .shortcut-key {
    color: #d1d5db;
    background-color: #374151;
    border-color: #4b5563;
  }

  .history-details {
    color: #6b7280;
  }

  .visit-count,
  .last-visit {
    color: #6b7280;
  }

  /* Dark mode badge styles */
  .badge-tab {
    background-color: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
    border-color: rgba(59, 130, 246, 0.3);
  }

  .badge-bookmark {
    background-color: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.3);
  }

  .badge-history {
    background-color: rgba(107, 114, 128, 0.2);
    color: #d1d5db;
    border-color: rgba(107, 114, 128, 0.3);
  }

  .badge-action {
    background-color: rgba(34, 197, 94, 0.2);
    color: #86efac;
    border-color: rgba(34, 197, 94, 0.3);
  }
}
</style>

<template>
  <div class="w-48 bg-card border-r border-border flex-shrink-0 flex flex-col">
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-border">
      <h3 class="text-sm font-medium text-foreground">Categories</h3>
    </div>

    <!-- Category List -->
    <div class="p-2">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          selectedCategory === category.id
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground'
        ]"
        @click="$emit('select-category', category.id)"
      >
        <Icon :icon="category.icon" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ category.label }}</span>
        <span
          v-if="category.count !== undefined"
          class="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
        >
          {{ category.count }}
        </span>
      </button>
    </div>

    <!-- Sidebar Footer -->
    <div class="mt-auto p-4 border-t border-border">
      <div class="text-xs text-muted-foreground">
        <div class="flex items-center gap-1">
          <Icon icon="material-symbols:keyboard" class="w-3 h-3" />
          <span>Use prefixes like /tabs, /bookmarks</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Category {
  id: string
  label: string
  icon: string
  count?: number
}

interface Props {
  selectedCategory: string
  tabCount?: number
  bookmarkCount?: number
  historyCount?: number
}

const props = defineProps<Props>()

defineEmits<{
  'select-category': [categoryId: string]
}>()

const categories = computed<Category[]>(() => [
  {
    id: 'all',
    label: 'All',
    icon: 'material-symbols:apps',
    count: (props.tabCount || 0) + (props.bookmarkCount || 0) + (props.historyCount || 0)
  },
  {
    id: 'tabs',
    label: 'Tabs',
    icon: 'material-symbols:tab',
    count: props.tabCount
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    icon: 'material-symbols:bookmark',
    count: props.bookmarkCount
  },
  {
    id: 'history',
    label: 'History',
    icon: 'material-symbols:history',
    count: props.historyCount
  }
])
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

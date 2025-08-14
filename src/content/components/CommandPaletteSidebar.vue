<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { cn } from '@/lib'

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
    label: '全部',
    icon: 'material-symbols:apps',
    count: (props.tabCount || 0) + (props.bookmarkCount || 0) + (props.historyCount || 0),
  },
  {
    id: 'tabs',
    label: '标签页',
    icon: 'material-symbols:tab',
    count: props.tabCount,
  },
  {
    id: 'bookmarks',
    label: '书签',
    icon: 'material-symbols:bookmark',
    count: props.bookmarkCount,
  },
  {
    id: 'history',
    label: '浏览记录',
    icon: 'material-symbols:history',
    count: props.historyCount,
  },
])
</script>

<template>
  <div class="w-48 bg-card border-r border-border flex-shrink-0 flex flex-col">
    <div class="p-1 border-b border-border">
      <h3 class="text-sm font-medium text-foreground text-center">快捷指令</h3>
    </div>

    <div class="p-2">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="
          cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md my-2',
            'bg-transparent hover:bg-accent hover:text-accent-foreground cursor-pointer',
            'focus:outline-none ring-2 ring-transparent ring-offset-2',
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground font-semibold border border-primary/20 ring-2 ring-primary ring-offset-2'
              : 'text-muted-foreground hover:text-foreground',
          )
        "
        @click="$emit('select-category', category.id)"
        :aria-pressed="selectedCategory === category.id"
        :title="`Switch to ${category.label} category`"
      >
        <Icon :icon="category.icon" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ category.label }}</span>
        <!-- 不需要显示数量 -->
        <!--<span-->
        <!--  v-if="category.count !== undefined"-->
        <!--  :class="[-->
        <!--    'ml-auto text-xs px-1.5 py-0.5 rounded-full transition-colors',-->
        <!--    selectedCategory === category.id-->
        <!--      ? 'bg-primary-foreground/20 text-primary-foreground font-medium'-->
        <!--      : 'bg-muted text-muted-foreground',-->
        <!--  ]"-->
        <!--&gt;-->
        <!--  {{ category.count }}-->
        <!--</span>-->
      </button>
    </div>

    <div class="h-16 mt-auto p-4 border-t border-border bg-muted/30">
      <div class="text-xs text-muted-foreground space-y-1">
        <div class="flex items-center gap-1">
          <Icon icon="material-symbols:mouse" class="w-4 h-4" />
          <span>点击快捷指令进行搜索</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="material-symbols:keyboard" class="w-5 h-4" />
          <span>或者输入指令进行过滤</span>
        </div>
      </div>
    </div>
  </div>
</template>

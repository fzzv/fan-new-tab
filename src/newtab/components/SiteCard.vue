<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar'
import { cn } from '@/lib/utils'

const props = defineProps<{
  imageUrl: string
  title: string
  alt?: string
  site?: any
}>()

const emit = defineEmits<{
  (e: 'context-menu', event: MouseEvent, site: any): void
}>()

// 处理右键点击
function handleContextMenu(event: MouseEvent) {
  if (props.site) {
    event.preventDefault()
    emit('context-menu', event, props.site)
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center gap-4 cursor-pointer group"
    @contextmenu="handleContextMenu"
  >
    <!-- Avatar组件容器，添加hover效果 -->
    <div :class="cn('transition-all duration-200 ease-in-out active:scale-95 rounded-full')">
      <Avatar class="border-2 border-border">
        <AvatarImage
          :src="imageUrl"
          :alt="alt || title"
          :class="cn('transition-transform duration-200', 'group-hover:scale-110')"
        />
        <AvatarFallback>{{ title.charAt(0).toUpperCase() }}</AvatarFallback>
      </Avatar>
    </div>

    <!-- 标题 -->
    <div
      :class="
        cn(
          'text-center text-sm font-medium text-foreground',
          'line-clamp-2 leading-tight max-w-[80px]',
          'transition-colors duration-200',
        )
      "
      :title="title"
    >
      {{ title }}
    </div>
  </div>
</template>

<style scoped>
/* 限制标题显示行数 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

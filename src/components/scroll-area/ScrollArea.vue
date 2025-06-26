<script setup lang="ts">
import { computed } from 'vue'
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaCorner } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

export interface ScrollAreaProps {
  /**
   * 滚动区域的高度
   */
  height?: string | number
  /**
   * 滚动区域的最大高度
   */
  maxHeight?: string | number
  /**
   * 滚动条显示类型
   * - auto: 内容溢出时显示
   * - always: 始终显示
   * - scroll: 滚动时显示
   * - hover: 悬停时显示
   */
  type?: 'auto' | 'always' | 'scroll' | 'hover'
  /**
   * 滚动条隐藏延迟（毫秒）
   */
  scrollHideDelay?: number
  /**
   * 是否显示水平滚动条
   */
  horizontal?: boolean
  /**
   * 是否显示垂直滚动条
   */
  vertical?: boolean
  /**
   * 自定义类名
   */
  className?: string
}

const props = withDefaults(defineProps<ScrollAreaProps>(), {
  type: 'hover',
  scrollHideDelay: 600,
  horizontal: false,
  vertical: true,
})

const emit = defineEmits<{
  (e: 'areaScroll', event: Event): void
}>()

// 计算容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }

  return style
})
</script>

<template>
  <ScrollAreaRoot
    :type="type"
    :scroll-hide-delay="scrollHideDelay"
    :class="cn('relative overflow-hidden', $attrs.class as ClassValue)"
    :style="containerStyle"
  >
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]" @scroll="(event) => emit('areaScroll', event)">
      <slot />
    </ScrollAreaViewport>
    <!-- 垂直滚动条 -->
    <ScrollAreaScrollbar
      v-if="vertical"
      orientation="vertical"
      class="flex touch-none select-none transition-colors duration-150 ease-out hover:bg-muted/50 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 h-full w-2.5 border-l border-l-transparent p-[1px]"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border hover:bg-border/80 transition-colors" />
    </ScrollAreaScrollbar>
    <!-- 水平滚动条 -->
    <ScrollAreaScrollbar
      v-if="horizontal"
      orientation="horizontal"
      class="flex touch-none select-none transition-colors duration-150 ease-out hover:bg-muted/50 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 w-full h-2.5 border-t border-t-transparent p-[1px]"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border hover:bg-border/80 transition-colors" />
    </ScrollAreaScrollbar>
    <!-- 滚动条交叉角 -->
    <ScrollAreaCorner v-if="horizontal && vertical" />
  </ScrollAreaRoot>
</template>

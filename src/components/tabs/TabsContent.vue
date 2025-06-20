<script setup lang="ts">
import { computed } from 'vue'
import { TabsContent } from 'reka-ui'
import { ScrollArea } from '@/components/scroll-area'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

const props = defineProps<{
  value: string
  contentHeight?: number
}>()

// 是否需要滚动区域
const needScrollArea = computed(() => !!props.contentHeight)

// 计算 ScrollArea 的高度
const scrollAreaHeight = computed(() => {
  if (props.contentHeight) {
    return `${props.contentHeight}px`
  }
  return undefined
})
</script>

<template>
  <TabsContent
    :value="value"
    :class="cn('mt-2', needScrollArea ? 'p-0' : 'p-4', $attrs.class as ClassValue)"
    v-bind="$attrs"
  >
    <!-- 使用 ScrollArea 当需要固定高度时 -->
    <ScrollArea v-if="needScrollArea" :height="scrollAreaHeight" type="hover" class="p-4">
      <slot />
    </ScrollArea>
    <!-- 不需要滚动时使用原生布局 -->
    <slot v-else />
  </TabsContent>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/vue'
import type { ClassValue } from 'clsx'
import type { CSSProperties } from 'vue'

const drawerHeaderVariants = cva('flex items-center justify-between border-b-2 px-4 min-h-12 flex-shrink-0', {
  variants: {
    variant: {
      default: 'bg-primary text-black',
      secondary: 'bg-background text-foreground',
    },
    position: {
      fixed: 'sticky top-0',
      static: 'static',
    },
  },
  defaultVariants: {
    variant: 'default',
    position: 'static',
  },
})

export interface DrawerHeaderProps {
  title?: string
  closable?: boolean
  variant?: 'default' | 'secondary'
  position?: 'fixed' | 'static'
  asChild?: boolean
  style?: CSSProperties
}

withDefaults(defineProps<DrawerHeaderProps>(), {
  closable: true,
  variant: 'default',
  position: 'static',
  asChild: false,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <div
    :class="cn('font-head', drawerHeaderVariants({ variant, position }), $attrs.class as ClassValue)"
    :style="style"
    v-bind="$attrs"
  >
    <template v-if="asChild">
      <slot />
    </template>
    <template v-else>
      <div class="flex-1">
        <slot>
          <span v-if="title" class="text-lg font-medium">{{ title }}</span>
        </slot>
      </div>
      <button
        v-if="closable"
        @click="handleClose"
        class="cursor-pointer hover:opacity-70 transition-opacity p-1 rounded"
        aria-label="关闭"
      >
        <Icon icon="material-symbols:close-small-outline-rounded" width="24" height="24" />
      </button>
    </template>
  </div>
</template>

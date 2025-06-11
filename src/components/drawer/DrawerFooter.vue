<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
import type { CSSProperties } from 'vue'

const drawerFooterVariants = cva('flex items-center justify-end border-t-2 min-h-12 gap-4 px-4 py-2 flex-shrink-0', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    },
    position: {
      fixed: 'sticky bottom-0',
      static: 'static',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
  },
  defaultVariants: {
    variant: 'default',
    position: 'static',
    justify: 'end',
  },
})

export interface DrawerFooterProps {
  variant?: 'default' | 'secondary'
  position?: 'fixed' | 'static'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  style?: CSSProperties
}

withDefaults(defineProps<DrawerFooterProps>(), {
  variant: 'default',
  position: 'static',
  justify: 'end',
})
</script>

<template>
  <div
    :class="cn(drawerFooterVariants({ variant, position, justify }), $attrs.class as ClassValue)"
    :style="style"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

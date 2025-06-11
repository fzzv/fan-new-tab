<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
import type { CSSProperties } from 'vue'

const drawerContentVariants = cva('flex-1 overflow-y-auto overscroll-contain', {
  variants: {
    padding: {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    variant: {
      default: 'bg-background text-foreground',
      card: 'bg-card text-card-foreground',
    },
  },
  defaultVariants: {
    padding: 'md',
    variant: 'default',
  },
})

export interface DrawerContentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'card'
  style?: CSSProperties
}

withDefaults(defineProps<DrawerContentProps>(), {
  padding: 'md',
  variant: 'default',
})
</script>

<template>
  <div
    :class="cn(drawerContentVariants({ padding, variant }), $attrs.class as ClassValue)"
    :style="style"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

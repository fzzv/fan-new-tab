<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { provide } from 'vue'
import type { ClassValue } from 'clsx'

const collapsibleRootVariants = cva('flex flex-col transition-all duration-200', {
  variants: {
    variant: {
      default: 'border-2 border-border bg-card shadow-md',
      outline: 'border-2 border-border bg-transparent',
      ghost: 'border-0 bg-transparent',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

interface CollapsibleRootProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<CollapsibleRootProps>(), {
  variant: 'default',
  size: 'md',
})

const open = defineModel<boolean>('open', { required: true })

// 提供状态给子组件
provide('collapsible-open', open)
</script>

<template>
  <div
    :class="cn(collapsibleRootVariants({ variant, size }), $attrs.class as ClassValue)"
    :data-state="open ? 'open' : 'closed'"
  >
    <slot />
  </div>
</template>

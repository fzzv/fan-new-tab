<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { inject } from 'vue'
import type { ClassValue } from 'clsx'
import type { Ref } from 'vue'

const collapsibleContentVariants = cva('origin-top overflow-hidden', {
  variants: {
    variant: {
      default: 'border-t-2 border-border bg-card text-card-foreground',
      outline: 'border-t-2 border-border bg-transparent text-foreground',
      ghost: 'bg-transparent text-foreground',
    },
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

interface ContentProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<ContentProps>(), {
  variant: 'default',
  size: 'md',
})

// 从父组件获取状态
const isOpen = inject<Ref<boolean>>('collapsible-open')
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="transform scale-y-0 opacity-0"
    enter-to-class="transform scale-y-100 opacity-100"
    leave-from-class="transform scale-y-100 opacity-100"
    leave-to-class="transform scale-y-0 opacity-0"
  >
    <div
      v-if="isOpen"
      :class="cn(collapsibleContentVariants({ variant, size }), $attrs.class as ClassValue)"
    >
      <slot />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

const buttonVariants = cva(
  'font-head transition-all outline-hidden cursor-pointer duration-200 font-medium flex items-center',
  {
    variants: {
      variant: {
        default:
          'shadow-md hover:shadow-none bg-primary text-black border-2 border-black transition hover:translate-y-1 hover:bg-primary-hover',
        secondary:
          'shadow-md hover:shadow-none bg-secondary shadow-primary text-secondary-foreground border-2 border-black transition hover:translate-y-1',
        outline:
          'shadow-md hover:shadow-none bg-transparent border-2 border-border text-secondary transition hover:translate-y-1',
        link: 'bg-transparent hover:underline',
      },
      size: {
        sm: 'px-3 py-1 text-sm shadow hover:shadow-none',
        md: 'px-4 py-1.5 text-base',
        lg: 'px-8 py-3 text-lg',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

defineProps<{
  variant?: 'default' | 'secondary' | 'outline' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}>()
</script>

<template>
  <button :class="cn(buttonVariants({ variant, size }), $attrs.class as ClassValue)" v-bind="$attrs">
    <slot />
  </button>
</template>

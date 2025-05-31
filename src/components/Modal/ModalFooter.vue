<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dialogFooterVariants = cva(
  "flex items-center justify-end border-t-2 min-h-12 gap-4 px-4 py-2",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
      },
      position: {
        fixed: "sticky bottom-0",
        static: "static",
      },
    },
    defaultVariants: {
      position: "fixed",
    },
  },
);

defineProps<{
  variant?: 'default'
  position?: 'fixed' | 'static'
}>()
</script>

<template>
  <div :class="cn(dialogFooterVariants({ variant, position }), $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

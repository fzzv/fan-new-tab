<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/vue'
import type { ClassValue } from 'clsx'

const dialogHeaderVariants = cva('flex items-center justify-between border-b-2 px-4 min-h-12', {
  variants: {
    variant: {
      default: 'bg-primary text-black',
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

defineProps<{
  variant?: 'default'
  position?: 'fixed' | 'static'
  asChild?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function close() {
  emit('close')
}
</script>

<template>
  <div
    :class="cn('font-head', dialogHeaderVariants({ variant, position }), $attrs.class as ClassValue)"
    v-bind="$attrs"
  >
    <template v-if="asChild">
      <slot />
    </template>
    <template v-else>
      <div>
        <slot />
      </div>
      <button @click="close" class="cursor-pointer">
        <Icon icon="material-symbols:close-small-outline-rounded" width="32" height="32" />
      </button>
    </template>
  </div>
</template>

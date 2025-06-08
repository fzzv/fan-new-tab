<script setup lang="ts">
import { cn } from '@/lib'
import type { ClassValue } from 'clsx'
</script>

<template>
  <div
    :class="
      cn(
        'relative text-black flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm',
        'outline-hidden transition-colors hover:bg-primary focus:bg-primary data-disabled:pointer-events-none data-disabled:opacity-50',
        $attrs.class as ClassValue,
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style scoped></style>

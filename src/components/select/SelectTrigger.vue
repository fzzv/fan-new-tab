<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { SelectTrigger, SelectValue } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

withDefaults(
  defineProps<{
    placeholder?: string
    icon?: string
  }>(),
  {
    placeholder: 'Select an option',
    icon: 'radix-icons:chevron-down',
  },
)
</script>

<template>
  <SelectTrigger
    :class="
      cn(
        'flex h-10 min-w-40 items-center shadow-md justify-between border-2 border-input',
        'border-black bg-transparent px-4 py-2 ring-offset-background data-placeholder:text-muted-foreground',
        'focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class as ClassValue,
      )
    "
    v-bind="$attrs"
  >
    <SelectValue :placeholder="placeholder" />
    <Icon :icon="icon" class="ml-2 h-4 w-4" />
  </SelectTrigger>
</template>

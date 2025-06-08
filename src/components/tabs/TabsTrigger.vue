<script setup lang="ts">
import { TabsTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

defineProps<{
  value: string
}>()
</script>

<template>
  <TabsTrigger
    :value="value"
    :class="
      cn(
        'px-4 py-1 border-2 border-transparent data-active:border-black cursor-pointer ',
        'data-active:bg-primary data-active:font-base data-active:text-black focus:outline-hidden text-base',
        $attrs.class as ClassValue,
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </TabsTrigger>
</template>

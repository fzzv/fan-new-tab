<script setup lang="ts">
import { TabsList } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

defineProps<{
  asChild?: boolean
}>()
</script>

<template>
  <TabsList :class="cn('flex space-x-2', $attrs.class as ClassValue)" v-bind="$attrs">
    <slot />
  </TabsList>
</template>

<script setup lang="ts">
import { TabsList } from 'reka-ui'
import { cn } from '@/lib/utils'

defineProps<{
  asChild?: boolean
}>()
</script>

<template>
  <TabsList :class="cn('flex space-x-2')" v-bind="$attrs">
    <slot />
  </TabsList>
</template>

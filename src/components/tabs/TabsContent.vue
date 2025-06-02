<script setup lang="ts">
import { TabsContent } from 'reka-ui'
import { cn } from '@/lib/utils'

defineProps<{
  value: string
}>()
</script>

<template>
  <TabsContent :value="value" :class="cn('mt-2 p-4')" v-bind="$attrs">
    <slot />
  </TabsContent>
</template>

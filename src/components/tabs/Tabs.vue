<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from './index'
import { Icon } from '@iconify/vue'
import { cn } from '@/lib/utils'

defineProps<{
  asChild?: boolean
  tabs: {
    value: string
    label: string
    icon: string
  }[]
}>()

const modelValue = defineModel<string>('modelValue', { required: true })
</script>

<template>
  <TabsRoot v-model="modelValue" @update:modelValue="modelValue = $event">
    <TabsList>
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="
          cn('flex items-center gap-2 px-4 py-1 border-border text-secondary')
        "
      >
        <Icon :icon="tab.icon" width="24" height="24" />
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
</template>

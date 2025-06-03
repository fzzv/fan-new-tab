<script setup lang="ts">
import { SelectItem, SelectItemIndicator, SelectItemText } from 'reka-ui'
import { Icon } from '@iconify/vue'
import { cn } from '@/lib/utils'

interface ItemProps {
  value: string
  disabled?: boolean
  icon?: string
}
withDefaults(defineProps<ItemProps>(), {
  value: '',
  disabled: false,
  icon: 'radix-icons:check',
})
</script>

<template>
  <SelectItem
    :class="
      cn(
        'relative flex w-full cursor-default select-none items-center py-1.5 px-4',
        'outline-hidden hover:bg-primary data-disabled:pointer-events-none data-disabled:opacity-50',
      )
    "
    :disabled="disabled"
    :value="value"
    v-bind="$attrs"
  >
    <SelectItemText>
      <slot />
    </SelectItemText>
    <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Icon :icon="icon" />
      </SelectItemIndicator>
    </span>
  </SelectItem>
</template>

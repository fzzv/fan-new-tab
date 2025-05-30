<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface InputProps extends /* @vue-ignore */ InputHTMLAttributes {
  class?: string
}

withDefaults(defineProps<InputProps>(), {
  type: 'text',
  placeholder: '请输入',
})
</script>

<template>
  <div
    :class="cn('flex px-4 py-2 items-center border-2 shadow-md transition focus-within:shadow-xs',
      { 'border-red-500 text-red-500 shadow-xs shadow-red-600': $attrs['aria-invalid'] },
      $props.class,
    )"
  >
    <slot name="prefix" />
    <input
      :type="type"
      :placeholder="placeholder"
      class="flex-1 px-4 py-2 focus:outline-hidden"
      v-bind="$attrs"
    />
    <slot name="suffix" />
  </div>
</template>

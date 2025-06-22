<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface InputProps extends /* @vue-ignore */ InputHTMLAttributes {
  class?: string
  invalid?: boolean
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  placeholder: '请输入',
  autocapitalize: 'off',
  inputmode: 'text',
  spellcheck: 'false',
  autocorrect: 'off',
  autocomplete: 'off',
  invalid: false,
})

const modelValue = defineModel()

const emit = defineEmits<{
  (e: 'keydown', event: KeyboardEvent): void
}>()
</script>

<template>
  <div
    :class="
      cn(
        'h-15 flex px-4 items-center text-base border-2 border-secondary shadow-md transition focus-within:shadow-xs focus-within:border-secondary',
        {
          'border-destructive text-destructive shadow-xs shadow-destructive focus-within:border-destructive': invalid,
        },
        $props.class,
      )
    "
  >
    <slot name="prefix" />
    <input
      :value="modelValue"
      @input="modelValue = ($event.target as HTMLInputElement).value"
      :type="props.type"
      :placeholder="props.placeholder"
      :autocapitalize="props.autocapitalize"
      :inputmode="props.inputmode"
      :spellcheck="props.spellcheck"
      :autocorrect="props.autocorrect"
      :autocomplete="props.autocomplete"
      :class="
        cn('h-full flex-1 focus:outline-none bg-transparent text-foreground placeholder:text-muted-foreground', {
          'placeholder:text-destructive': invalid,
        })
      "
      v-bind="$attrs"
      @keydown="emit('keydown', $event)"
    />
    <slot name="suffix" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { inject } from 'vue'
import type { ClassValue } from 'clsx'
import type { Ref } from 'vue'

const collapsibleTriggerVariants = cva(
  'flex items-center justify-between cursor-pointer select-none transition-all duration-200 font-medium disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'px-4 py-3 hover:bg-primary/10 text-card-foreground',
        outline: 'px-4 py-3 hover:bg-muted/50 text-foreground',
        ghost: 'px-2 py-2 hover:bg-accent/20 text-foreground',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
    },
  },
)

interface TriggerProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<TriggerProps>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  if (!props.disabled) {
    emit('click')
  }
}

// 从父组件获取状态
const isOpen = inject<Ref<boolean>>('collapsible-open')
</script>

<template>
  <div
    :class="cn(collapsibleTriggerVariants({ variant, size, disabled }), $attrs.class as ClassValue)"
    @click="handleClick"
  >
    <slot />
    <slot v-if="$slots.expandIcon" name="expandIcon" />
    <Icon
      v-else
      icon="material-symbols:expand-more"
      :class="
        cn('transition-transform duration-200', {
          'w-5 h-5': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-7 h-7': size === 'lg',
          'rotate-180': isOpen,
        })
      "
    />
  </div>
</template>

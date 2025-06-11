<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem } from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib'
import type { ClassValue } from 'clsx'
import type { CSSProperties } from 'vue'

const radioVariants = cva('border-black border-2', {
  variants: {
    variant: {
      default: '',
      outline: '',
      solid: '',
    },
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

const radioIndicatorVariants = cva('flex ', {
  variants: {
    variant: {
      default: 'bg-primary border-2 border-black',
      outline: 'border-2 border-black',
      solid: 'bg-black',
    },
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3.5 w-3.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

defineProps<{
  variant?: 'default' | 'outline' | 'solid'
  size?: 'sm' | 'md' | 'lg'
  contentClass?: CSSProperties
}>()
</script>

<template>
  <div class="flex items-center">
    <RadioGroupItem
      :class="
        cn(
          radioVariants({
            size,
            variant,
          }),
          $attrs.class as ClassValue,
        )
      "
      v-bind="$attrs"
    >
      <RadioGroupIndicator class="flex justify-center items-center">
        <span :class="radioIndicatorVariants({ size, variant })"></span>
      </RadioGroupIndicator>
    </RadioGroupItem>
    <div :class="cn('pl-2', contentClass)">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>

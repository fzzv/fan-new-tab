<script setup lang="ts">
import { computed } from 'vue'
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

interface SliderProps {
  modelValue?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  inverted?: boolean
  minStepsBetweenThumbs?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'secondary'
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  orientation: 'horizontal',
  inverted: false,
  minStepsBetweenThumbs: 0,
  size: 'md',
  variant: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  valueCommit: [value: number[]]
}>()

// 样式变体
const sliderRootVariants = cva('relative flex touch-none select-none items-center', {
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full flex-col',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
})

const sliderTrackVariants = cva('relative grow overflow-hidden bg-muted border-2 border-border', {
  variants: {
    orientation: {
      horizontal: 'h-2 w-full',
      vertical: 'w-2 h-full',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'sm',
      class: 'h-1.5',
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: 'h-2',
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: 'h-3',
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: 'w-1.5',
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: 'w-2',
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: 'w-3',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
    disabled: false,
  },
})

const sliderRangeVariants = cva('absolute', {
  variants: {
    orientation: {
      horizontal: 'h-full',
      vertical: 'w-full',
    },
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
  },
})

const sliderThumbVariants = cva(
  'block border-2 border-border bg-background shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-110 active:scale-95',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default: 'hover:bg-primary/10 focus-visible:ring-primary',
        secondary: 'hover:bg-secondary/10 focus-visible:ring-secondary',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

// 计算样式类
const rootClasses = computed(() => cn(sliderRootVariants({ orientation: props.orientation, size: props.size })))

const trackClasses = computed(() =>
  cn(sliderTrackVariants({ orientation: props.orientation, size: props.size, disabled: props.disabled })),
)

const rangeClasses = computed(() => cn(sliderRangeVariants({ orientation: props.orientation, variant: props.variant })))

const thumbClasses = computed(() => cn(sliderThumbVariants({ size: props.size, variant: props.variant })))

// 处理值更新
const handleValueChange = (value?: number[]) => {
  if (value) {
    emit('update:modelValue', value)
  }
}

const handleValueCommit = (value: number[]) => {
  emit('valueCommit', value)
}

// 计算thumb数量
const thumbCount = computed(() => {
  if (props.modelValue) {
    return props.modelValue.length
  }
  if (props.defaultValue) {
    return props.defaultValue.length
  }
  return 1
})
</script>

<template>
  <SliderRoot
    :class="cn(rootClasses, $attrs.class as ClassValue)"
    :model-value="modelValue"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :orientation="orientation"
    :inverted="inverted"
    :min-steps-between-thumbs="minStepsBetweenThumbs"
    @update:model-value="handleValueChange"
    @value-commit="handleValueCommit"
    v-bind="$attrs"
  >
    <SliderTrack :class="trackClasses">
      <SliderRange :class="rangeClasses" />
    </SliderTrack>
    <SliderThumb v-for="index in thumbCount" :key="index" :class="thumbClasses" />
  </SliderRoot>
</template>

<style scoped>
/* 确保垂直滑块的正确显示 */
.slider-vertical {
  writing-mode: bt-lr; /* IE */
  writing-mode: vertical-lr; /* Standard */
}
</style>

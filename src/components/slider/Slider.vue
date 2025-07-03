<script setup lang="ts" generic="T extends number | number[]">
import { computed } from 'vue'
import { SliderRoot, SliderTrack, SliderRange, SliderThumb, useForwardPropsEmits } from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
import type { SliderProps, SliderEmits } from './types'

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
})
const emits = defineEmits<SliderEmits<T>>()

const modelValue = defineModel<T>()

const forward = useForwardPropsEmits(props, emits)

const defaultSliderValue = computed(() => {
  if (typeof props.defaultValue === 'number') {
    return [props.defaultValue]
  }
  return props.defaultValue
})

const sliderValue = computed({
  get() {
    if (typeof modelValue.value === 'number') {
      return [modelValue.value]
    }
    return (modelValue.value as number[]) ?? defaultSliderValue.value
  },
  set(value) {
    modelValue.value = (value?.length !== 1 ? value : value[0]) as T
  },
})

const thumbs = computed(() => sliderValue.value?.length ?? 1)

function onUpdateModelValue(value: any) {
  emits('update:modelValue', value)
}

function onChange(value: any) {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event('change', { target: { value } })
  emits('change', event)
}

// 样式
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
  'block border-2 border-black bg-primary shadow-sm transition cursor-pointer hover:translate-y-[1px] hover:bg-primary-hover hover:shadow-none data-disabled:pointer-events-none data-disabled:opacity-50 data-disabled:cursor-not-allowed focus:outline-none',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default: 'hover:bg-primary-hover',
        secondary: 'hover:bg-secondary-hover',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)
const rootClasses = computed(() => cn(sliderRootVariants({ orientation: props.orientation, size: props.size })))
const trackClasses = computed(() =>
  cn(sliderTrackVariants({ orientation: props.orientation, size: props.size, disabled: props.disabled })),
)
const rangeClasses = computed(() => cn(sliderRangeVariants({ orientation: props.orientation, variant: props.variant })))
const thumbClasses = computed(() => cn(sliderThumbVariants({ size: props.size, variant: props.variant })))
</script>

<template>
  <SliderRoot
    v-bind="{ ...forward }"
    v-model="sliderValue"
    :name="name"
    :disabled="disabled"
    :class="cn(rootClasses, $attrs.class as ClassValue)"
    :default-value="defaultSliderValue"
    @update:model-value="onUpdateModelValue"
    @value-commit="onChange"
  >
    <SliderTrack :class="trackClasses">
      <SliderRange :class="rangeClasses" />
    </SliderTrack>
    <SliderThumb v-for="thumb in thumbs" :key="thumb" :class="thumbClasses" />
  </SliderRoot>
</template>

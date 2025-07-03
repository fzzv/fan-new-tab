import type { SliderRootProps } from 'reka-ui'

export interface SliderProps
  extends Pick<SliderRootProps, 'name' | 'disabled' | 'inverted' | 'min' | 'max' | 'step' | 'minStepsBetweenThumbs'> {
  as?: any
  class?: any
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'secondary'
  defaultValue?: number | number[]
  orientation?: SliderRootProps['orientation']
}

export interface SliderEmits<T extends number | number[] = number | number[]> {
  (e: 'update:modelValue', payload: T): void
  (e: 'change', payload: Event): void
}

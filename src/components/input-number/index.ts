export { default as InputNumber } from './InputNumber.vue'

// 导出类型
export interface InputNumberProps {
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
}

export interface InputNumberEmits {
  'update:modelValue': [value: number | undefined]
  valueChange: [value: number | undefined]
}

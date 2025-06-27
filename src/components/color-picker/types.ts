export type ColorMode = 'rgb' | 'hex' | 'hsl' | 'hsv'

export interface RgbColor {
  r: number
  g: number
  b: number
  a?: number
}

export interface HslColor {
  h: number
  s: number
  l: number
  a?: number
}

export interface HsvColor {
  h: number
  s: number
  v: number
  a?: number
}

export interface ColorPickerProps {
  modelValue?: string
  mode?: ColorMode
  showAlpha?: boolean
  showPresets?: boolean
  presets?: string[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  class?: string
}

export interface ColorPickerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string, mode: ColorMode): void
}

export interface ColorState {
  rgb: RgbColor
  hsl: HslColor
  hsv: HsvColor
  hex: string
  alpha: number
}

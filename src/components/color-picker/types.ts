import type { ColorFormat, RGBA } from '@/lib/colorUtils.ts'

/**
 * 颜色选择器组件属性
 */
export interface ColorPickerProps {
  /** 当前颜色值 */
  modelValue?: string
  /** 默认颜色值 */
  defaultValue?: string
  /** 颜色格式模式 */
  mode?: ColorFormat
  /** 是否显示透明度控制 */
  showAlpha?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 预设颜色 */
  presets?: string[]
  /** 是否显示预设颜色 */
  showPresets?: boolean
  /** 是否显示颜色值输入框 */
  showInput?: boolean
  /** 是否显示格式切换 */
  showFormatSwitch?: boolean
  /** 触发器样式类 */
  triggerClass?: string
  /** 弹出层样式类 */
  popoverClass?: string
  /** 弹出层位置 */
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end'
  /** 是否显示颜色预览 */
  showPreview?: boolean
}

/**
 * 颜色选择器组件事件
 */
export interface ColorPickerEmits {
  /** 颜色值更新事件 */
  'update:modelValue': [value: string]
  /** 颜色变化事件 */
  change: [value: string, rgba: RGBA]
  /** 格式变化事件 */
  'format-change': [format: ColorFormat]
}

/**
 * 颜色选择器内部状态
 */
export interface ColorPickerState {
  /** 当前 RGBA 值 */
  rgba: RGBA
  /** 当前 HSV 值 */
  hsv: { h: number; s: number; v: number }
  /** 当前格式 */
  format: ColorFormat
  /** 是否显示弹出层 */
  visible: boolean
  /** 是否正在拖拽 */
  isDragging: boolean
}

/**
 * 饱和度/亮度面板属性
 */
export interface SaturationPanelProps {
  /** 色相值 (0-360) */
  hue: number
  /** 饱和度值 (0-100) */
  saturation: number
  /** 亮度值 (0-100) */
  value: number
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 饱和度/亮度面板事件
 */
export interface SaturationPanelEmits {
  /** 值变化事件 */
  change: [saturation: number, value: number]
}

/**
 * 色相滑块属性
 */
export interface HueSliderProps {
  /** 色相值 (0-360) */
  hue: number
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 色相滑块事件
 */
export interface HueSliderEmits {
  /** 色相变化事件 */
  change: [hue: number]
}

/**
 * 透明度滑块属性
 */
export interface AlphaSliderProps {
  /** 透明度值 (0-1) */
  alpha: number
  /** RGB 颜色值 */
  rgb: { r: number; g: number; b: number }
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 透明度滑块事件
 */
export interface AlphaSliderEmits {
  /** 透明度变化事件 */
  change: [alpha: number]
}

/**
 * 颜色输入框属性
 */
export interface ColorInputProps {
  /** 颜色值 */
  value: string
  /** 颜色格式 */
  format: ColorFormat
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 颜色输入框事件
 */
export interface ColorInputEmits {
  /** 值变化事件 */
  change: [value: string]
  /** 格式变化事件 */
  'format-change': [format: ColorFormat]
}

/**
 * 预设颜色属性
 */
export interface ColorPresetsProps {
  /** 预设颜色列表 */
  presets: string[]
  /** 当前选中的颜色 */
  value?: string
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 预设颜色事件
 */
export interface ColorPresetsEmits {
  /** 颜色选择事件 */
  select: [color: string]
}

/**
 * 颜色选择器面板组件属性
 */
export interface ColorPickerPanelProps {
  /** 当前颜色值 */
  modelValue?: string
  /** 颜色格式模式 */
  mode?: ColorFormat
  /** 是否显示透明度控制 */
  showAlpha?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 预设颜色 */
  presets?: string[]
  /** 是否显示预设颜色 */
  showPresets?: boolean
  /** 是否显示颜色值输入框 */
  showInput?: boolean
  /** 是否显示格式切换 */
  showFormatSwitch?: boolean
  /** 是否显示颜色预览 */
  showPreview?: boolean
}

/**
 * 颜色选择器面板组件事件
 */
export interface ColorPickerPanelEmits {
  /** 颜色值更新事件 */
  'update:modelValue': [value: string]
  /** 颜色变化事件 */
  change: [value: string, rgba: RGBA]
  /** 格式变化事件 */
  'format-change': [format: ColorFormat]
}

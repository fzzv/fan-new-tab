import {
  rgba,
  toHexString,
  toHexaString,
  toRgbString,
  toRgbaString,
  hsv2rgb,
  rgb2hsv,
  hsl2rgb,
  rgb2hsl,
  type RGBA as SeemlyRGBA,
} from 'seemly'

/**
 * 颜色格式类型定义
 */
export interface RGB {
  r: number
  g: number
  b: number
}

export interface RGBA extends RGB {
  a: number
}

export interface HSV {
  h: number
  s: number
  v: number
}

export interface HSVA extends HSV {
  a: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface HSLA extends HSL {
  a: number
}

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsv' | 'hsva' | 'hsl' | 'hsla'

/**
 * 颜色值类型
 */
export type ColorValue = string | RGB | RGBA | HSV | HSVA | HSL | HSLA

/**
 * 将 SeemlyRGBA 转换为自定义 RGBA 对象
 */
function seemlyRgbaToRgba(seemlyRgba: SeemlyRGBA): RGBA {
  return {
    r: seemlyRgba[0],
    g: seemlyRgba[1],
    b: seemlyRgba[2],
    a: seemlyRgba[3],
  }
}

/**
 * 将自定义 RGBA 对象转换为 SeemlyRGBA
 */
function rgbaToSeemlyRgba(rgba: RGBA): SeemlyRGBA {
  return [rgba.r, rgba.g, rgba.b, rgba.a]
}

/**
 * 解析颜色字符串为 RGBA 对象
 * @param color 颜色字符串
 * @returns RGBA 对象
 */
export function parseColor(color: string): RGBA {
  try {
    // 使用 seemly 的 rgba 函数解析颜色
    const seemlyRgba = rgba(color)
    return seemlyRgbaToRgba(seemlyRgba)
  } catch (error) {
    console.error('解析颜色失败:', error)
    return { r: 0, g: 0, b: 0, a: 1 }
  }
}

/**
 * 将 RGBA 对象转换为 HEX 字符串
 * @param rgba RGBA 对象
 * @returns HEX 字符串
 */
export function rgbaToHex(rgba: RGBA): string {
  const seemlyRgba = rgbaToSeemlyRgba(rgba)
  return rgba.a < 1 ? toHexaString(seemlyRgba) : toHexString(seemlyRgba)
}

/**
 * 将 RGBA 对象转换为 RGB 字符串
 * @param rgba RGBA 对象
 * @returns RGB 字符串
 */
export function rgbaToRgbString(rgba: RGBA): string {
  const seemlyRgba = rgbaToSeemlyRgba(rgba)
  return toRgbString(seemlyRgba)
}

/**
 * 将 RGBA 对象转换为 RGBA 字符串
 * @param rgba RGBA 对象
 * @returns RGBA 字符串
 */
export function rgbaToRgbaString(rgba: RGBA): string {
  const seemlyRgba = rgbaToSeemlyRgba(rgba)
  return toRgbaString(seemlyRgba)
}

/**
 * 将 RGBA 对象转换为 HSV 对象
 * @param rgba RGBA 对象
 * @returns HSV 对象
 */
export function rgbaToHsv(rgba: RGBA): HSVA {
  const seemlyRgba = rgbaToSeemlyRgba(rgba)
  const seemlyHsv = rgb2hsv(seemlyRgba[0], seemlyRgba[1], seemlyRgba[2])
  return {
    h: seemlyHsv[0],
    s: seemlyHsv[1],
    v: seemlyHsv[2],
    a: rgba.a,
  }
}

/**
 * 将 HSV 对象转换为 RGBA 对象
 * @param hsva HSVA 对象
 * @returns RGBA 对象
 */
export function hsvToRgba(hsva: HSVA): RGBA {
  const seemlyRgba = hsv2rgb(hsva.h, hsva.s, hsva.v)
  return {
    r: seemlyRgba[0],
    g: seemlyRgba[1],
    b: seemlyRgba[2],
    a: hsva.a,
  }
}

/**
 * 将 RGBA 对象转换为 HSL 对象
 * @param rgba RGBA 对象
 * @returns HSL 对象
 */
export function rgbaToHsl(rgba: RGBA): HSLA {
  const seemlyRgba = rgbaToSeemlyRgba(rgba)
  const seemlyHsl = rgb2hsl(seemlyRgba[0], seemlyRgba[1], seemlyRgba[2])
  return {
    h: seemlyHsl[0],
    s: seemlyHsl[1],
    l: seemlyHsl[2],
    a: rgba.a,
  }
}

/**
 * 将 HSL 对象转换为 RGBA 对象
 * @param hsla HSLA 对象
 * @returns RGBA 对象
 */
export function hslToRgba(hsla: HSLA): RGBA {
  const seemlyRgba = hsl2rgb(hsla.h, hsla.s, hsla.l)
  return {
    r: seemlyRgba[0],
    g: seemlyRgba[1],
    b: seemlyRgba[2],
    a: hsla.a,
  }
}

/**
 * 将 HSV 对象转换为 HSL 对象
 * @param hsva HSVA 对象
 * @returns HSLA 对象
 */
export function hsvToHsl(hsva: HSVA): HSLA {
  const rgba = hsvToRgba(hsva)
  return rgbaToHsl(rgba)
}

/**
 * 将 HSL 对象转换为 HSV 对象
 * @param hsla HSLA 对象
 * @returns HSVA 对象
 */
export function hslToHsv(hsla: HSLA): HSVA {
  const rgba = hslToRgba(hsla)
  return rgbaToHsv(rgba)
}

/**
 * 验证颜色字符串是否有效
 * @param color 颜色字符串
 * @returns 是否有效
 */
export function isValidColor(color: string): boolean {
  try {
    rgba(color)
    return true
  } catch {
    return false
  }
}

/**
 * 格式化颜色输出
 * @param rgba RGBA 对象
 * @param format 输出格式
 * @returns 格式化的颜色字符串
 */
export function formatColor(rgba: RGBA, format: ColorFormat): string {
  switch (format) {
    case 'hex':
      return rgbaToHex(rgba)
    case 'rgb':
      return rgbaToRgbString(rgba)
    case 'rgba':
      return rgbaToRgbaString(rgba)
    case 'hsv': {
      const hsva = rgbaToHsv(rgba)
      return `hsv(${Math.round(hsva.h)}, ${Math.round(hsva.s)}%, ${Math.round(hsva.v)}%)`
    }
    case 'hsva': {
      const hsva = rgbaToHsv(rgba)
      return `hsva(${Math.round(hsva.h)}, ${Math.round(hsva.s)}%, ${Math.round(hsva.v)}%, ${hsva.a})`
    }
    case 'hsl': {
      const hsla = rgbaToHsl(rgba)
      return `hsl(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(hsla.l)}%)`
    }
    case 'hsla': {
      const hsla = rgbaToHsl(rgba)
      return `hsla(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(hsla.l)}%, ${hsla.a})`
    }
    default:
      return rgbaToHex(rgba)
  }
}

/**
 * 获取颜色的对比色（黑色或白色）
 * @param rgba RGBA 对象
 * @returns 对比色
 */
export function getContrastColor(rgba: RGBA): string {
  // 计算亮度
  const luminance = (0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/**
 * 预设颜色
 */
export const DEFAULT_PRESETS = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#feca57',
  '#ff9ff3',
  '#54a0ff',
  '#5f27cd',
  '#00d2d3',
  '#ff9f43',
  '#10ac84',
  '#ee5a24',
  '#0abde3',
  '#3867d6',
  '#8854d0',
  '#a55eea',
  '#26de81',
  '#fd79a8',
  '#fdcb6e',
  '#6c5ce7',
]

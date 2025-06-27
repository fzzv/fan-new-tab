import type { RgbColor, HslColor, HsvColor, ColorState } from './types'

/**
 * 将 RGB 转换为 HSL
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const sum = max + min

  const l = sum / 2

  let h = 0
  let s = 0

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum

    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / diff + 2
        break
      case b:
        h = (r - g) / diff + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a
  }
}

/**
 * 将 HSL 转换为 RGB
 */
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a
  }
}

/**
 * 将 RGB 转换为 HSV
 */
export function rgbToHsv(rgb: RgbColor): HsvColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  const v = max
  const s = max === 0 ? 0 : diff / max

  let h = 0
  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / diff + 2
        break
      case b:
        h = (r - g) / diff + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: rgb.a
  }
}

/**
 * 将 HSV 转换为 RGB
 */
export function hsvToRgb(hsv: HsvColor): RgbColor {
  const h = hsv.h / 360
  const s = hsv.s / 100
  const v = hsv.v / 100

  const c = v * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = v - c

  let r = 0, g = 0, b = 0

  if (h >= 0 && h < 1/6) {
    r = c; g = x; b = 0
  } else if (h >= 1/6 && h < 2/6) {
    r = x; g = c; b = 0
  } else if (h >= 2/6 && h < 3/6) {
    r = 0; g = c; b = x
  } else if (h >= 3/6 && h < 4/6) {
    r = 0; g = x; b = c
  } else if (h >= 4/6 && h < 5/6) {
    r = x; g = 0; b = c
  } else if (h >= 5/6 && h < 1) {
    r = c; g = 0; b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: hsv.a
  }
}

/**
 * 将 RGB 转换为 HEX
 */
export function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
  
  if (rgb.a !== undefined && rgb.a < 1) {
    return hex + toHex(rgb.a * 255)
  }
  
  return hex
}

/**
 * 将 HEX 转换为 RGB
 */
export function hexToRgb(hex: string): RgbColor {
  const cleanHex = hex.replace('#', '')
  
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return { r, g, b, a: 1 }
  }
  
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16)
    const g = parseInt(cleanHex.slice(2, 4), 16)
    const b = parseInt(cleanHex.slice(4, 6), 16)
    return { r, g, b, a: 1 }
  }
  
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.slice(0, 2), 16)
    const g = parseInt(cleanHex.slice(2, 4), 16)
    const b = parseInt(cleanHex.slice(4, 6), 16)
    const a = parseInt(cleanHex.slice(6, 8), 16) / 255
    return { r, g, b, a }
  }
  
  return { r: 0, g: 0, b: 0, a: 1 }
}

/**
 * 解析颜色字符串
 */
export function parseColor(color: string): ColorState {
  let rgb: RgbColor = { r: 0, g: 0, b: 0, a: 1 }
  
  if (color.startsWith('#')) {
    rgb = hexToRgb(color)
  } else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\(([^)]+)\)/)
    if (match) {
      const values = match[1].split(',').map(v => parseFloat(v.trim()))
      rgb = {
        r: values[0] || 0,
        g: values[1] || 0,
        b: values[2] || 0,
        a: values[3] !== undefined ? values[3] : 1
      }
    }
  } else if (color.startsWith('hsl')) {
    const match = color.match(/hsla?\(([^)]+)\)/)
    if (match) {
      const values = match[1].split(',').map(v => parseFloat(v.trim()))
      const hsl: HslColor = {
        h: values[0] || 0,
        s: values[1] || 0,
        l: values[2] || 0,
        a: values[3] !== undefined ? values[3] : 1
      }
      rgb = hslToRgb(hsl)
    }
  }
  
  const hsl = rgbToHsl(rgb)
  const hsv = rgbToHsv(rgb)
  const hex = rgbToHex(rgb)
  
  return {
    rgb,
    hsl,
    hsv,
    hex,
    alpha: rgb.a || 1
  }
}

/**
 * 格式化颜色输出
 */
export function formatColor(colorState: ColorState, mode: string): string {
  const { rgb, hsl, hsv, hex, alpha } = colorState
  
  switch (mode) {
    case 'hex':
      return alpha < 1 ? hex + Math.round(alpha * 255).toString(16).padStart(2, '0') : hex
    case 'rgb':
      return alpha < 1 
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    case 'hsl':
      return alpha < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    case 'hsv':
      return alpha < 1
        ? `hsva(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${alpha})`
        : `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
    default:
      return hex
  }
}

/**
 * 验证颜色字符串是否有效
 */
export function isValidColor(color: string): boolean {
  if (!color) return false
  
  // HEX 格式
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) {
    return true
  }
  
  // RGB/RGBA 格式
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[01]?\.?\d*)?\s*\)$/.test(color)) {
    return true
  }
  
  // HSL/HSLA 格式
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[01]?\.?\d*)?\s*\)$/.test(color)) {
    return true
  }
  
  return false
}

/**
 * 默认预设颜色
 */
export const DEFAULT_PRESETS = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
  '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
  '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#FF8080',
  '#FFFF80', '#80FF80', '#80FFFF', '#8080FF', '#FF80FF', '#FFB366'
]

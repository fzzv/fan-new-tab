import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 校验是否为有效的 URL 或域名
 */
export function isValidDomain(input: string): boolean {
  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`)
    // 判断是否符合 domain 的基本格式
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)
  } catch {
    return false
  }
}

// 国内或国外的图标获取接口
export const FaviconServices = {
  google: (domain: string, size = 32) =>
      `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`,

  duckduckgo: (domain: string) =>
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
}

/**
 * 获取网站图标
 * @param domain
 * @param service
 */
export function getFavicon(domain: string, service: keyof typeof FaviconServices = 'duckduckgo'): string {
  try {
    const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`)
    const hostname = url.hostname
    return FaviconServices[service](hostname)
  } catch (error) {
    console.error('Error:', error)
    console.error('Invalid domain:', domain)
    return ''
  }
}

/**
 * 生成头像
 * @param name
 * @param size
 */
export function generateAvatar(name: string, size = 64): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const initials = (name[0] || '?').toUpperCase()

  // 随机背景颜色（也可以使用哈希映射生成固定颜色）
  const bgColor = '#000'
  const textColor = '#FFFFFF'

  // 背景
  ctx.fillStyle = bgColor
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // 文字
  ctx.fillStyle = textColor
  ctx.font = `${size * 0.5}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

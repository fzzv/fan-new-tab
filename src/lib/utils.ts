import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { tabs } from 'webextension-polyfill'
import { $fetch } from 'ofetch'
import { saveAs } from 'file-saver'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  google: (domain: string, size = 32) => `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`,

  duckduckgo: (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
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

  const bgColor = getCssVar('border') || '#000'
  const textColor = getCssVar('background') || '#FFFFFF'
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

// 获取CSS变量值
export function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
}

/**
 * 将URL转为Base64
 * @param url
 */
export async function urlToBase64(url: string): Promise<string> {
  const response = await $fetch.raw(url, {
    responseType: 'blob',
  })
  const blob = new Blob([response?._data ?? ''], {
    type: response.headers.get('content-type') || 'application/octet-stream',
  })

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert image to base64'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 获取当前标签页的URL
 */
export async function getCurrentTabUrl() {
  const [tab] = await tabs.query({ active: true, currentWindow: true })
  return tab?.url || ''
}

/**
 * 从URL下载文件
 * @param url
 * @param filename
 */
export async function downloadFileFromUrl(url: string, filename?: string) {
  try {
    const defaultFilename = getFileNameFromUrl(url)
    const response = await $fetch.raw(url, {
      responseType: 'blob',
    })
    const blob = new Blob([response?._data ?? ''], {
      type: response.headers.get('content-type') || 'application/octet-stream',
    })
    saveAs(blob, filename || defaultFilename)
  } catch (err) {
    console.error('下载失败:', err)
  }
}

/**
 * 获取url中的文件名
 * @param url
 * @returns
 */
export function getFileNameFromUrl(url: string) {
  const urlObj = new URL(url)
  return urlObj.pathname.split('/').pop()?.split('?')[0]
}

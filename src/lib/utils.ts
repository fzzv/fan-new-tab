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
 * 将URL转为Blob
 * @param url
 */
export async function urlToBlob(url: string): Promise<Blob> {
  const response = await $fetch.raw(url, {
    responseType: 'blob',
  })
  return new Blob([response?._data ?? ''], {
    type: response.headers.get('content-type') || 'application/octet-stream',
  })
}

/**
 * 将File转为Blob
 * @param file
 */
export function fileToBlob(file: File): Blob {
  return new Blob([file], { type: file.type })
}

/**
 * 将Blob转为Base64
 * @param blob
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to base64'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 创建Blob URL
 * @param blob
 */
export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * 释放Blob URL
 * @param blobUrl
 */
export function revokeBlobUrl(blobUrl: string): void {
  URL.revokeObjectURL(blobUrl)
}

/**
 * 生成简单的字符串哈希
 * @param str
 */
export function simpleHash(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为32位整数
  }

  return Math.abs(hash).toString(36)
}

/**
 * 为Blob生成哈希值
 * @param blob
 */
export async function blobHash(blob: Blob): Promise<string> {
  // 使用文件大小、类型和前1KB内容生成哈希
  const sizeType = `${blob.size}-${blob.type}`

  // 读取前1KB内容
  const slice = blob.slice(0, 1024)
  const arrayBuffer = await slice.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // 生成简单的内容哈希
  let contentHash = 0
  for (let i = 0; i < uint8Array.length; i++) {
    contentHash = (contentHash << 5) - contentHash + uint8Array[i]
    contentHash = contentHash & contentHash
  }

  return simpleHash(sizeType + Math.abs(contentHash).toString())
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

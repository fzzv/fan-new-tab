import { ref } from 'vue'
import Dexie, { type Table } from 'dexie'
import { v4 as uuidV4 } from 'uuid'
import type { RecentWallpaper } from '@/types/wallpaper'
import { isColor } from '@/lib/colorUtils'
import { urlToBlob, createBlobUrl, revokeBlobUrl, simpleHash, blobHash } from '@/lib/utils'

// 数据库类
class RecentWallpaperDB extends Dexie {
  recentWallpapers!: Table<RecentWallpaper>

  constructor() {
    super('RecentWallpaperDB')
    this.version(1).stores({
      recentWallpapers: 'id, type, usedAt, originalUrl, mimeType, dataHash',
    })

    // 数据库结构如果升级，则清空旧数据
    this.version(1).upgrade(async (tx) => {
      // 清空旧数据，因为数据结构变化较大
      await tx.table('recentWallpapers').clear()
    })
  }
}

// 创建数据库实例
const db = new RecentWallpaperDB()

// 最近使用壁纸数据
const recentWallpapers = ref<RecentWallpaper[]>([])
const isLoading = ref(false)

// 7天的毫秒数
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function useRecentWallpaper() {
  // 加载最近使用的壁纸
  const loadRecentWallpapers = async () => {
    try {
      isLoading.value = true

      // 清理过期数据
      await cleanExpiredWallpapers()

      // 获取最近使用的壁纸，按使用时间倒序
      const data = await db.recentWallpapers.orderBy('usedAt').reverse().toArray()

      // 为blob类型的壁纸创建blob URL用于显示
      recentWallpapers.value = data.map((wallpaper) => ({
        ...wallpaper,
        blobUrl:
          wallpaper.type === 'blob' && wallpaper.data instanceof Blob ? createBlobUrl(wallpaper.data) : undefined,
      }))
    } catch (error) {
      console.error('加载最近使用壁纸失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 添加最近使用的壁纸
  const addRecentWallpaper = async (wallpaperData: string | Blob): Promise<void> => {
    try {
      // 判断壁纸类型
      let type: 'color' | 'blob'
      let data: string | Blob
      let originalUrl: string | undefined
      let mimeType: string | undefined
      let dataHash: string

      if (wallpaperData instanceof Blob) {
        // 直接是Blob类型
        type = 'blob'
        data = wallpaperData
        mimeType = wallpaperData.type
        dataHash = await blobHash(wallpaperData)
      } else if (isColor(wallpaperData)) {
        // 颜色值
        type = 'color'
        data = wallpaperData
        dataHash = simpleHash(wallpaperData)
      } else if (wallpaperData.startsWith('data:')) {
        // base64，转换为blob
        type = 'blob'

        // 将base64转换为blob
        const response = await fetch(wallpaperData)
        const blob = await response.blob()
        data = blob
        mimeType = blob.type
        dataHash = await blobHash(blob)
      } else {
        // URL，需要转换为blob
        type = 'blob'
        originalUrl = wallpaperData

        data = await urlToBlob(wallpaperData)
        mimeType = (data as Blob).type
        dataHash = await blobHash(data as Blob)
      }

      // 检查是否已存在相同的壁纸（通过哈希值查重）
      const existing = await db.recentWallpapers.where('dataHash').equals(dataHash).first()

      if (existing) {
        // 如果已存在，更新使用时间
        await db.recentWallpapers.update(existing.id, {
          usedAt: Date.now(),
        })
      } else {
        // 如果不存在，添加新记录
        const recentWallpaper: RecentWallpaper = {
          id: uuidV4(),
          data,
          type,
          usedAt: Date.now(),
          originalUrl,
          mimeType,
          dataHash,
          blobUrl: type === 'blob' && data instanceof Blob ? createBlobUrl(data) : undefined,
        }

        await db.recentWallpapers.add(recentWallpaper)
      }

      // 重新加载数据
      await loadRecentWallpapers()
    } catch (error) {
      console.error('添加最近使用壁纸失败:', error)
      throw error
    }
  }

  // 删除最近使用的壁纸
  const deleteRecentWallpaper = async (id: string) => {
    try {
      // 找到要删除的壁纸，释放其blob URL
      const wallpaper = recentWallpapers.value.find((w) => w.id === id)
      if (wallpaper?.blobUrl) {
        revokeBlobUrl(wallpaper.blobUrl)
      }

      await db.recentWallpapers.delete(id)
      recentWallpapers.value = recentWallpapers.value.filter((w) => w.id !== id)
    } catch (error) {
      console.error('删除最近使用壁纸失败:', error)
      throw error
    }
  }

  // 清理过期的壁纸（超过7天）
  const cleanExpiredWallpapers = async () => {
    try {
      const expiredTime = Date.now() - SEVEN_DAYS_MS
      await db.recentWallpapers.where('usedAt').below(expiredTime).delete()
    } catch (error) {
      console.error('清理过期壁纸失败:', error)
    }
  }

  // 清空所有最近使用壁纸
  const clearAllRecentWallpapers = async () => {
    try {
      // 释放所有blob URL
      recentWallpapers.value.forEach((wallpaper) => {
        if (wallpaper.blobUrl) {
          revokeBlobUrl(wallpaper.blobUrl)
        }
      })

      await db.recentWallpapers.clear()
      recentWallpapers.value = []
    } catch (error) {
      console.error('清空最近使用壁纸失败:', error)
      throw error
    }
  }

  // 获取壁纸显示名称
  const getWallpaperDisplayName = (wallpaper: RecentWallpaper): string => {
    if (wallpaper.type === 'color') {
      return `颜色 ${wallpaper.data}`
    } else if (wallpaper.originalUrl) {
      // 从原始URL提取文件名
      try {
        const url = new URL(wallpaper.originalUrl)
        const filename = url.pathname.split('/').pop()
        return filename || '网络图片'
      } catch {
        return '网络图片'
      }
    } else {
      return '本地图片'
    }
  }

  // 更新壁纸使用时间
  const updateWallpaperUsedTime = async (wallpaperId: string): Promise<void> => {
    try {
      await db.recentWallpapers.update(wallpaperId, {
        usedAt: Date.now(),
      })

      // 更新本地数组中的时间
      const wallpaper = recentWallpapers.value.find((w) => w.id === wallpaperId)
      if (wallpaper) {
        wallpaper.usedAt = Date.now()
      }

      // 重新排序
      recentWallpapers.value.sort((a, b) => b.usedAt - a.usedAt)
    } catch (error) {
      console.error('更新壁纸使用时间失败:', error)
      throw error
    }
  }

  return {
    // 状态
    recentWallpapers,
    isLoading,

    // 方法
    loadRecentWallpapers,
    addRecentWallpaper,
    deleteRecentWallpaper,
    cleanExpiredWallpapers,
    clearAllRecentWallpapers,
    getWallpaperDisplayName,
    updateWallpaperUsedTime,
  }
}

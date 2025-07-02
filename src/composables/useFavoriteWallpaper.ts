import { ref } from 'vue'
import Dexie, { type Table } from 'dexie'
import { v4 as uuidV4 } from 'uuid'
import type { FavoriteWallpaper } from '@/types/wallpaper'
import { isColor } from '@/lib/colorUtils'
import { urlToBlob, createBlobUrl, revokeBlobUrl, simpleHash, blobHash } from '@/lib/utils'

// 数据库类
class FavoriteWallpaperDB extends Dexie {
  favoriteWallpapers!: Table<FavoriteWallpaper>

  constructor() {
    super('FavoriteWallpaperDB')
    this.version(1).stores({
      favoriteWallpapers: 'id, type, favoriteAt, source, dataHash, name',
    })

    // 数据库结构如果升级，则清空旧数据
    this.version(1).upgrade(async (tx) => {
      await tx.table('favoriteWallpapers').clear()
    })
  }
}

// 创建数据库实例
const db = new FavoriteWallpaperDB()

// 收藏壁纸数据
const favoriteWallpapers = ref<FavoriteWallpaper[]>([])
const isLoading = ref(false)

export function useFavoriteWallpaper() {
  // 加载所有收藏壁纸
  const loadFavoriteWallpapers = async () => {
    try {
      isLoading.value = true
      const data = await db.favoriteWallpapers.orderBy('favoriteAt').reverse().toArray()

      // 为blob类型的壁纸创建blob URL用于显示
      favoriteWallpapers.value = data.map((wallpaper) => ({
        ...wallpaper,
        blobUrl:
          wallpaper.type === 'blob' && wallpaper.data instanceof Blob ? createBlobUrl(wallpaper.data) : undefined,
      }))
    } catch (error) {
      console.error('加载收藏壁纸失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 添加收藏壁纸
  const addFavoriteWallpaper = async (
    wallpaperData: string | Blob,
    source: 'cloud' | 'local' | 'color',
    originalUrl?: string,
    name?: string
  ): Promise<void> => {
    try {
      // 判断壁纸类型
      let type: 'color' | 'blob'
      let data: string | Blob
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
      const existing = await db.favoriteWallpapers.where('dataHash').equals(dataHash).first()

      if (existing) {
        // 如果已存在，不重复添加
        throw new Error('该壁纸已在收藏列表中')
      }

      // 添加新收藏
      const favoriteWallpaper: FavoriteWallpaper = {
        id: uuidV4(),
        data,
        type,
        favoriteAt: Date.now(),
        originalUrl,
        mimeType,
        dataHash,
        source,
        name,
        blobUrl: type === 'blob' && data instanceof Blob ? createBlobUrl(data) : undefined,
      }

      await db.favoriteWallpapers.add(favoriteWallpaper)

      // 重新加载数据
      await loadFavoriteWallpapers()
    } catch (error) {
      console.error('添加收藏壁纸失败:', error)
      throw error
    }
  }

  // 删除收藏壁纸
  const deleteFavoriteWallpaper = async (id: string) => {
    try {
      // 找到要删除的壁纸，释放其blob URL
      const wallpaper = favoriteWallpapers.value.find((w) => w.id === id)
      if (wallpaper?.blobUrl) {
        revokeBlobUrl(wallpaper.blobUrl)
      }

      await db.favoriteWallpapers.delete(id)
      favoriteWallpapers.value = favoriteWallpapers.value.filter((w) => w.id !== id)
    } catch (error) {
      console.error('删除收藏壁纸失败:', error)
      throw error
    }
  }

  // 检查壁纸是否已收藏
  const isFavorite = async (wallpaperData: string | Blob): Promise<boolean> => {
    try {
      let dataHash: string

      if (wallpaperData instanceof Blob) {
        dataHash = await blobHash(wallpaperData)
      } else if (isColor(wallpaperData)) {
        dataHash = simpleHash(wallpaperData)
      } else if (wallpaperData.startsWith('data:')) {
        const response = await fetch(wallpaperData)
        const blob = await response.blob()
        dataHash = await blobHash(blob)
      } else {
        const blob = await urlToBlob(wallpaperData)
        dataHash = await blobHash(blob)
      }

      const existing = await db.favoriteWallpapers.where('dataHash').equals(dataHash).first()
      return !!existing
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return false
    }
  }

  // 通过数据哈希删除收藏
  const deleteFavoriteByDataHash = async (dataHash: string) => {
    try {
      const wallpaper = await db.favoriteWallpapers.where('dataHash').equals(dataHash).first()
      if (wallpaper) {
        await deleteFavoriteWallpaper(wallpaper.id)
      }
    } catch (error) {
      console.error('删除收藏失败:', error)
      throw error
    }
  }

  // 清空所有收藏壁纸
  const clearAllFavoriteWallpapers = async () => {
    try {
      // 释放所有blob URL
      favoriteWallpapers.value.forEach((wallpaper) => {
        if (wallpaper.blobUrl) {
          revokeBlobUrl(wallpaper.blobUrl)
        }
      })

      await db.favoriteWallpapers.clear()
      favoriteWallpapers.value = []
    } catch (error) {
      console.error('清空收藏壁纸失败:', error)
      throw error
    }
  }

  // 获取壁纸显示名称
  const getFavoriteWallpaperDisplayName = (wallpaper: FavoriteWallpaper): string => {
    if (wallpaper.name) {
      return wallpaper.name
    }

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
      return wallpaper.source === 'local' ? '本地图片' : '云端图片'
    }
  }

  return {
    // 状态
    favoriteWallpapers,
    isLoading,

    // 方法
    loadFavoriteWallpapers,
    addFavoriteWallpaper,
    deleteFavoriteWallpaper,
    deleteFavoriteByDataHash,
    isFavorite,
    clearAllFavoriteWallpapers,
    getFavoriteWallpaperDisplayName,
  }
}

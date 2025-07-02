import { ref, computed } from 'vue'
import Dexie, { type Table } from 'dexie'
import { v4 as uuidV4 } from 'uuid'
import type { LocalWallpaper } from '@/types/wallpaper'
import { toast } from '@/lib/toast'
import { fileToBlob, createBlobUrl, revokeBlobUrl } from '@/lib/utils'

// 数据库类
class LocalWallpaperDB extends Dexie {
  wallpapers!: Table<LocalWallpaper>

  constructor() {
    super('LocalWallpaperDB')
    this.version(1).stores({
      wallpapers: 'id, name, blob, size, type, createdAt',
    })

    // 数据库结构如果升级，则清空旧数据
    this.version(1).upgrade(async (tx) => {
      await tx.table('wallpapers').clear()
    })
  }
}

// 创建数据库实例
const db = new LocalWallpaperDB()

// 壁纸数据
const wallpapers = ref<LocalWallpaper[]>([])
const isLoading = ref(false)

export function useLocalWallpaper() {
  // 加载所有本地壁纸
  const loadWallpapers = async () => {
    try {
      isLoading.value = true
      const data = await db.wallpapers.orderBy('createdAt').reverse().toArray()

      // 为每个壁纸创建blob URL用于显示
      wallpapers.value = data.map((wallpaper) => ({
        ...wallpaper,
        blobUrl: createBlobUrl(wallpaper.blob),
      }))
    } catch (error) {
      console.error('加载本地壁纸失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 添加本地壁纸
  const addWallpaper = async (file: File): Promise<LocalWallpaper | null> => {
    try {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件')
      }

      // 检查文件大小 (限制为10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('图片文件大小不能超过10MB')
      }

      // 转换为blob
      const blob = fileToBlob(file)

      const wallpaper: LocalWallpaper = {
        id: uuidV4(),
        name: file.name,
        blob,
        size: file.size,
        type: file.type,
        createdAt: Date.now(),
        blobUrl: createBlobUrl(blob),
      }

      // 保存到数据库
      await db.wallpapers.add(wallpaper)

      // 更新本地列表
      wallpapers.value.unshift(wallpaper)

      return wallpaper
    } catch (error) {
      console.error('添加本地壁纸失败:', error)
      throw error
    }
  }

  // 删除本地壁纸
  const deleteWallpaper = async (id: string) => {
    try {
      // 找到要删除的壁纸，释放其blob URL
      const wallpaper = wallpapers.value.find((w) => w.id === id)
      if (wallpaper?.blobUrl) {
        revokeBlobUrl(wallpaper.blobUrl)
      }

      await db.wallpapers.delete(id)
      wallpapers.value = wallpapers.value.filter((w) => w.id !== id)
    } catch (error) {
      console.error('删除本地壁纸失败:', error)
      throw error
    }
  }

  // 清空所有本地壁纸
  const clearAllWallpapers = async () => {
    try {
      // 释放所有blob URL
      wallpapers.value.forEach((wallpaper) => {
        if (wallpaper.blobUrl) {
          revokeBlobUrl(wallpaper.blobUrl)
        }
      })

      await db.wallpapers.clear()
      wallpapers.value = []
    } catch (error) {
      toast.error('清空本地壁纸失败')
      throw error
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 计算属性
  const wallpaperCount = computed(() => wallpapers.value.length)
  const totalSize = computed(() => {
    const total = wallpapers.value.reduce((sum, w) => sum + w.size, 0)
    return formatFileSize(total)
  })

  return {
    wallpapers: computed(() => wallpapers.value),
    isLoading: computed(() => isLoading.value),
    wallpaperCount,
    totalSize,

    loadWallpapers,
    addWallpaper,
    deleteWallpaper,
    clearAllWallpapers,
    formatFileSize,
  }
}

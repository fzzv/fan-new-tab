import { ref, computed } from 'vue'
import Dexie, { type Table } from 'dexie'
import { v4 as uuidV4 } from 'uuid'
import type { LocalWallpaper } from '@/types/wallpaper'
import { toast } from '@/lib/toast'

// 数据库类
class LocalWallpaperDB extends Dexie {
  wallpapers!: Table<LocalWallpaper>

  constructor() {
    super('LocalWallpaperDB')
    this.version(1).stores({
      wallpapers: 'id, name, base64, size, type, createdAt',
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
      wallpapers.value = data
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

      // 转换为base64
      const base64 = await fileToBase64(file)

      const wallpaper: LocalWallpaper = {
        id: uuidV4(),
        name: file.name,
        base64,
        size: file.size,
        type: file.type,
        createdAt: Date.now(),
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
      await db.wallpapers.clear()
      wallpapers.value = []
    } catch (error) {
      toast.error('清空本地壁纸失败')
      throw error
    }
  }

  // 文件转base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('文件读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
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

// 本地壁纸接口
export interface LocalWallpaper {
  id: string
  name: string
  /** 图片blob数据 */
  blob: Blob
  /** 文件大小 */
  size: number
  /** MIME类型 */
  type: string
  /** 创建时间 */
  createdAt: number
  /** 缓存的blob URL，用于显示 */
  blobUrl?: string
}

// 最近使用壁纸接口
export interface RecentWallpaper {
  id: string
  /** 壁纸数据：颜色值(string) 或 图片blob(Blob) */
  data: string | Blob
  /** 壁纸类型：color、blob */
  type: 'color' | 'blob'
  /** 使用时间戳 */
  usedAt: number
  /** 如果是URL转换的blob，这里存储原始URL */
  originalUrl?: string
  /** MIME类型，仅当type为blob时有效 */
  mimeType?: string
  /** 缓存的blob URL，用于显示 */
  blobUrl?: string
  /** 用于查重的哈希值 */
  dataHash?: string
}

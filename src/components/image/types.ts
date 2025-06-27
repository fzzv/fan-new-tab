export interface ImageProps {
  /** 图片地址 */
  src?: string
  /** 图片描述 */
  alt?: string
  /** 图片宽度 */
  width?: string | number
  /** 图片高度 */
  height?: string | number
  /** 是否懒加载 */
  lazy?: boolean
  /** 是否可预览 */
  preview?: boolean
  /** 预览时的图片地址，如果不设置则使用 src */
  previewSrc?: string
  /** 图片加载失败时的占位图 */
  fallbackSrc?: string
  /** 对象适应方式 */
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** 是否显示加载状态 */
  showToolbar?: boolean
  /** 是否显示工具栏 */
  showToolbarTooltip?: boolean
  /** 图片加载完成回调 */
  onLoad?: (e: Event) => void
  /** 图片加载失败回调 */
  onError?: (e: Event) => void
  /** 点击预览回调 */
  onPreview?: () => void
  /** img 元素的原生属性 */
  imgProps?: Record<string, any>
  /** 图片的样式 */
  imgClass?: string
}

export interface ImageGroupProps {
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示工具栏提示 */
  showToolbarTooltip?: boolean
  /** 预览上一张回调 */
  onPreviewPrev?: (current: number) => void
  /** 预览下一张回调 */
  onPreviewNext?: (current: number) => void
}

export interface ImagePreviewProps {
  /** 是否显示 */
  show?: boolean
  /** 图片列表 */
  src?: string | string[]
  /** 当前预览的图片索引 */
  current?: number
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示工具栏提示 */
  showToolbarTooltip?: boolean
  /** 关闭回调 */
  onClose?: () => void
  /** 切换图片回调 */
  onChange?: (current: number) => void
  /** 预览上一张回调 */
  onPrev?: (current: number) => void
  /** 预览下一张回调 */
  onNext?: (current: number) => void
}

export interface ImagePreviewAction {
  /** 缩放比例 */
  scale: number
  /** 旋转角度 */
  rotate: number
  /** 是否翻转 */
  flipHorizontal: boolean
  flipVertical: boolean
}

export interface ImagePreviewInst {
  /** 重置图片状态 */
  reset: () => void
  /** 放大 */
  zoomIn: () => void
  /** 缩小 */
  zoomOut: () => void
  /** 旋转 */
  rotateClockwise: () => void
  /** 逆时针旋转 */
  rotateCounterclockwise: () => void
  /** 水平翻转 */
  flipHorizontal: () => void
  /** 垂直翻转 */
  flipVertical: () => void
  /** 上一张 */
  prev: () => void
  /** 下一张 */
  next: () => void
  /** 关闭预览 */
  close: () => void
}

export type ImageStatus = 'pending' | 'loading' | 'loaded' | 'error'

export interface ImageContext {
  /** 注册图片 */
  register: (src: string, previewSrc?: string) => number
  /** 取消注册图片 */
  unregister: (index: number) => void
  /** 预览图片 */
  preview: (index: number) => void
  /** 图片列表 */
  images: Array<{ src: string; previewSrc?: string }>
  /** 当前预览索引 */
  currentIndex: number
  /** 是否显示预览 */
  showPreview: boolean
  /** 预览配置 */
  previewOptions: Omit<ImagePreviewProps, 'show' | 'src' | 'current'>
}

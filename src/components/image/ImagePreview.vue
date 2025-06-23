<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { PreviewType } from './Image.vue'

export interface ImagePreviewProps {
  visible: boolean
  src: string
  alt?: string
  config?: PreviewType
}

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  alt: '',
  config: () => ({}),
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
  transform: [{ transform: TransformType; action: TransformAction }]
}>()

// 变换类型定义
interface TransformType {
  x: number
  y: number
  rotate: number
  scale: number
  flipX: boolean
  flipY: boolean
}

type TransformAction =
  | 'flipY'
  | 'flipX'
  | 'rotateLeft'
  | 'rotateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'close'
  | 'wheel'
  | 'doubleClick'
  | 'move'
  | 'reset'

// 状态管理
const imageRef = ref<HTMLImageElement>()
const containerRef = ref<HTMLDivElement>()
const transform = ref<TransformType>({
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  flipX: false,
  flipY: false,
})
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 计算属性
const zIndex = computed(() => props.config?.zIndex || 3000)
const maskClosable = computed(() => props.config?.maskClosable !== false)
const scaleStep = computed(() => props.config?.scaleStep || 0.5)
const minScale = computed(() => props.config?.minScale || 0.25)
const maxScale = computed(() => props.config?.maxScale || 50)
const movable = computed(() => props.config?.movable !== false)

const imageStyle = computed(() => {
  const { x, y, rotate, scale, flipX, flipY } = transform.value
  const transforms = [
    `translate(${x}px, ${y}px)`,
    `scale(${flipX ? -scale : scale}, ${flipY ? -scale : scale})`,
    `rotate(${rotate}deg)`,
  ]

  return {
    transform: transforms.join(' '),
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
  }
})

// 方法
const emitTransform = (action: TransformAction) => {
  emit('transform', { transform: transform.value, action })
}

const close = () => {
  emitTransform('close')
  emit('update:visible', false)
  emit('close')
}

const handleMaskClick = (event: MouseEvent) => {
  if (maskClosable.value && event.target === event.currentTarget) {
    close()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      event.preventDefault()
      rotateLeft()
      break
    case 'ArrowRight':
      event.preventDefault()
      rotateRight()
      break
    case 'ArrowUp':
      event.preventDefault()
      zoomIn()
      break
    case 'ArrowDown':
      event.preventDefault()
      zoomOut()
      break
    case 'r':
    case 'R':
      event.preventDefault()
      resetTransform()
      break
  }
}

const resetTransform = () => {
  transform.value = {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    flipX: false,
    flipY: false,
  }
  emitTransform('reset')
}

const zoomIn = () => {
  const oldScale = transform.value.scale
  const newScale = Math.min(transform.value.scale * (1 + scaleStep.value), maxScale.value)

  // 按中心缩放：保持图片中心点位置不变
  if (oldScale !== newScale) {
    const scaleRatio = newScale / oldScale
    transform.value.x = transform.value.x * scaleRatio
    transform.value.y = transform.value.y * scaleRatio
    transform.value.scale = newScale
  }

  emitTransform('zoomIn')
}

const zoomOut = () => {
  const oldScale = transform.value.scale
  const newScale = Math.max(transform.value.scale / (1 + scaleStep.value), minScale.value)

  // 按中心缩放：保持图片中心点位置不变
  if (oldScale !== newScale) {
    const scaleRatio = newScale / oldScale
    transform.value.x = transform.value.x * scaleRatio
    transform.value.y = transform.value.y * scaleRatio
    transform.value.scale = newScale
  }

  emitTransform('zoomOut')
}

const rotateLeft = () => {
  transform.value.rotate -= 90
  emitTransform('rotateLeft')
}

const rotateRight = () => {
  transform.value.rotate += 90
  emitTransform('rotateRight')
}

const flipX = () => {
  transform.value.flipX = !transform.value.flipX
  emitTransform('flipX')
}

const flipY = () => {
  transform.value.flipY = !transform.value.flipY
  emitTransform('flipY')
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const oldScale = transform.value.scale
  let newScale: number

  if (event.deltaY < 0) {
    newScale = Math.min(transform.value.scale * (1 + scaleStep.value), maxScale.value)
  } else {
    newScale = Math.max(transform.value.scale / (1 + scaleStep.value), minScale.value)
  }

  // 按鼠标位置缩放
  if (oldScale !== newScale && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // 计算鼠标相对于容器中心的偏移
    const mouseX = event.clientX - rect.left - centerX
    const mouseY = event.clientY - rect.top - centerY

    // 计算缩放比例
    const scaleRatio = newScale / oldScale

    // 调整位置以实现以鼠标位置为中心的缩放
    transform.value.x = (transform.value.x - mouseX) * scaleRatio + mouseX
    transform.value.y = (transform.value.y - mouseY) * scaleRatio + mouseY
    transform.value.scale = newScale
  }

  emitTransform('wheel')
}

const handleDoubleClick = (event: MouseEvent) => {
  const oldScale = transform.value.scale
  let newScale: number

  if (transform.value.scale === 1) {
    newScale = 2
  } else {
    // 重置到初始状态
    resetTransform()
    emitTransform('doubleClick')
    return
  }

  // 按双击位置缩放
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // 计算双击位置相对于容器中心的偏移
    const clickX = event.clientX - rect.left - centerX
    const clickY = event.clientY - rect.top - centerY

    // 计算缩放比例
    const scaleRatio = newScale / oldScale

    // 调整位置以实现以双击位置为中心的缩放
    transform.value.x = (transform.value.x - clickX) * scaleRatio + clickX
    transform.value.y = (transform.value.y - clickY) * scaleRatio + clickY
    transform.value.scale = newScale
  }

  emitTransform('doubleClick')
}

// 拖拽功能
const handleMouseDown = (event: MouseEvent) => {
  if (!movable.value || event.button !== 0) return

  isDragging.value = true
  dragStart.value = {
    x: event.clientX - transform.value.x,
    y: event.clientY - transform.value.y,
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && movable.value) {
    transform.value.x = event.clientX - dragStart.value.x
    transform.value.y = event.clientY - dragStart.value.y
    emitTransform('move')
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 下载功能
const downloadImage = () => {
  const link = document.createElement('a')
  link.href = props.src
  link.download = props.alt || 'image'
  link.click()
}

// 监听 visible 变化
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetTransform()
      nextTick(() => {
        document.addEventListener('keydown', handleKeydown)
        document.body.style.overflow = 'hidden'
        // 聚焦到容器以便键盘导航
        containerRef.value?.focus()
      })
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
      // 清理拖拽事件
      if (isDragging.value) {
        handleMouseUp()
      }
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="image-preview" @enter="resetTransform" @leave="resetTransform">
      <div
        v-if="visible"
        ref="containerRef"
        :class="cn('fixed inset-0 flex items-center justify-center', 'bg-black bg-opacity-80 backdrop-blur-sm')"
        :style="{ zIndex }"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="`Preview of ${alt || 'image'}`"
        @click="handleMaskClick"
        @wheel="handleWheel"
      >
        <!-- 自定义计数器插槽 -->
        <slot name="counter" />

        <!-- 工具栏 -->
        <div
          :class="cn('absolute top-4 right-4 z-10', 'flex items-center gap-1', 'bg-black bg-opacity-50 rounded-lg p-2')"
          role="toolbar"
          aria-label="Image preview controls"
        >
          <!-- 自定义工具栏插槽 -->
          <slot name="toolbar" />

          <!-- 分隔符 -->
          <div v-if="$slots.toolbar" class="w-px h-4 bg-white bg-opacity-20 mx-1" />
          <!-- 缩小 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
                { 'opacity-50 cursor-not-allowed': transform.scale <= minScale },
              )
            "
            :disabled="transform.scale <= minScale"
            @click="zoomOut"
            title="缩小 (↓)"
            aria-label="Zoom out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>

          <!-- 放大 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
                { 'opacity-50 cursor-not-allowed': transform.scale >= maxScale },
              )
            "
            :disabled="transform.scale >= maxScale"
            @click="zoomIn"
            title="放大 (↑)"
            aria-label="Zoom in"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>

          <!-- 左旋转 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="rotateLeft"
            title="左旋转 (←)"
            aria-label="Rotate left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13h-2.02c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"
              />
            </svg>
          </button>

          <!-- 右旋转 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="rotateRight"
            title="右旋转 (→)"
            aria-label="Rotate right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"
              />
            </svg>
          </button>

          <!-- 水平翻转 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
                { 'bg-white bg-opacity-20': transform.flipX },
              )
            "
            @click="flipX"
            title="水平翻转"
            aria-label="Flip horizontally"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2zm16-2v2h2c0-1.1-.9-2-2-2zm-8 2h2V3h-2v2zm4 0h2V3h-2v2zm0 16h2v-2h-2v2zm-4 0h2v-2h-2v2zm4-8h2v-2h-2v2zm0-4h2V7h-2v2zm0 8h2v-2h-2v2z"
              />
            </svg>
          </button>

          <!-- 垂直翻转 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
                { 'bg-white bg-opacity-20': transform.flipY },
              )
            "
            @click="flipY"
            title="垂直翻转"
            aria-label="Flip vertically"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M16 17.01V10h-2v7.01h-1L15 19l2-1.99h-1zM9 3L7 4.99h1V12h2V4.99h1L9 3zm4 2h2V3h-2v2zm0 16h2v-2h-2v2zm-4 0h2v-2H9v2zM5 3v2h2V3H5zm0 16h2v-2H5v2zm-2-8h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2z"
              />
            </svg>
          </button>

          <!-- 下载 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="downloadImage"
            title="下载"
            aria-label="Download image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </button>

          <!-- 重置 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="resetTransform"
            title="重置 (R)"
            aria-label="Reset transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
              />
            </svg>
          </button>

          <!-- 关闭 -->
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="close"
            title="关闭 (ESC)"
            aria-label="Close preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>

        <!-- 图片容器 -->
        <div class="relative max-w-full max-h-full">
          <img
            ref="imageRef"
            :src="src"
            :alt="alt"
            :class="
              cn('max-w-none max-h-none select-none', {
                'cursor-move': movable && !isDragging,
                'cursor-grabbing': isDragging,
                'cursor-default': !movable,
              })
            "
            :style="imageStyle"
            @mousedown="handleMouseDown"
            @dblclick="handleDoubleClick"
            @dragstart.prevent
          />
        </div>

        <!-- 信息显示 -->
        <div
          :class="
            cn(
              'absolute bottom-4 left-1/2 transform -translate-x-1/2',
              'bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm',
              'flex items-center gap-2',
            )
          "
        >
          <span>{{ Math.round(transform.scale * 100) }}%</span>
          <span v-if="transform.rotate !== 0">{{ transform.rotate }}°</span>
          <span v-if="transform.flipX || transform.flipY" class="text-xs">
            {{ transform.flipX ? 'H' : '' }}{{ transform.flipY ? 'V' : '' }}
          </span>
        </div>

        <!-- 键盘提示 -->
        <div
          :class="
            cn(
              'absolute bottom-4 right-4',
              'bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs',
              'opacity-50 hover:opacity-100 transition-opacity',
            )
          "
        >
          ESC: 关闭 | R: 重置 | ↑↓: 缩放 | ←→: 旋转
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.image-preview-enter-active,
.image-preview-leave-active {
  transition: opacity 0.3s ease;
}

.image-preview-enter-from,
.image-preview-leave-to {
  opacity: 0;
}

.image-preview-enter-to,
.image-preview-leave-from {
  opacity: 1;
}
</style>

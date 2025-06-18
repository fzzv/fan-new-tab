<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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
}>()

// 状态管理
const imageRef = ref<HTMLImageElement>()
const containerRef = ref<HTMLDivElement>()
const scale = ref(1)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 计算属性
const zIndex = computed(() => props.config?.zIndex || 1000)
const maskClosable = computed(() => props.config?.maskClosable !== false)

const imageStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease',
}))

// 方法
const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleMaskClick = (event: MouseEvent) => {
  if (maskClosable.value && event.target === event.currentTarget) {
    close()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
}

const resetTransform = () => {
  scale.value = 1
  position.value = { x: 0, y: 0 }
}

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 3)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.5)
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 拖拽功能
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    // 左键
    isDragging.value = true
    dragStart.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y,
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    position.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y,
    }
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
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
        @click="handleMaskClick"
        @wheel="handleWheel"
      >
        <!-- 工具栏 -->
        <div
          :class="cn('absolute top-4 right-4 z-10', 'flex items-center gap-2', 'bg-black bg-opacity-50 rounded-lg p-2')"
        >
          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="zoomOut"
            title="缩小"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>

          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="zoomIn"
            title="放大"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>

          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="resetTransform"
            title="重置"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
              />
            </svg>
          </button>

          <button
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
              )
            "
            @click="close"
            title="关闭"
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
            :class="cn('max-w-none max-h-none cursor-move select-none', { 'cursor-grabbing': isDragging })"
            :style="imageStyle"
            @mousedown="handleMouseDown"
            @dragstart.prevent
          />
        </div>

        <!-- 缩放比例显示 -->
        <div
          :class="
            cn(
              'absolute bottom-4 left-1/2 transform -translate-x-1/2',
              'bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm',
            )
          "
        >
          {{ Math.round(scale * 100) }}%
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

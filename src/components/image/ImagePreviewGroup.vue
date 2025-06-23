<script setup lang="ts">
import { ref, computed, watch, provide, nextTick } from 'vue'
import { cn } from '@/lib/utils'
import ImagePreview from './ImagePreview.vue'
import type { PreviewType } from './Image.vue'

export interface ImageItem {
  src: string
  alt?: string
  crossOrigin?: string
  [key: string]: any
}

export interface ImagePreviewGroupProps {
  preview?: boolean | PreviewGroupType
  items?: string[] | ImageItem[]
  fallback?: string
}

export interface PreviewGroupType extends PreviewType {
  current?: number
  countRender?: (current: number, total: number) => string
  onChange?: (current: number, prevCurrent: number) => void
}

const props = withDefaults(defineProps<ImagePreviewGroupProps>(), {
  preview: true,
  items: () => [],
  fallback: undefined,
})

const emit = defineEmits<{
  change: [current: number, prevCurrent: number]
  visibleChange: [visible: boolean, prevVisible: boolean, current: number]
}>()

// 状态管理
const showPreview = ref(false)
const currentIndex = ref(0)
const images = ref<ImageItem[]>([])

// 注册图片
const registerImage = (src: string, alt?: string) => {
  const index = images.value.findIndex((img) => img.src === src)
  if (index === -1) {
    images.value.push({ src, alt })
    return images.value.length - 1
  }
  return index
}

// 取消注册图片
const unregisterImage = (src: string) => {
  const index = images.value.findIndex((img) => img.src === src)
  if (index !== -1) {
    images.value.splice(index, 1)
  }
}

// 显示预览
const showImagePreview = (src: string) => {
  const index = images.value.findIndex((img) => img.src === src)
  if (index !== -1) {
    currentIndex.value = index
    showPreview.value = true
  }
}

// 提供给子组件的方法
provide('imagePreviewGroup', {
  registerImage,
  unregisterImage,
  showImagePreview,
  isPreviewEnabled: computed(() => {
    if (typeof props.preview === 'boolean') {
      return props.preview
    }
    return true
  }),
})

// 计算属性
const previewConfig = computed<PreviewGroupType>(() => {
  const defaultValues = {
    visible: undefined,
    onVisibleChange: () => {},
    getContainer: undefined,
    maskClosable: true,
    zIndex: 1000,
    scaleStep: 0.5,
    minScale: 0.25,
    maxScale: 50,
    movable: true,
    destroyOnClose: false,
    closeIcon: undefined,
    forceRender: false,
    current: currentIndex.value,
    countRender: (current: number, total: number) => `${current + 1} / ${total}`,
    onChange: () => {},
  }
  return typeof props.preview === 'object' ? { ...defaultValues, ...props.preview } : defaultValues
})

const currentImage = computed(() => {
  return images.value[currentIndex.value]
})

const totalImages = computed(() => images.value.length)

// 导航方法
const goToPrev = () => {
  if (currentIndex.value > 0) {
    const prevIndex = currentIndex.value
    currentIndex.value--
    emit('change', currentIndex.value, prevIndex)
    previewConfig.value.onChange?.(currentIndex.value, prevIndex)
  }
}

const goToNext = () => {
  if (currentIndex.value < totalImages.value - 1) {
    const prevIndex = currentIndex.value
    currentIndex.value++
    emit('change', currentIndex.value, prevIndex)
    previewConfig.value.onChange?.(currentIndex.value, prevIndex)
  }
}

const goToIndex = (index: number) => {
  if (index >= 0 && index < totalImages.value && index !== currentIndex.value) {
    const prevIndex = currentIndex.value
    currentIndex.value = index
    emit('change', currentIndex.value, prevIndex)
    previewConfig.value.onChange?.(currentIndex.value, prevIndex)
  }
}

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      goToPrev()
      break
    case 'ArrowRight':
      event.preventDefault()
      goToNext()
      break
    case 'Home':
      event.preventDefault()
      goToIndex(0)
      break
    case 'End':
      event.preventDefault()
      goToIndex(totalImages.value - 1)
      break
  }
}

const handlePreviewClose = () => {
  const prevVisible = showPreview.value
  showPreview.value = false
  emit('visibleChange', false, prevVisible, currentIndex.value)
  previewConfig.value.onVisibleChange?.(false)
}

// 监听预览状态变化
watch(showPreview, (visible, prevVisible) => {
  if (visible) {
    nextTick(() => {
      document.addEventListener('keydown', handleKeydown)
    })
    emit('visibleChange', visible, prevVisible, currentIndex.value)
    previewConfig.value.onVisibleChange?.(visible)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 监听items变化
watch(
  () => props.items,
  (newItems) => {
    if (newItems && newItems.length > 0) {
      images.value = newItems.map((item) => (typeof item === 'string' ? { src: item } : item))
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <slot />

    <!-- 预览组件 -->
    <ImagePreview
      v-if="showPreview && currentImage"
      v-model:visible="showPreview"
      :src="currentImage.src"
      :alt="currentImage.alt"
      :config="previewConfig"
      @close="handlePreviewClose"
    >
      <!-- 自定义工具栏插槽，添加导航按钮 -->
      <template #toolbar>
        <div class="flex items-center gap-1">
          <!-- 上一张 -->
          <button
            v-if="totalImages > 1"
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
                { 'opacity-50 cursor-not-allowed': currentIndex <= 0 },
              )
            "
            :disabled="currentIndex <= 0"
            @click="goToPrev"
            title="上一张 (←)"
            aria-label="Previous image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          <!-- 下一张 -->
          <button
            v-if="totalImages > 1"
            :class="
              cn(
                'w-8 h-8 flex items-center justify-center',
                'text-white hover:bg-white hover:bg-opacity-20',
                'rounded transition-colors',
                { 'opacity-50 cursor-not-allowed': currentIndex >= totalImages - 1 },
              )
            "
            :disabled="currentIndex >= totalImages - 1"
            @click="goToNext"
            title="下一张 (→)"
            aria-label="Next image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </template>

      <!-- 图片计数显示 -->
      <template #counter>
        <div
          v-if="totalImages > 1"
          :class="cn('absolute top-4 left-4', 'bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm')"
        >
          {{ previewConfig.countRender?.(currentIndex, totalImages) }}
        </div>
      </template>
    </ImagePreview>
  </div>
</template>

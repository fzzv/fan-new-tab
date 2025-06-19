<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
import ImagePreview from './ImagePreview.vue'
import PageNotFound from '@/assets/page-not-found.png'

export interface ImageProps {
  src: string
  alt?: string
  fallback?: string
  width?: string | number
  height?: string | number
  placeholder?: boolean
  preview?: boolean | PreviewType
  previewMask?: boolean | (() => string)
}

export interface PreviewType {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  getContainer?: () => HTMLElement
  mask?: boolean | (() => string)
  maskClosable?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<ImageProps>(), {
  alt: '',
  fallback: PageNotFound,
  placeholder: true,
  preview: true,
  previewMask: true,
})

// 图片地址
const { src: imgSrc } = props

const emits = defineEmits<{
  error: [event: Event]
  click: [event: Event]
  preview: [event: Event]
}>()

// 状态管理
const ImageStatus = {
  NORMAL: 'normal',
  ERROR: 'error',
  LOADING: 'loading',
} as const

type ImageStatusType = (typeof ImageStatus)[keyof typeof ImageStatus]
const status = ref<ImageStatusType>(props.placeholder ? ImageStatus.LOADING : ImageStatus.NORMAL)
const showPreview = ref(false)

const imageStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})

const isPreviewEnabled = computed(() => {
  if (typeof props.preview === 'boolean') {
    return props.preview
  }
  return true
})

const previewConfig = computed(() => {
  if (typeof props.preview === 'object') {
    return props.preview
  }
  return {}
})

const isError = computed(() => status.value === ImageStatus.ERROR)
const isLoading = computed(() => status.value === ImageStatus.LOADING)
const isNormal = computed(() => status.value === ImageStatus.NORMAL)

const img = ref<HTMLImageElement | null>(null)
watch(
  () => img.value,
  () => {
    if (status.value !== ImageStatus.LOADING) return
    if (img.value?.complete && (img.value.naturalWidth || img.value.naturalHeight)) {
      // 元素加载完成，设置状态为正常
      handleLoad()
    }
  },
)

// 监听 src 变化，重置状态
watch(
  () => props.src,
  () => {
    status.value = props.placeholder ? ImageStatus.LOADING : ImageStatus.NORMAL
  },
)

// 事件处理
const handleLoad = () => {
  status.value = ImageStatus.NORMAL
}

const handleError = (event: Event) => {
  status.value = ImageStatus.ERROR
  emits('error', event)
}

const handlePreview = (event: Event) => {
  if (isPreviewEnabled.value && status.value !== ImageStatus.ERROR) {
    showPreview.value = true
    previewConfig.value.onVisibleChange?.(true)
  }
  emits('preview', event)
}

const handleClick = (event: Event) => {
  emits('click', event)
}

const handlePreviewClose = () => {
  showPreview.value = false
  previewConfig.value.onVisibleChange?.(false)
}
</script>

<template>
  <div class="relative inline-block">
    <!-- 占位符 -->
    <div
      v-if="isLoading && placeholder"
      :class="
        cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          'animate-pulse rounded border border-border',
          $attrs.class as ClassValue,
        )
      "
      :style="imageStyle"
    >
      <slot name="placeholder">
        <div class="text-sm">{{ isError ? '加载备用图片...' : '加载中...' }}</div>
      </slot>
    </div>

    <!-- 图片 -->
    <img
      ref="img"
      :src="isError ? fallback : imgSrc"
      :alt="alt"
      :style="imageStyle"
      :class="
        cn(
          'block max-w-full h-auto transition-opacity duration-200',
          {
            'cursor-pointer': isPreviewEnabled && !isError,
            'opacity-0': isLoading && placeholder,
            'opacity-100': !isLoading || !placeholder,
          },
          $attrs.class as ClassValue,
        )
      "
      @load="!isError && handleLoad"
      @error="handleError"
      @click="handleClick"
      v-bind="$attrs"
    />

    <!-- 预览遮罩 -->
    <div
      v-if="isPreviewEnabled && isNormal"
      :class="
        cn(
          'w-full h-full absolute inset-0 flex items-center justify-center',
          'bg-transparent hover:bg-black/50 cursor-pointer',
          'opacity-0 hover:opacity-100 transition-all duration-200',
        )
      "
    >
      <slot name="previewMask">
        <div v-if="previewMask !== false" class="text-white text-sm font-medium" @click="handlePreview">
          {{ typeof previewMask === 'function' ? previewMask() : '点击预览' }}
        </div>
      </slot>
    </div>

    <!-- 图片预览 -->
    <ImagePreview
      v-if="isPreviewEnabled"
      v-model:visible="showPreview"
      :src="props.src"
      :alt="alt"
      :config="previewConfig"
      @close="handlePreviewClose"
    />
  </div>
</template>

<style scoped>
/* 确保图片在容器中正确显示 */
img {
  vertical-align: middle;
}
</style>

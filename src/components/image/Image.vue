<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import isNumber from 'lodash-es/isNumber'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
import ImagePreview from './ImagePreview.vue'

export interface ImageProps {
  src: string
  alt?: string
  fallback?: string
  width?: string | number
  height?: string | number
  placeholder?: boolean | string
  preview?: boolean | PreviewType
  previewMask?: boolean | (() => string)
  lazy?: boolean
  crossOrigin?: 'anonymous' | 'use-credentials'
  decoding?: 'async' | 'auto' | 'sync'
  loading?: 'eager' | 'lazy'
  referrerPolicy?: string
  sizes?: string
  srcSet?: string
}

type GetContainer = string | HTMLElement | (() => HTMLElement)

export interface PreviewType {
  src?: string
  visible?: boolean
  onVisibleChange?: (value: boolean) => void
  getContainer?: GetContainer | false
  mask?: boolean | (() => string)
  maskClosable?: boolean
  zIndex?: number
  scaleStep?: number
  minScale?: number
  maxScale?: number
  movable?: boolean
  destroyOnClose?: boolean
  closeIcon?: string
  forceRender?: boolean
}

const props = withDefaults(defineProps<ImageProps>(), {
  alt: '',
  width: '',
  height: '',
  placeholder: true,
  preview: true,
  previewMask: true,
  lazy: false,
  crossOrigin: undefined,
  decoding: 'auto',
  loading: 'lazy',
  referrerPolicy: undefined,
  sizes: undefined,
  srcSet: undefined,
})

const emits = defineEmits<{
  error: [event: Event]
  load: [event: Event]
  click: [event: Event]
  preview: [event: Event]
}>()

// 合并默认值
const mergeDefaultValue = <T extends object>(obj: T, defaultValues: object): T => {
  const res = { ...obj }
  Object.keys(defaultValues).forEach((key) => {
    if (obj[key] === undefined) {
      res[key] = defaultValues[key]
    }
  })
  return res
}

// 合并 preview 的配置
const previewConfig = computed<PreviewType>(() => {
  const defaultValues = {
    visible: undefined,
    onVisibleChange: () => {},
    getContainer: undefined,
    maskClosable: true,
    zIndex: 3000,
    scaleStep: 0.5,
    minScale: 0.25,
    maxScale: 50,
    movable: true,
    destroyOnClose: false,
    closeIcon: undefined,
    forceRender: false,
  }
  return typeof props.preview === 'object' ? mergeDefaultValue(props.preview, defaultValues) : defaultValues
})

// 状态管理
const ImageStatus = {
  NORMAL: 'normal',
  ERROR: 'error',
  LOADING: 'loading',
} as const

type ImageStatusType = (typeof ImageStatus)[keyof typeof ImageStatus]
const showPreview = ref(false)

// 注入PreviewGroup上下文
const previewGroup = inject<{
  registerImage: (src: string, alt?: string) => number
  unregisterImage: (src: string) => void
  showImagePreview: (src: string) => void
  isPreviewEnabled: any
}>('imagePreviewGroup', null)

const toSizePx = (l: number | string) => (isNumber(l) ? l + 'px' : l)
const isPreviewEnabled = computed(() => {
  if (previewGroup) {
    return previewGroup.isPreviewEnabled.value
  }
  if (typeof props.preview === 'boolean') {
    return props.preview
  }
  return true
})

const status = ref<ImageStatusType>(props.placeholder ? ImageStatus.LOADING : ImageStatus.NORMAL)
const intersectionObserver = ref<IntersectionObserver | null>(null)
const isIntersecting = ref(false)

// 监听 src 变化，重置状态
watch(
  () => props.src,
  () => {
    status.value = props.placeholder ? ImageStatus.LOADING : ImageStatus.NORMAL
  },
)

const isError = computed(() => status.value === ImageStatus.ERROR)
const isLoading = computed(() => status.value === ImageStatus.LOADING)
const isNormal = computed(() => status.value === ImageStatus.NORMAL)

// 事件处理
const handleLoad = (event: Event) => {
  status.value = ImageStatus.NORMAL
  emits('load', event)
}

const handleError = (event: Event) => {
  status.value = ImageStatus.ERROR
  emits('error', event)
}

const img = ref<HTMLImageElement | null>(null)
const imgContainer = ref<HTMLDivElement | null>(null)

// 懒加载逻辑
const setupLazyLoading = () => {
  if (!props.lazy || !imgContainer.value) return

  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isIntersecting.value = true
          intersectionObserver.value?.disconnect()
        }
      })
    },
    { threshold: 0.1 },
  )

  intersectionObserver.value.observe(imgContainer.value)
}

// 处理图片状态（判断是否已加载）
watch(
  () => img.value,
  () => {
    if (status.value !== ImageStatus.LOADING) return
    if (img.value?.complete && (img.value.naturalWidth || img.value.naturalHeight)) {
      // 元素加载完成，设置状态为正常
      handleLoad(new Event('load'))
    }
  },
)

// 生命周期
onMounted(() => {
  if (props.lazy) {
    setupLazyLoading()
  } else {
    isIntersecting.value = true
  }

  // 注册到PreviewGroup
  if (previewGroup) {
    previewGroup.registerImage(props.src, props.alt)
  }
})

onUnmounted(() => {
  intersectionObserver.value?.disconnect()

  // 从PreviewGroup取消注册
  if (previewGroup) {
    previewGroup.unregisterImage(props.src)
  }
})

const handlePreview = (event: Event) => {
  if (isPreviewEnabled.value && status.value !== ImageStatus.ERROR) {
    if (previewGroup) {
      // 如果在PreviewGroup中，使用组的预览功能
      previewGroup.showImagePreview(props.src)
    } else {
      // 独立预览
      showPreview.value = true
      previewConfig.value.onVisibleChange?.(true)
    }
  }
  emits('preview', event)
}

const handleClick = (event: Event) => {
  if (isPreviewEnabled.value && status.value !== ImageStatus.ERROR) {
    handlePreview(event)
  }
  emits('click', event)
}

const handlePreviewClose = () => {
  showPreview.value = false
  previewConfig.value.onVisibleChange?.(false)
}

// 计算实际显示的src
const actualSrc = computed(() => {
  if (isError.value && props.fallback) {
    return props.fallback
  }
  return props.src
})

// 是否应该显示图片
const shouldShowImage = computed(() => {
  return !props.lazy || isIntersecting.value
})

// 占位符内容
const placeholderContent = computed(() => {
  if (typeof props.placeholder === 'string') {
    return props.placeholder
  }
  return isError.value ? '加载失败' : '加载中...'
})
</script>

<template>
  <div ref="imgContainer" class="relative inline-block">
    <!-- 占位符 -->
    <div
      v-if="isLoading || !shouldShowImage"
      :class="
        cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          {
            'animate-pulse': isLoading,
          },
          $attrs.class as ClassValue,
        )
      "
      :style="{
        width: toSizePx(width),
        height: toSizePx(height),
      }"
      role="img"
      :aria-label="alt || 'Loading image'"
    >
      <slot name="placeholder">
        <div class="text-sm">{{ placeholderContent }}</div>
      </slot>
    </div>

    <!-- 图片 -->
    <img
      v-if="shouldShowImage"
      ref="img"
      :src="actualSrc"
      :alt="alt"
      :crossorigin="crossOrigin"
      :decoding="decoding"
      :loading="loading"
      :referrerpolicy="referrerPolicy"
      :sizes="sizes"
      :srcset="srcSet"
      :class="
        cn(
          'block max-w-full h-auto transition-opacity duration-200',
          {
            'cursor-pointer': isPreviewEnabled && !isError,
            'opacity-0': isLoading,
            'opacity-100': !isLoading,
          },
          $attrs.class as ClassValue,
        )
      "
      :style="{
        width: toSizePx(width),
        height: toSizePx(height),
      }"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />

    <!-- 预览遮罩 -->
    <div
      v-if="isPreviewEnabled && isNormal && shouldShowImage"
      :class="
        cn(
          'w-full h-full absolute inset-0 flex items-center justify-center',
          'bg-transparent hover:bg-black/50 cursor-pointer',
          'opacity-0 hover:opacity-100 transition-all duration-200',
        )
      "
      role="button"
      tabindex="0"
      :aria-label="`Preview ${alt || 'image'}`"
      @click="handlePreview"
      @keydown.enter="handlePreview"
      @keydown.space.prevent="handlePreview"
    >
      <slot name="previewMask">
        <div v-if="previewMask !== false" class="text-white text-sm font-medium">
          {{ typeof previewMask === 'function' ? previewMask() : '点击预览' }}
        </div>
      </slot>
    </div>

    <!-- 图片预览 (仅在非PreviewGroup模式下显示) -->
    <ImagePreview
      v-if="isPreviewEnabled && !previewGroup"
      v-model:visible="showPreview"
      :src="previewConfig.src || props.src"
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

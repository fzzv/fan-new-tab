<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import type { ImageProps, ImageStatus, ImageContext } from './types'
import { cn } from '@/lib/utils'
import ImagePreview from './ImagePreview.vue'

const props = withDefaults(defineProps<ImageProps>(), {
  lazy: false,
  preview: false,
  objectFit: 'cover',
  showToolbar: true,
  showToolbarTooltip: true,
})

const emit = defineEmits<{
  load: [e: Event]
  error: [e: Event]
  preview: []
}>()

const imageRef = ref<HTMLImageElement>()
const status = ref<ImageStatus>('pending')
const currentSrc = ref('')
const imageGroupContext = inject<ImageContext>('imageGroup', null)
const imageIndex = ref(-1)
const showPreview = ref(false)

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const imageStyle = computed(() => ({
  objectFit: props.objectFit,
}))

// 图片加载
function loadImage() {
  if (!props.src) return

  status.value = 'loading'
  currentSrc.value = props.src

  const img = new Image()
  img.onload = () => {
    status.value = 'loaded'
    emit('load', new Event('load'))
  }
  img.onerror = () => {
    if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
      currentSrc.value = props.fallbackSrc
      img.src = props.fallbackSrc
    } else {
      status.value = 'error'
      emit('error', new Event('error'))
    }
  }
  img.src = props.src
}

// 事件处理
function handleLoad(e: Event) {
  emit('load', e)
}

function handleError(e: Event) {
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc
  } else {
    status.value = 'error'
    emit('error', e)
  }
}

function handleClick() {
  if (props.preview) {
    emit('preview')
    if (imageGroupContext) {
      imageGroupContext.preview(imageIndex.value)
    } else {
      // 如果不在图片组中，直接显示预览
      showPreview.value = true
    }
  }
}

// 生命周期
onMounted(() => {
  if (imageGroupContext) {
    imageIndex.value = imageGroupContext.register(props.src || '', props.previewSrc)
  }

  if (props.src) {
    if (props.lazy) {
      // 简单的懒加载实现
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadImage()
          observer.disconnect()
        }
      })
      if (imageRef.value?.parentElement) {
        observer.observe(imageRef.value.parentElement)
      }
    } else {
      loadImage()
    }
  }
})

// 监听 src 变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc) {
      loadImage()
    } else {
      status.value = 'pending'
      currentSrc.value = ''
    }
  },
)
</script>

<template>
  <div class="relative" :style="containerStyle">
    <!-- 加载状态 -->
    <div
      v-if="status === 'loading'"
      :class="
        cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm w-full h-full',
          'border border-dashed border-border rounded',
        )
      "
    >
      <div class="text-muted-foreground">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
          <path
            d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="0.75s"
              values="0 12 12;360 12 12"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="status === 'error'"
      :class="
        cn(
          'flex flex-col items-center justify-center bg-muted text-muted-foreground text-sm w-full h-full',
          'border border-border rounded',
        )
      "
    >
      <div class="text-2xl mb-2 text-muted-foreground">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M21,5V19a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5A2,2,0,0,1,5,3H19A2,2,0,0,1,21,5ZM5,5V19H19V5ZM15.5,9.5L13,12l2.5,2.5L14,16l-2-2-2,2L8.5,14.5,11,12,8.5,9.5,10,8l2,2,2-2Z"
          />
        </svg>
      </div>
      <span class="text-sm text-muted-foreground">加载失败</span>
    </div>

    <!-- 图片 -->
    <img
      v-else-if="status === 'loaded'"
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :style="imageStyle"
      :class="
        cn('w-full h-full block transition-opacity duration-300', props.preview && 'cursor-pointer hover:opacity-90')
      "
      v-bind="imgProps"
      @click="handleClick"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- 占位符 -->
    <div
      v-else
      :class="
        cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm w-full h-full',
          'border border-dashed border-border rounded',
        )
      "
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-muted-foreground">
        <path
          d="M21,19V5c0-1.1-0.9-2-2-2H5c-1.1,0-2,0.9-2,2v14c0,1.1,0.9,2,2,2h14C20.1,21,21,20.1,21,19z M8.5,13.5l2.5,3.01 L14.5,12l4.5,6H5L8.5,13.5z"
        />
      </svg>
    </div>

    <!-- 内置图片预览 -->
    <ImagePreview
      v-if="preview && !imageGroupContext"
      v-model:show="showPreview"
      :src="previewSrc || currentSrc"
      :show-toolbar="showToolbar"
      :show-toolbar-tooltip="showToolbarTooltip"
      @close="showPreview = false"
    />
  </div>
</template>

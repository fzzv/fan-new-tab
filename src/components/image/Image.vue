<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import type { ImageProps, ImageStatus, ImageContext } from './types'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/vue'
import ImagePreview from './ImagePreview.vue'
import type { ClassValue } from 'clsx'

const props = withDefaults(defineProps<ImageProps>(), {
  lazy: false,
  preview: false,
  objectFit: 'cover',
  showToolbar: true,
  showToolbarTooltip: true,
  showMask: false,
  maskBackground: 'rgba(0, 0, 0, 0.5)',
  imgClass: '',
})

const emit = defineEmits<{
  load: [e: Event]
  error: [e: Event]
  preview: []
}>()

const imageRef = ref<HTMLImageElement>()
const status = ref<ImageStatus>('pending')
const currentSrc = ref('')
const imageGroupContext = inject<ImageContext | null>('imageGroup', null)
const imageIndex = ref(-1)
const showPreview = ref(false)
const isHovered = ref(false)

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
  <div :class="cn('relative', $attrs.class as ClassValue)" :style="containerStyle">
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
        <Icon icon="eos-icons:three-dots-loading" width="32" height="32" />
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
        <Icon icon="material-symbols:broken-image-outline-rounded" width="32" height="32" />
      </div>
      <span class="text-sm text-muted-foreground">加载失败</span>
    </div>

    <!-- 图片容器 -->
    <div
      v-else-if="status === 'loaded'"
      class="relative w-full h-full group"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- 图片 -->
      <img
        ref="imageRef"
        :src="currentSrc"
        :alt="alt"
        :style="imageStyle"
        :class="
          cn(
            'w-full h-full block transition-opacity duration-300',
            props.preview && 'cursor-pointer',
            props.imgClass as ClassValue,
          )
        "
        v-bind="imgProps"
        @click="handleClick"
        @load="handleLoad"
        @error="handleError"
      />

      <!-- Mask 蒙层 -->
      <div
        v-if="showMask && isHovered"
        :class="cn('absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100')"
        :style="{
          background: props.maskBackground,
        }"
      >
        <!-- 自定义 mask 内容 -->
        <slot v-if="$slots.mask" name="mask" />

        <!-- 默认预览图标 -->
        <div
          v-else-if="preview"
          class="flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform duration-200"
          @click="handleClick"
        >
          <Icon icon="lucide:eye" width="24" height="24" />
        </div>
      </div>
    </div>

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
      <Icon icon="material-symbols:imagesmode-outline" width="32" height="32" />
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

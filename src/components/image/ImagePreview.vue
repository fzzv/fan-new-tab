<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { ImagePreviewProps, ImagePreviewAction, ImagePreviewInst } from './types'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/vue'

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  show: false,
  current: 0,
  showToolbar: true,
  showToolbarTooltip: true,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'update:current': [value: number]
  close: []
  change: [current: number]
  prev: [current: number]
  next: [current: number]
}>()

const imageRef = ref<HTMLImageElement>()
const action = ref<ImagePreviewAction>({
  scale: 1,
  rotate: 0,
  flipHorizontal: false,
  flipVertical: false,
})

const currentIndex = ref(props.current)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imagePosition = ref({ x: 0, y: 0 })

// 计算属性
const imageList = computed(() => {
  if (Array.isArray(props.src)) {
    return props.src
  }
  return props.src ? [props.src] : []
})

const currentImageSrc = computed(() => {
  return imageList.value[currentIndex.value] || ''
})

const imageStyle = computed(() => ({
  transform: `
    translate(${imagePosition.value.x}px, ${imagePosition.value.y}px)
    scale(${action.value.scale})
    rotate(${action.value.rotate}deg)
    scaleX(${action.value.flipHorizontal ? -1 : 1})
    scaleY(${action.value.flipVertical ? -1 : 1})
  `,
}))

const toolbarButtonClass = computed(() =>
  cn(
    'flex items-center justify-center w-8 h-8 bg-transparent border-none',
    'text-white cursor-pointer rounded transition-colors duration-200',
    'hover:bg-white/10 text-base',
  ),
)

const navButtonClass = computed(() =>
  cn(
    'absolute top-1/2 -translate-y-1/2 flex items-center justify-center',
    'w-12 h-12 bg-black/60 border-none text-white cursor-pointer rounded-full',
    'transition-colors duration-200 hover:bg-black/80 text-xl z-[3000]',
  ),
)

// 预览操作方法
function reset() {
  action.value = {
    scale: 1,
    rotate: 0,
    flipHorizontal: false,
    flipVertical: false,
  }
  imagePosition.value = { x: 0, y: 0 }
}

function zoomIn() {
  action.value.scale = Math.min(action.value.scale * 1.2, 5)
}

function zoomOut() {
  action.value.scale = Math.max(action.value.scale / 1.2, 0.1)
}

function rotateClockwise() {
  action.value.rotate += 90
}

function rotateCounterclockwise() {
  action.value.rotate -= 90
}

function flipHorizontal() {
  action.value.flipHorizontal = !action.value.flipHorizontal
}

function flipVertical() {
  action.value.flipVertical = !action.value.flipVertical
}

function prev() {
  if (imageList.value.length > 1) {
    const newIndex = currentIndex.value > 0 ? currentIndex.value - 1 : imageList.value.length - 1
    currentIndex.value = newIndex
    emit('update:current', newIndex)
    emit('change', newIndex)
    emit('prev', newIndex)
    reset()
  }
}

function next() {
  if (imageList.value.length > 1) {
    const newIndex = currentIndex.value < imageList.value.length - 1 ? currentIndex.value + 1 : 0
    currentIndex.value = newIndex
    emit('update:current', newIndex)
    emit('change', newIndex)
    emit('next', newIndex)
    reset()
  }
}

function close() {
  emit('update:show', false)
  emit('close')
}

// 事件处理
function handleOverlayClick() {
  close()
}

function handleClose() {
  close()
}

function handleImageLoad() {
  // 图片加载完成
}

function handleImageError() {
  // 图片加载失败
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

function handleMouseDown(e: MouseEvent) {
  if (e.button === 0) {
    // 左键
    isDragging.value = true
    dragStart.value = { x: e.clientX - imagePosition.value.x, y: e.clientY - imagePosition.value.y }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    imagePosition.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y,
    }
  }
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      reset()
      break
  }
}

// 监听器
watch(
  () => props.current,
  (newCurrent) => {
    currentIndex.value = newCurrent
    reset()
  },
)

const previewRef = ref<HTMLElement>()
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      reset()
      nextTick(() => {
        // 聚焦以便接收键盘事件
        previewRef.value?.focus()
      })
    }
  },
)

defineExpose<ImagePreviewInst>({
  reset,
  zoomIn,
  zoomOut,
  rotateClockwise,
  rotateCounterclockwise,
  flipHorizontal,
  flipVertical,
  prev,
  next,
  close,
})

onMounted(() => {
  currentIndex.value = props.current
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="image-preview" appear>
      <div
        v-if="show"
        ref="previewRef"
        :class="cn('fixed inset-0 bg-black/80 z-[3000] flex items-center justify-center outline-none')"
        @click="handleOverlayClick"
        @keydown="handleKeydown"
        tabindex="-1"
      >
        <!-- 关闭按钮 -->
        <button
          :class="
            cn(
              'absolute top-5 right-5 flex items-center justify-center w-10 h-10',
              'bg-black/60 border-none text-white cursor-pointer rounded-full z-[3000]',
              'transition-colors duration-200 hover:bg-black/80 text-xl cursor-pointer',
            )
          "
          @click="handleClose"
          title="关闭"
        >
          <Icon icon="material-symbols:close-small-outline-rounded" width="24" height="24" />
        </button>

        <!-- 图片计数器 -->
        <div
          v-if="imageList.length > 1"
          class="absolute top-5 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-2 rounded-2xl text-sm"
        >
          {{ currentIndex + 1 }} / {{ imageList.length }}
        </div>

        <!-- 主容器 -->
        <div class="relative w-full h-full flex items-center justify-center overflow-hidden" @click.stop>
          <!-- 上一张按钮 -->
          <button v-if="imageList.length > 1" :class="[navButtonClass, 'left-5']" @click.stop="prev" title="上一张(←)">
            <Icon icon="material-symbols:arrow-back-ios-new-rounded" width="24" height="24" />
          </button>

          <!-- 图片 -->
          <img
            ref="imageRef"
            :src="currentImageSrc"
            :class="
              cn(
                'max-w-[90%] max-h-[90%] object-contain transition-transform duration-300 select-none pointer-events-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
              )
            "
            :style="imageStyle"
            alt="preview"
            @load="handleImageLoad"
            @error="handleImageError"
            @wheel="handleWheel"
            @mousedown="handleMouseDown"
          />

          <!-- 下一张按钮 -->
          <button v-if="imageList.length > 1" :class="[navButtonClass, 'right-5']" @click.stop="next" title="下一张(→)">
            <Icon icon="material-symbols:arrow-forward-ios-rounded" width="24" height="24" />
          </button>
        </div>

        <!-- 工具栏 -->
        <div
          v-if="showToolbar"
          class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-md px-3 py-2"
          @click.stop
        >
          <button :class="toolbarButtonClass" @click.stop="zoomOut" title="缩小(-)">
            <Icon icon="material-symbols:zoom-out-rounded" width="24" height="24" />
          </button>

          <span class="text-white text-xs">{{ Math.round(action.scale * 100) }}%</span>

          <button :class="toolbarButtonClass" @click.stop="zoomIn" title="放大(+)">
            <Icon icon="material-symbols:zoom-in-rounded" width="24" height="24" />
          </button>

          <div class="w-px h-5 bg-white/30 mx-1"></div>

          <button :class="toolbarButtonClass" @click.stop="rotateCounterclockwise" title="逆时针旋转">
            <Icon icon="material-symbols:rotate-90-degrees-ccw-outline-rounded" width="24" height="24" />
          </button>

          <button :class="toolbarButtonClass" @click.stop="rotateClockwise" title="顺时针旋转">
            <Icon icon="material-symbols:rotate-90-degrees-cw-outline-rounded" width="24" height="24" />
          </button>

          <button :class="toolbarButtonClass" @click.stop="flipHorizontal" title="水平翻转">
            <Icon icon="hugeicons:flip-left" width="24" height="24" />
          </button>

          <button :class="toolbarButtonClass" @click.stop="flipVertical" title="垂直翻转">
            <Icon icon="hugeicons:flip-top" width="24" height="24" />
          </button>

          <button :class="toolbarButtonClass" @click.stop="reset" title="重置(0)">
            <Icon icon="material-symbols:replay-rounded" width="24" height="24" />
          </button>
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
</style>

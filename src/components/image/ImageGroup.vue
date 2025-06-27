<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import type { ImageGroupProps, ImageContext } from './types'
import ImagePreview from './ImagePreview.vue'

const props = withDefaults(defineProps<ImageGroupProps>(), {
  showToolbar: true,
  showToolbarTooltip: true,
})

const emit = defineEmits<{
  'preview-prev': [current: number]
  'preview-next': [current: number]
}>()

// 状态管理
const images = ref<Array<{ src: string; previewSrc?: string }>>([])
const showPreview = ref(false)
const currentPreviewIndex = ref(0)

const previewImages = computed(() => {
  return images.value.map((img) => img.previewSrc || img.src)
})

// 图片管理方法
function register(src: string, previewSrc?: string) {
  const index = images.value.length
  images.value.push({ src, previewSrc })
  return index
}

function unregister(index: number) {
  if (index >= 0 && index < images.value.length) {
    images.value.splice(index, 1)
    // 更新后续图片的索引
    // 注意：这里简化处理，实际使用中可能需要更复杂的索引管理
  }
}

function preview(index: number) {
  if (index >= 0 && index < images.value.length) {
    currentPreviewIndex.value = index
    showPreview.value = true
  }
}

// 事件处理
function handlePreviewPrev(current: number) {
  emit('preview-prev', current)
}

function handlePreviewNext(current: number) {
  emit('preview-next', current)
}

function handlePreviewClose() {
  showPreview.value = false
}

// 提供上下文
const imageGroupContext: ImageContext = {
  register,
  unregister,
  preview,
  images: images.value,
  currentIndex: currentPreviewIndex.value,
  showPreview: showPreview.value,
  previewOptions: {
    showToolbar: props.showToolbar,
    showToolbarTooltip: props.showToolbarTooltip,
  },
}

provide('imageGroup', imageGroupContext)

defineExpose({
  preview,
  images: images.value,
  currentIndex: currentPreviewIndex.value,
})
</script>

<template>
  <div class="contents">
    <slot />

    <!-- 图片预览 -->
    <ImagePreview
      v-model:show="showPreview"
      v-model:current="currentPreviewIndex"
      :src="previewImages"
      :show-toolbar="showToolbar"
      :show-toolbar-tooltip="showToolbarTooltip"
      @prev="handlePreviewPrev"
      @next="handlePreviewNext"
      @close="handlePreviewClose"
    />
  </div>
</template>

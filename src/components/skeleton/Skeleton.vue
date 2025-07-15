<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'

interface SkeletonProps {
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 是否为圆形 */
  circle?: boolean
  /** 是否为圆角矩形 */
  rounded?: boolean
  /** 动画类型 */
  animation?: 'pulse' | 'wave' | 'none'
  /** 自定义类名 */
  class?: ClassValue
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  width: '100%',
  height: '1rem',
  circle: false,
  rounded: true,
  animation: 'pulse',
})

const skeletonStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const skeletonClass = computed(() =>
  cn(
    'bg-muted',
    {
      'rounded-full': props.circle,
      'rounded-md': props.rounded && !props.circle,
      'animate-pulse': props.animation === 'pulse',
      'animate-wave': props.animation === 'wave',
    },
    props.class,
  ),
)
</script>

<template>
  <div :class="skeletonClass" :style="skeletonStyle" />
</template>

<style scoped>
@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-wave {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  background-size: 200% 100%;
  animation: wave 1.6s linear infinite;
}

.animate-wave::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: wave 1.6s linear infinite;
}
</style>

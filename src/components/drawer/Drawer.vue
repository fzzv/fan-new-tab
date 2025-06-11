<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'vue'

export interface DrawerProps {
  // 基础 Props (基于 Ant Design Vue)
  open?: boolean
  placement?: 'top' | 'right' | 'bottom' | 'left'
  width?: string | number
  height?: string | number
  zIndex?: number
  destroyOnClose?: boolean
  closeByMask?: boolean
  showMask?: boolean
  maskClosable?: boolean
  title?: string
  closable?: boolean
  bodyStyle?: CSSProperties
  headerStyle?: CSSProperties
  footerStyle?: CSSProperties
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<DrawerProps>(), {
  open: false,
  placement: 'right',
  width: 378,
  height: 256,
  zIndex: 1000,
  destroyOnClose: false,
  closeByMask: true,
  showMask: true,
  maskClosable: true,
  closable: true,
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
  (e: 'afterOpenChange', open: boolean): void
}>()

// 双向绑定
const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const drawerRef = ref<HTMLDivElement>()
const drawerContentRef = ref<HTMLDivElement>()

// 关闭抽屉
function close() {
  if (!visible.value) return
  visible.value = false
  emit('close')
  emit('afterOpenChange', false)
}

// 点击遮罩层关闭
function clickMask() {
  if (props.maskClosable && props.closeByMask) {
    close()
  }
}

// 控制销毁
const shouldRender = computed(() => {
  return props.destroyOnClose ? visible.value : true
})

// 控制显示
const shouldShow = computed(() => {
  return !props.destroyOnClose ? visible.value : true
})

// 计算抽屉样式
const drawerStyle = computed(() => {
  const style: CSSProperties = {
    zIndex: props.zIndex,
  }

  return style
})

// 计算内容样式
const contentStyle = computed(() => {
  const style: CSSProperties = {}

  // 根据方向设置尺寸
  if (props.placement === 'left' || props.placement === 'right') {
    if (typeof props.width === 'number') {
      style.width = `${props.width}px`
    } else {
      style.width = props.width
    }
  } else {
    if (typeof props.height === 'number') {
      style.height = `${props.height}px`
    } else {
      style.height = props.height
    }
  }

  return style
})

// 计算内容位置类名
const contentClasses = computed(() => {
  const baseClasses = [
    'drawer-content',
    'fixed',
    'bg-background',
    'border-2',
    'border-border',
    'shadow-lg',
    'flex',
    'flex-col',
    'transition-transform',
    'duration-300',
    'ease-in-out',
  ]

  // 根据方向添加位置类
  switch (props.placement) {
    case 'top':
      baseClasses.push('top-0', 'left-0', 'right-0', 'transform', visible.value ? 'translate-y-0' : '-translate-y-full')
      break
    case 'right':
      baseClasses.push(
        'top-0',
        'right-0',
        'bottom-0',
        'transform',
        visible.value ? 'translate-x-0' : 'translate-x-full',
      )
      break
    case 'bottom':
      baseClasses.push(
        'bottom-0',
        'left-0',
        'right-0',
        'transform',
        visible.value ? 'translate-y-0' : 'translate-y-full',
      )
      break
    case 'left':
      baseClasses.push(
        'top-0',
        'left-0',
        'bottom-0',
        'transform',
        visible.value ? 'translate-x-0' : '-translate-x-full',
      )
      break
  }

  return baseClasses
})

// 尺寸预设
const sizePresets = computed(() => {
  const presets = {
    sm: { width: 300, height: 200 },
    md: { width: 378, height: 256 },
    lg: { width: 520, height: 400 },
    xl: { width: 736, height: 600 },
  }

  return presets[props.size] || presets.md
})

// 应用尺寸预设
const finalContentStyle = computed(() => {
  const style = { ...contentStyle.value }

  // 如果没有明确设置尺寸，使用预设
  if (props.placement === 'left' || props.placement === 'right') {
    if (!props.width) {
      style.width = `${sizePresets.value.width}px`
    }
  } else {
    if (!props.height) {
      style.height = `${sizePresets.value.height}px`
    }
  }

  return style
})

// 焦点陷阱
function trapFocus() {
  if (visible.value) {
    nextTick(() => {
      drawerContentRef.value?.focus()
    })
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      name="drawer-fade"
      @after-enter="emit('afterOpenChange', true)"
      @after-leave="emit('afterOpenChange', false)"
      @enter="trapFocus"
    >
      <div
        v-if="shouldRender"
        v-show="shouldShow"
        ref="drawerRef"
        :style="drawerStyle"
        class="drawer-root fixed inset-0"
        aria-modal="true"
        role="dialog"
      >
        <!-- 遮罩层 -->
        <Transition name="drawer-mask">
          <div
            v-if="showMask && visible"
            class="drawer-mask absolute inset-0 bg-black/60 transition-opacity duration-300"
            @click="clickMask"
          />
        </Transition>

        <!-- 抽屉内容 -->
        <div ref="drawerContentRef" :class="cn(contentClasses)" :style="finalContentStyle" tabindex="-1">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

.drawer-content {
  outline: none;
}
</style>

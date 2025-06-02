// useMouse.ts
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'

type SourceType = 'mouse' | 'touch'

/**
 * 获取 鼠标位置
 * @param target
 */
export function useMouse(
  target: Ref<HTMLElement | null> | HTMLElement | Window = window,
) {
  const x = ref(0)
  const y = ref(0)
  const sourceType = ref<SourceType>('mouse')

  const handleMouseMove = (event: MouseEvent) => {
    x.value = event.clientX
    y.value = event.clientY
    sourceType.value = 'mouse'
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (touch) {
      x.value = touch.clientX
      y.value = touch.clientY
      sourceType.value = 'touch'
    }
  }

  const addListeners = (el: HTMLElement | Window) => {
    el.addEventListener('mousemove', handleMouseMove as EventListener)
    el.addEventListener('touchmove', handleTouchMove as EventListener)
  }

  const removeListeners = (el: HTMLElement | Window) => {
    el.removeEventListener('mousemove', handleMouseMove as EventListener)
    el.removeEventListener('touchmove', handleTouchMove as EventListener)
  }

  let currentTarget: HTMLElement | Window | null = null

  const setupListeners = (el: HTMLElement | Window | null) => {
    if (currentTarget) removeListeners(currentTarget)
    if (el) {
      addListeners(el)
      currentTarget = el
    }
  }

  onMounted(() => {
    const el =
      target instanceof Window || target instanceof HTMLElement
        ? target
        : target.value
    setupListeners(el)
  })

  onUnmounted(() => {
    if (currentTarget) removeListeners(currentTarget)
  })

  // 监听目标元素变化（如果是 Ref）
  if (typeof target !== 'undefined' && 'value' in target) {
    watch(target, (el) => {
      setupListeners(el)
    })
  }

  return { x, y, sourceType }
}

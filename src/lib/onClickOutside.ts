import { onMounted, onUnmounted, type Ref } from 'vue'
import type { MaybeElement } from '@/lib'

/**
 * 监听点击事件是否发生在目标元素外部
 *
 * @param target - 目标元素的 Ref（通常是 DOM 元素）
 * @param handler - 点击外部时触发的回调函数
 */
export function onClickOutside<T extends HTMLElement>(
  target: Ref<T | MaybeElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  const listener = (event: MouseEvent | TouchEvent) => {
    const el = target.value
    if (!el || ('contains' in el && el?.contains(event.target as Node))) return
    handler(event)
  }

  onMounted(() => {
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', listener)
    document.removeEventListener('touchstart', listener)
  })
}

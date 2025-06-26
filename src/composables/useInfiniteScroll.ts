import { ref, type Ref } from 'vue'
import { debounce } from 'lodash-es'

export interface UseInfiniteScrollOptions {
  /**
   * 触发加载的阈值（0-1之间，表示滚动百分比）
   * 默认 0.9，即滚动到90%时触发
   */
  threshold?: number
  /**
   * 防抖延迟时间（毫秒）
   * 默认 100ms
   */
  debounceDelay?: number
  /**
   * 是否启用调试日志
   */
  debug?: boolean
}

export interface UseInfiniteScrollReturn {
  /**
   * 滚动事件处理函数
   */
  handleScroll: (event?: Event) => void
  /**
   * 是否正在加载
   */
  isLoading: Ref<boolean>
  /**
   * 是否还有更多数据
   */
  hasMore: Ref<boolean>
  /**
   * 重置状态
   */
  reset: () => void
}

/**
 * 无限滚动 composable
 * @param loadMore 加载更多数据的函数
 * @param options 配置选项
 */
export function useInfiniteScroll(
  loadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {},
): UseInfiniteScrollReturn {
  const { threshold = 0.9, debounceDelay = 100, debug = false } = options

  const isLoading = ref(false)
  const hasMore = ref(true)

  // 实际的滚动处理逻辑
  function _handleScroll(event?: Event) {
    // 如果正在加载或没有更多数据，直接返回
    if (isLoading.value || !hasMore.value) {
      if (debug) {
        console.log('跳过加载：', { isLoading: isLoading.value, hasMore: hasMore.value })
      }
      return
    }

    // 如果没有事件对象，直接返回
    if (!event || !event.target) {
      if (debug) {
        console.log('无效的事件对象')
      }
      return
    }

    const target = event.target as HTMLElement
    if (!target) return

    const { scrollTop, scrollHeight, clientHeight } = target

    // 避免除零错误
    if (scrollHeight === 0) return

    // 计算滚动百分比
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    if (debug) {
      console.log('滚动信息：', {
        scrollTop,
        clientHeight,
        scrollHeight,
        scrollPercentage: Math.round(scrollPercentage * 100) + '%',
        threshold: Math.round(threshold * 100) + '%',
      })
    }

    // 当滚动百分比达到阈值时触发加载
    if (scrollPercentage >= threshold) {
      if (debug) {
        console.log('触发加载更多，滚动百分比:', Math.round(scrollPercentage * 100) + '%')
      }

      isLoading.value = true

      Promise.resolve(loadMore()).finally(() => {
        isLoading.value = false
      })
    }
  }

  // 防抖
  const handleScroll = debounce(_handleScroll, debounceDelay)

  // 重置状态
  function reset() {
    isLoading.value = false
    hasMore.value = true
    // lodash-es 的 debounce 函数有 cancel 方法
    handleScroll.cancel()
  }

  return {
    handleScroll,
    isLoading,
    hasMore,
    reset,
  }
}

import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'

export interface ResponsiveGridOptions {
  /**
   * 每个网格项的最小宽度（px）
   */
  minItemWidth?: number
  /**
   * 每个网格项的最大宽度（px）
   */
  maxItemWidth?: number
  /**
   * 网格间距（px）
   */
  gap?: number
  /**
   * 最小列数
   */
  minCols?: number
  /**
   * 最大列数
   */
  maxCols?: number
  /**
   * 断点配置
   */
  breakpoints?: {
    [key: number]: number // 容器宽度 -> 列数
  }
}

export interface ResponsiveGridReturn {
  /**
   * 当前列数
   */
  cols: Ref<number>
  /**
   * 容器宽度
   */
  containerWidth: Ref<number>
  /**
   * 计算出的网格样式
   */
  gridStyle: Ref<Record<string, string>>
  /**
   * 手动更新容器尺寸
   */
  updateSize: () => void
  /**
   * 重新初始化观察器
   */
  reinitializeObserver: () => void
}

/**
 * 响应式网格 composable
 * @param containerRef 容器元素的引用
 * @param options 配置选项
 */
export function useResponsiveGrid(
  containerRef: Ref<HTMLElement | null>,
  options: ResponsiveGridOptions = {},
): ResponsiveGridReturn {
  const { minItemWidth = 200, maxItemWidth = 300, gap = 16, minCols = 1, maxCols = 6, breakpoints } = options

  const containerWidth = ref(0)
  const cols = ref(minCols)

  // 计算列数的函数
  const calculateCols = (width: number): number => {
    if (width === 0) return minCols

    // 如果有自定义断点配置，优先使用
    if (breakpoints) {
      const sortedBreakpoints = Object.keys(breakpoints)
        .map(Number)
        .sort((a, b) => b - a) // 从大到小排序

      for (const breakpoint of sortedBreakpoints) {
        if (width >= breakpoint) {
          return Math.max(minCols, Math.min(maxCols, breakpoints[breakpoint]))
        }
      }
      return minCols
    }

    // 基于项目宽度计算列数
    // 考虑间距：总宽度 = 列数 * 项目宽度 + (列数 - 1) * 间距
    let calculatedCols = minCols

    for (let testCols = minCols; testCols <= maxCols; testCols++) {
      const totalGapWidth = (testCols - 1) * gap
      const availableWidth = width - totalGapWidth
      const itemWidth = availableWidth / testCols

      if (itemWidth >= minItemWidth && itemWidth <= maxItemWidth) {
        calculatedCols = testCols
      } else if (itemWidth < minItemWidth) {
        break // 项目太小了，停止增加列数
      }
    }

    return calculatedCols
  }

  // 更新尺寸的函数
  const updateSize = () => {
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      containerWidth.value = rect.width
      cols.value = calculateCols(rect.width)
    }
  }

  // 计算网格样式
  const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
    gap: `${gap}px`,
    width: '100%',
  }))

  // ResizeObserver 实例
  let resizeObserver: ResizeObserver | null = null

  // 创建 ResizeObserver 的函数
  const createResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        containerWidth.value = width
        cols.value = calculateCols(width)
      }
    })
  }

  // 开始观察容器的函数
  const startObserving = () => {
    if (containerRef.value && resizeObserver) {
      resizeObserver.observe(containerRef.value)
    }
  }

  // 停止观察的函数
  const stopObserving = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  }

  // 重新初始化观察器
  const reinitializeObserver = () => {
    if (containerRef.value) {
      stopObserving()
      createResizeObserver()
      updateSize()
      startObserving()
    }
  }

  // 监听 containerRef 的变化，当元素重新创建时重新初始化
  watch(containerRef, (newContainer, oldContainer) => {
    if (newContainer && newContainer !== oldContainer) {
      reinitializeObserver()
    }
  }, { immediate: false })

  onMounted(() => {
    if (containerRef.value) {
      createResizeObserver()
      updateSize()
      startObserving()
    }
  })

  onUnmounted(() => {
    stopObserving()
  })

  return {
    cols,
    containerWidth,
    gridStyle,
    updateSize,
    reinitializeObserver,
  }
}

/**
 * 预设的响应式配置
 */
export const responsivePresets = {
  // 图片网格（适合壁纸选择器）
  imageGrid: {
    minItemWidth: 180,
    maxItemWidth: 250,
    gap: 16,
    minCols: 2,
    maxCols: 6,
    breakpoints: {
      1200: 6,
      1000: 5,
      800: 4,
      600: 3,
      400: 2,
      0: 1,
    },
  },
  // 卡片网格
  cardGrid: {
    minItemWidth: 200,
    maxItemWidth: 300,
    gap: 20,
    minCols: 1,
    maxCols: 4,
    breakpoints: {
      900: 4,
      700: 3,
      500: 2,
      0: 1,
    },
  },
  // 紧凑网格
  compactGrid: {
    minItemWidth: 120,
    maxItemWidth: 180,
    gap: 12,
    minCols: 3,
    maxCols: 8,
    breakpoints: {
      1400: 8,
      1200: 7,
      1000: 6,
      800: 5,
      600: 4,
      400: 3,
      0: 2,
    },
  },
}

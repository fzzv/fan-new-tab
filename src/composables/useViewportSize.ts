import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useViewportSize() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  // 更新窗口尺寸
  const updateSize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  // 监听窗口大小变化
  onMounted(() => {
    window.addEventListener('resize', updateSize)
    updateSize() // 初始化
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    windowWidth,
    windowHeight,
  }
}

// 计算标准模式的可用空间
export function useStandardModeSize() {
  const { windowWidth, windowHeight } = useViewportSize()

  // 计算可用宽度
  const availableWidth = computed(() => {
    // 内容区域是 80vw，减去左右 padding (20px * 2 = 40px)
    const contentWidth = windowWidth.value * 0.8
    const padding = 40 // p-20 = 20px * 2
    return Math.max(300, contentWidth - padding) // 最小宽度 300px
  })

  // 计算可用高度
  const availableHeight = computed(() => {
    // 页面总高度减去各个区域的占用
    const totalHeight = windowHeight.value

    // 根据实际页面结构计算已使用的高度
    // 搜索栏区域：约 140px (包含 padding 和搜索框)
    const searchAreaHeight = 140

    // 内容区域的 padding：p-20 = 80px (top + bottom)
    const contentPadding = 80

    // 预留空间避免滚动条
    const reservedSpace = 20

    const usedHeight = searchAreaHeight + contentPadding + reservedSpace

    return Math.max(300, totalHeight - usedHeight) // 最小高度 300px
  })

  // 计算网格的最大尺寸（考虑 Swiper 的导航和分页器）
  const gridMaxWidth = computed(() => {
    // 为 Swiper 导航按钮预留空间 (44px * 2 + 20px margin)
    return Math.max(300, availableWidth.value - 108)
  })

  const gridMaxHeight = computed(() => {
    // 为 Swiper 分页器预留空间 (约 40px)
    return Math.max(300, availableHeight.value - 40)
  })

  // 计算网格单元格的最佳尺寸
  const calculateOptimalCellSize = (rows: number, cols: number, gap: number) => {
    const maxWidth = gridMaxWidth.value
    const maxHeight = gridMaxHeight.value

    // 计算可用于网格内容的空间（减去间隙）
    const availableGridWidth = maxWidth - (cols - 1) * gap
    const availableGridHeight = maxHeight - (rows - 1) * gap

    // 计算单元格尺寸
    const cellWidth = Math.floor(availableGridWidth / cols)
    const cellHeight = Math.floor(availableGridHeight / rows)

    // 使用较小的尺寸保持正方形比例
    const cellSize = Math.min(cellWidth, cellHeight)

    // 计算实际网格尺寸
    const actualGridWidth = cellSize * cols + (cols - 1) * gap
    const actualGridHeight = cellSize * rows + (rows - 1) * gap

    return {
      cellSize: Math.max(40, cellSize), // 最小 40px
      gridWidth: actualGridWidth,
      gridHeight: actualGridHeight,
    }
  }

  return {
    availableWidth,
    availableHeight,
    gridMaxWidth,
    gridMaxHeight,
    calculateOptimalCellSize,
    windowWidth,
    windowHeight,
  }
}

import { computed } from 'vue'
import { useWebExtStorage } from '@/composables/useWebExtStorage'

// 布局配置接口
export interface GridLayoutConfig {
  rows: number
  cols: number
  gap: number
  maxRows?: number // 最大行数限制，undefined 表示无限制
}

// 默认布局配置
const defaultLayoutConfig: GridLayoutConfig = {
  rows: 2,
  cols: 4,
  gap: 16,
  maxRows: 8, // 非收藏夹模式下最大 8 行
}

// 页面设置
const { data: pageSetting } = useWebExtStorage('pageSetting', {
  favoritesMode: false,
})

// 布局设置
const { data: gridLayoutConfig } = useWebExtStorage('gridLayoutConfig', defaultLayoutConfig)

export function useGridLayout() {
  // 是否为收藏夹模式
  const isFavoritesMode = computed(() => pageSetting.value.favoritesMode)
  
  // 根据收藏夹模式计算最大行数限制
  const maxRowsLimit = computed(() => {
    return isFavoritesMode.value ? undefined : 8
  })
  
  // 根据收藏夹模式计算最大列数限制
  const maxColsLimit = computed(() => {
    return 8 // 列数始终限制为 8
  })
  
  // 验证并调整行数
  const validatedRows = computed(() => {
    const rows = gridLayoutConfig.value.rows
    const minRows = 1
    const maxRows = maxRowsLimit.value || Number.MAX_SAFE_INTEGER
    
    return Math.max(minRows, Math.min(maxRows, rows))
  })
  
  // 验证并调整列数
  const validatedCols = computed(() => {
    const cols = gridLayoutConfig.value.cols
    const minCols = 1
    const maxCols = maxColsLimit.value
    
    return Math.max(minCols, Math.min(maxCols, cols))
  })
  
  // 当前有效的布局配置
  const currentLayoutConfig = computed<GridLayoutConfig>(() => ({
    rows: validatedRows.value,
    cols: validatedCols.value,
    gap: gridLayoutConfig.value.gap,
    maxRows: maxRowsLimit.value,
  }))
  
  // 更新行数
  const updateRows = (rows: number) => {
    const maxRows = maxRowsLimit.value || Number.MAX_SAFE_INTEGER
    gridLayoutConfig.value.rows = Math.max(1, Math.min(maxRows, rows))
  }
  
  // 更新列数
  const updateCols = (cols: number) => {
    gridLayoutConfig.value.cols = Math.max(1, Math.min(maxColsLimit.value, cols))
  }
  
  // 更新间距
  const updateGap = (gap: number) => {
    gridLayoutConfig.value.gap = Math.max(0, gap)
  }
  
  // 重置为默认配置
  const resetToDefault = () => {
    gridLayoutConfig.value = { ...defaultLayoutConfig }
  }
  
  // 获取行数选项（根据模式动态生成）
  const rowOptions = computed(() => {
    const maxRows = maxRowsLimit.value || 20 // 收藏夹模式下最多显示 20 个选项
    const options = []
    
    for (let i = 1; i <= maxRows; i++) {
      options.push({
        label: `${i} 行`,
        value: i,
      })
    }
    
    return options
  })
  
  // 获取列数选项
  const colOptions = computed(() => {
    const options = []
    
    for (let i = 1; i <= maxColsLimit.value; i++) {
      options.push({
        label: `${i} 列`,
        value: i,
      })
    }
    
    return options
  })
  
  // 获取间距选项
  const gapOptions = computed(() => [
    { label: '无间距', value: 0 },
    { label: '小间距 (8px)', value: 8 },
    { label: '中间距 (16px)', value: 16 },
    { label: '大间距 (24px)', value: 24 },
    { label: '超大间距 (32px)', value: 32 },
  ])
  
  return {
    // 状态
    isFavoritesMode,
    currentLayoutConfig,
    gridLayoutConfig,
    
    // 限制
    maxRowsLimit,
    maxColsLimit,
    
    // 验证后的值
    validatedRows,
    validatedCols,
    
    // 选项
    rowOptions,
    colOptions,
    gapOptions,
    
    // 方法
    updateRows,
    updateCols,
    updateGap,
    resetToDefault,
  }
}

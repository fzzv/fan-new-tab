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

// 显示模式类型
export type DisplayMode = 'standard' | 'favorites' | 'minimal'

// 模式设置
const { data: displayMode } = useWebExtStorage('displayMode', 'standard' as DisplayMode)

// 标准模式下的设置
const { data: standardConfig } = useWebExtStorage('standardConfig', {
  gridLayoutConfig: defaultLayoutConfig,
})

// 收藏夹模式下的设置
const { data: favoritesConfig } = useWebExtStorage('favoritesConfig', {
  gridLayoutConfig: { ...defaultLayoutConfig, maxRows: undefined }, // 收藏夹模式无行数限制
})

// 极简模式下的设置（不包含gridLayoutConfig）
const { data: minimalConfig } = useWebExtStorage('minimalConfig', {
  // 极简模式下没有网格布局设置
})

export function useSettings() {
  // 当前显示模式
  const currentDisplayMode = computed(() => displayMode.value)

  // 是否为收藏夹模式（向后兼容）
  const isFavoritesMode = computed(() => currentDisplayMode.value === 'favorites')

  // 获取当前模式的网格布局配置
  const currentGridLayoutConfig = computed(() => {
    switch (currentDisplayMode.value) {
      case 'standard':
        return standardConfig.value.gridLayoutConfig
      case 'favorites':
        return favoritesConfig.value.gridLayoutConfig
      case 'minimal':
      default:
        // 极简模式没有网格布局配置，返回默认值
        return defaultLayoutConfig
    }
  })

  // 根据显示模式计算最大行数限制
  const maxRowsLimit = computed(() => {
    switch (currentDisplayMode.value) {
      case 'favorites':
        return undefined // 收藏夹模式：无限制
      case 'minimal':
        return 4 // 极简模式：最多4行
      case 'standard':
      default:
        return 8 // 标准模式：最多8行
    }
  })

  // 根据显示模式计算最大列数限制
  const maxColsLimit = computed(() => {
    switch (currentDisplayMode.value) {
      case 'minimal':
        return 6 // 极简模式：最多6列
      case 'favorites':
      case 'standard':
      default:
        return 8 // 收藏夹和标准模式：最多8列
    }
  })

  // 验证并调整行数
  const validatedRows = computed(() => {
    const rows = currentGridLayoutConfig.value.rows
    const minRows = 1
    const maxRows = maxRowsLimit.value || Number.MAX_SAFE_INTEGER

    return Math.max(minRows, Math.min(maxRows, rows))
  })

  // 验证并调整列数
  const validatedCols = computed(() => {
    const cols = currentGridLayoutConfig.value.cols
    const minCols = 1
    const maxCols = maxColsLimit.value

    return Math.max(minCols, Math.min(maxCols, cols))
  })

  // 当前有效的布局配置
  const currentLayoutConfig = computed<GridLayoutConfig>(() => ({
    rows: validatedRows.value,
    cols: validatedCols.value,
    gap: currentGridLayoutConfig.value.gap,
    maxRows: maxRowsLimit.value,
  }))

  // 更新当前模式的网格布局配置
  const updateCurrentGridLayoutConfig = (updater: (config: GridLayoutConfig) => void) => {
    switch (currentDisplayMode.value) {
      case 'standard':
        updater(standardConfig.value.gridLayoutConfig)
        break
      case 'favorites':
        updater(favoritesConfig.value.gridLayoutConfig)
        break
      case 'minimal':
        // 极简模式不支持网格布局配置修改
        break
    }
  }

  // 更新行数
  const updateRows = (rows: number) => {
    const maxRows = maxRowsLimit.value || Number.MAX_SAFE_INTEGER
    const validatedRows = Math.max(1, Math.min(maxRows, rows))
    updateCurrentGridLayoutConfig((config) => {
      config.rows = validatedRows
    })
  }

  // 更新列数
  const updateCols = (cols: number) => {
    const validatedCols = Math.max(1, Math.min(maxColsLimit.value, cols))
    updateCurrentGridLayoutConfig((config) => {
      config.cols = validatedCols
    })
  }

  // 更新间距
  const updateGap = (gap: number) => {
    const validatedGap = Math.max(0, gap)
    updateCurrentGridLayoutConfig((config) => {
      config.gap = validatedGap
    })
  }

  // 重置当前模式为默认配置
  const resetToDefault = () => {
    switch (currentDisplayMode.value) {
      case 'standard':
        standardConfig.value.gridLayoutConfig = { ...defaultLayoutConfig }
        break
      case 'favorites':
        favoritesConfig.value.gridLayoutConfig = { ...defaultLayoutConfig, maxRows: undefined }
        break
      case 'minimal':
        // 极简模式不支持重置网格布局配置
        break
    }
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

  // 更新显示模式
  const updateDisplayMode = (mode: DisplayMode) => {
    displayMode.value = mode
  }

  return {
    // 状态
    currentDisplayMode,
    isFavoritesMode, // 向后兼容
    currentLayoutConfig,
    currentGridLayoutConfig, // 当前模式的网格布局配置

    // 模式配置
    standardConfig,
    favoritesConfig,
    minimalConfig,

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
    updateDisplayMode,
    updateRows,
    updateCols,
    updateGap,
    resetToDefault,
  }
}

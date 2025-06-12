# 网格布局设置功能

为 siteCardGrid 添加了灵活的布局设置功能，支持收藏夹模式和普通模式的不同布局限制。

## 功能特性

### 🎯 双模式支持

**收藏夹模式（开启时）：**
- ✅ 行数不受限制，根据网站数量自动调整
- ✅ 列数限制：1-8 列
- ✅ 适合展示大量收藏网站

**普通模式（关闭时）：**
- ✅ 最大布局：8x8（64个网站）
- ✅ 行数限制：1-8 行
- ✅ 列数限制：1-8 列
- ✅ 适合精简展示

### ⚙️ 灵活配置

- **行数设置**：普通模式下可设置 1-8 行
- **列数设置**：两种模式下都可设置 1-8 列
- **间距设置**：支持 0px、8px、16px、24px、32px
- **实时预览**：所有设置立即生效
- **一键重置**：快速恢复默认设置

## 技术实现

### 1. useSettings Composable

```typescript
// 核心功能
const {
  currentLayoutConfig,    // 当前布局配置
  isFavoritesMode,       // 是否为收藏夹模式
  updateRows,            // 更新行数
  updateCols,            // 更新列数
  updateGap,             // 更新间距
  resetToDefault         // 重置默认
} = useSettings()
```

### 2. SiteCardGrid 组件增强

```vue
<!-- 支持无限制行数 -->
<SiteCardGrid
  :sites="sites"
  :rows="0"        <!-- 0 表示无限制，自动计算 -->
  :cols="4"
  :gap="16"
/>
```

### 3. SettingGridLayout 组件

独立的网格布局设置组件，支持多种使用模式：

```vue
<script setup>
import SettingGridLayout from '@/components/setting/SettingGridLayout.vue'
</script>

<template>
  <!-- 默认可折叠面板模式 -->
  <SettingGridLayout />

  <!-- 直接显示模式 -->
  <SettingGridLayout :collapsible="false" title="布局设置" />

  <!-- 不显示模式信息 -->
  <SettingGridLayout :show-mode-info="false" />
</template>
```

### 4. 设置界面

通过 `SettingDrawer.vue` 提供直观的设置界面：
- 显示模式切换（标准/收藏夹/极简）
- 网格布局设置（复用 SettingGridLayout 组件）
- 实时配置预览

## 使用方法

### SettingGridLayout 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| collapsible | boolean | true | 是否显示为可折叠面板 |
| title | string | '网格布局' | 组件标题 |
| showModeInfo | boolean | true | 是否显示模式信息 |

### 基础使用

```vue
<script setup>
import { useSettings } from '@/composables/useSettings'
import SiteCardGrid from '@/newtab/components/SiteCardGrid.vue'

const { currentLayoutConfig, isFavoritesMode } = useSettings()

// 根据模式计算配置
const gridConfig = computed(() => {
  if (isFavoritesMode.value) {
    return {
      rows: 0, // 无限制
      cols: currentLayoutConfig.value.cols,
      gap: currentLayoutConfig.value.gap,
    }
  } else {
    return {
      rows: currentLayoutConfig.value.rows,
      cols: currentLayoutConfig.value.cols,
      gap: currentLayoutConfig.value.gap,
    }
  }
})
</script>

<template>
  <SiteCardGrid
    :sites="sites"
    :rows="gridConfig.rows"
    :cols="gridConfig.cols"
    :gap="gridConfig.gap"
  />
</template>
```

### 设置界面

用户可以通过右上角的设置按钮打开设置抽屉：

1. **收藏夹模式开关**：控制是否启用无限制行数
2. **布局设置**：调整行数、列数、间距
3. **实时预览**：查看当前配置效果
4. **重置功能**：一键恢复默认设置

## 配置存储

所有设置都会自动保存到浏览器存储中：

```typescript
// 页面设置
pageSetting: {
  favoritesMode: boolean  // 收藏夹模式开关
}

// 布局配置
gridLayoutConfig: {
  rows: number,     // 行数
  cols: number,     // 列数
  gap: number,      // 间距
  maxRows?: number  // 最大行数限制
}
```

## 测试

### 功能测试

可以使用 `GridLayoutTest.vue` 组件来测试所有功能：

```vue
<script setup>
import GridLayoutTest from '@/components/setting/GridLayoutTest.vue'
</script>

<template>
  <GridLayoutTest />
</template>
```

### 组件测试

可以使用 `SettingGridLayoutDemo.vue` 组件来测试 SettingGridLayout 组件的不同使用方式：

```vue
<script setup>
import SettingGridLayoutDemo from '@/components/setting/SettingGridLayoutDemo.vue'
</script>

<template>
  <SettingGridLayoutDemo />
</template>
```

测试功能包括：
- 模式切换测试
- 布局参数调整
- 网站数量变化测试
- 实时预览效果
- 组件复用测试

## 注意事项

1. **性能考虑**：收藏夹模式下，如果网站数量过多，建议适当调整列数以保持良好的显示效果
2. **响应式设计**：组件会根据容器大小自动调整间距
3. **数据持久化**：所有设置都会自动保存，页面刷新后保持不变
4. **向后兼容**：现有的 SiteCardGrid 使用方式完全兼容

## API 参考

### useSettings()

| 返回值 | 类型 | 说明 |
|--------|------|------|
| currentLayoutConfig | ComputedRef\<GridLayoutConfig\> | 当前布局配置 |
| isFavoritesMode | ComputedRef\<boolean\> | 是否为收藏夹模式 |
| updateRows | (rows: number) => void | 更新行数 |
| updateCols | (cols: number) => void | 更新列数 |
| updateGap | (gap: number) => void | 更新间距 |
| resetToDefault | () => void | 重置为默认配置 |

### SiteCardGrid Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| rows | number | 2 | 行数，0 表示无限制 |
| cols | number | 4 | 列数 |
| gap | number | 16 | 间距（px） |
| sites | SiteData[] | [] | 网站数据 |

### GridLayoutConfig

```typescript
interface GridLayoutConfig {
  rows: number        // 行数
  cols: number        // 列数
  gap: number         // 间距
  maxRows?: number    // 最大行数限制
}
```

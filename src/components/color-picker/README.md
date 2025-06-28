# ColorPicker 颜色选择器

基于 reka-ui 和 seemly 库实现的功能完整的颜色选择器组件，支持多种颜色格式和丰富的交互功能。

## 组件

### ColorPicker
带有弹出层的完整颜色选择器组件，适用于表单和工具栏等场景。

### ColorPickerPanel
独立的颜色选择面板组件，可以单独使用而无需弹出层，适用于侧边栏、模态框等场景。

## 特性

- 🎨 **多格式支持**: HEX、RGB、RGBA、HSL、HSLA、HSV、HSVA
- 🎯 **基于 reka-ui**: 使用原生 Popover 和 Slider 组件，无额外封装
- 🎛️ **完整交互**: 饱和度/亮度面板 + 色相滑块 + 透明度滑块
- 🎪 **预设颜色**: 内置常用颜色，支持自定义预设
- 📝 **颜色输入**: 支持直接输入颜色值，实时验证
- 🔄 **格式切换**: 一键切换不同颜色格式
- 📱 **响应式设计**: 移动端友好，触摸设备支持
- ♿ **无障碍支持**: 完整的键盘导航和屏幕阅读器支持
- 🌙 **主题适配**: 支持暗色模式，与项目主题一致
- 🔧 **高度可配置**: 丰富的配置选项，满足不同需求
- ⚡ **高性能**: 基于 seemly 库的高效颜色转换
- 🎭 **平滑动画**: 优雅的交互动画和视觉反馈
- 🧩 **模块化设计**: 可以单独使用面板组件，灵活组合

## 安装依赖

组件依赖以下库（项目中已包含）：

```bash
npm install reka-ui seemly lodash-es clsx tailwind-merge
```

## 基础用法

### ColorPicker（带弹出层）

```vue
<script setup>
import { ref } from 'vue'
import { ColorPicker } from '@/components/color-picker'

const selectedColor = ref('#ff6b6b')
</script>

<template>
  <ColorPicker v-model="selectedColor" />
</template>
```

### ColorPickerPanel（独立面板）

```vue
<script setup>
import { ref } from 'vue'
import { ColorPickerPanel } from '@/components/color-picker'

const selectedColor = ref('#ff6b6b')
</script>

<template>
  <div class="w-80 p-4 border border-border rounded-lg">
    <ColorPickerPanel v-model="selectedColor" />
  </div>
</template>
```

## API 文档

### ColorPicker Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `'#ffffff'` | 当前颜色值 |
| `mode` | `ColorFormat` | `'hex'` | 颜色格式模式 |
| `showAlpha` | `boolean` | `true` | 是否显示透明度控制 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `presets` | `string[]` | `[]` | 预设颜色 |
| `showPresets` | `boolean` | `false` | 是否显示预设颜色 |
| `showInput` | `boolean` | `true` | 是否显示颜色值输入框 |
| `showFormatSwitch` | `boolean` | `true` | 是否显示格式切换 |
| `showPreview` | `boolean` | `false` | 是否显示颜色预览 |
| `triggerClass` | `string` | `''` | 触发器样式类 |
| `popoverClass` | `string` | `''` | 弹出层样式类 |
| `placement` | `PopoverPlacement` | `'bottom-start'` | 弹出层位置 |

### ColorPickerPanel Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `'#ffffff'` | 当前颜色值 |
| `mode` | `ColorFormat` | `'hex'` | 颜色格式模式 |
| `showAlpha` | `boolean` | `true` | 是否显示透明度控制 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `presets` | `string[]` | `[]` | 预设颜色 |
| `showPresets` | `boolean` | `false` | 是否显示预设颜色 |
| `showInput` | `boolean` | `true` | 是否显示颜色值输入框 |
| `showFormatSwitch` | `boolean` | `true` | 是否显示格式切换 |
| `showPreview` | `boolean` | `false` | 是否显示颜色预览 |

### Events（两个组件相同）

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string)` | 颜色值更新事件 |
| `change` | `(value: string, rgba: RGBA)` | 颜色变化事件 |
| `format-change` | `(format: ColorFormat)` | 格式变化事件 |

### 颜色格式类型

```typescript
type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsv' | 'hsva' | 'hsl' | 'hsla'
```

## 使用示例

### 不同颜色格式

```vue
<template>
  <div class="space-y-4">
    <!-- HEX 格式 -->
    <ColorPicker v-model="hexColor" mode="hex" />
    
    <!-- RGB 格式 -->
    <ColorPicker v-model="rgbColor" mode="rgb" />
    
    <!-- HSL 格式 -->
    <ColorPicker v-model="hslColor" mode="hsl" />
    
    <!-- 带透明度的 RGBA -->
    <ColorPicker v-model="rgbaColor" mode="rgba" :show-alpha="true" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ColorPicker } from '@/components/color-picker'

const hexColor = ref('#ff6b6b')
const rgbColor = ref('rgb(255, 107, 107)')
const hslColor = ref('hsl(0, 100%, 71%)')
const rgbaColor = ref('rgba(255, 107, 107, 0.8)')
</script>
```

### 自定义配置

```vue
<template>
  <ColorPicker 
    v-model="selectedColor"
    mode="hex"
    size="lg"
    :show-alpha="false"
    :presets="customPresets"
    :show-format-switch="false"
    placement="top"
    @change="handleColorChange"
    @format-change="handleFormatChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ColorPicker, type RGBA, type ColorFormat } from '@/components/color-picker'

const selectedColor = ref('#ff6b6b')

const customPresets = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
]

const handleColorChange = (value: string, rgba: RGBA) => {
  console.log('颜色变化:', { value, rgba })
}

const handleFormatChange = (format: ColorFormat) => {
  console.log('格式变化:', format)
}
</script>
```

### 不同尺寸

```vue
<template>
  <div class="flex items-center gap-4">
    <ColorPicker v-model="color" size="sm" />
    <ColorPicker v-model="color" size="md" />
    <ColorPicker v-model="color" size="lg" />
  </div>
</template>
```

### 禁用状态

```vue
<template>
  <ColorPicker v-model="color" disabled />
</template>
```

## 工具函数

组件还导出了一系列颜色处理工具函数：

```typescript
import {
  parseColor,
  formatColor,
  rgbaToHex,
  rgbaToHsv,
  hsvToRgba,
  rgbaToHsl,
  hslToRgba,
  isValidColor,
  getContrastColor,
  DEFAULT_PRESETS,
} from '@/components/color-picker'

// 解析颜色字符串
const rgba = parseColor('#ff6b6b')

// 格式化颜色输出
const hexColor = formatColor(rgba, 'hex')
const rgbColor = formatColor(rgba, 'rgb')

// 颜色格式转换
const hsv = rgbaToHsv(rgba)
const backToRgba = hsvToRgba(hsv)

// 验证颜色格式
const isValid = isValidColor('#ff6b6b') // true

// 获取对比色
const contrastColor = getContrastColor(rgba) // '#000000' 或 '#ffffff'
```

## 键盘导航

| 按键 | 功能 |
|------|------|
| `Tab` | 在控件间切换焦点 |
| `Enter` / `Space` | 打开/关闭颜色选择器 |
| `Escape` | 关闭颜色选择器 |
| `←` / `→` | 调整滑块值 |
| `↑` / `↓` | 调整滑块值 |
| `Page Up` / `Page Down` | 大步长调整滑块值 |
| `Home` / `End` | 跳转到滑块最小/最大值 |

## 注意事项

1. **颜色格式**: 组件会自动处理不同格式间的转换，确保输出格式与 `mode` 属性一致
2. **性能优化**: 使用了防抖处理，避免频繁的颜色变化事件
3. **样式定制**: 组件使用项目的主题系统，可通过 CSS 变量进行样式定制
4. **无障碍**: 组件内置了完整的 ARIA 属性和键盘导航支持
5. **移动端**: 支持触摸操作，在移动设备上有良好的用户体验
6. **错误处理**: 对无效颜色值有完善的错误处理机制

## 依赖要求

确保项目中已安装并配置以下依赖：

- `reka-ui`: 提供 Popover 和 Slider 组件
- `seemly`: 提供颜色转换和处理功能
- `lodash-es`: 提供 debounce 函数
- `clsx` 和 `tailwind-merge`: 提供样式类合并功能
- `tailwindcss`: 样式框架

## 浏览器兼容性

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

支持所有现代浏览器，依赖 Intersection Observer API 和 CSS Grid。

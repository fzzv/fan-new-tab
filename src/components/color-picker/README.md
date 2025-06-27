# ColorPicker 颜色选择器

一个功能完整的颜色选择器组件，支持多种颜色格式和丰富的交互功能。

## 特性

- 🎨 **多种颜色模式**: 支持 RGB、HEX、HSL、HSV 四种颜色格式
- 🎯 **直观操作**: 色相条、饱和度/亮度面板、透明度滑块
- 🎪 **预设颜色**: 内置常用颜色，支持自定义预设
- 📱 **响应式设计**: 适配桌面端和移动端
- ♿ **无障碍支持**: 支持键盘导航和屏幕阅读器
- 🎛️ **高度可定制**: 丰富的配置选项和样式定制
- 💪 **TypeScript**: 完整的类型定义支持
- 🎚️ **基于 reka-ui 原生 Slider**: 使用 reka-ui 的原生 Slider 组件实现滑块功能

## 基础用法

```vue
<template>
  <ColorPicker v-model="color" />
</template>

<script setup>
import { ref } from 'vue'
import ColorPicker from '@/components/color-picker/ColorPicker.vue'

const color = ref('#ff6b6b')
</script>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `#000000` | 当前颜色值，支持 v-model |
| `mode` | `'rgb' \| 'hex' \| 'hsl' \| 'hsv'` | `'hex'` | 颜色格式模式 |
| `showAlpha` | `boolean` | `true` | 是否显示透明度控制 |
| `showPresets` | `boolean` | `true` | 是否显示预设颜色 |
| `presets` | `string[]` | `DEFAULT_PRESETS` | 自定义预设颜色数组 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 触发器尺寸 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 弹出位置 |
| `class` | `string` | - | 自定义 CSS 类名 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(value: string)` | 颜色值变化时触发 |
| `change` | `(value: string, mode: ColorMode)` | 颜色变化时触发，包含模式信息 |

### 颜色格式支持

组件支持以下颜色格式的输入和输出：

- **HEX**: `#ff6b6b`, `#ff6b6bff` (带透明度)
- **RGB**: `rgb(255, 107, 107)`, `rgba(255, 107, 107, 0.8)`
- **HSL**: `hsl(0, 100%, 71%)`, `hsla(0, 100%, 71%, 0.8)`
- **HSV**: `hsv(0, 58%, 100%)`, `hsva(0, 58%, 100%, 0.8)`

## 使用示例

### 不同颜色模式

```vue
<template>
  <div class="space-y-4">
    <ColorPicker v-model="hexColor" mode="hex" />
    <ColorPicker v-model="rgbColor" mode="rgb" />
    <ColorPicker v-model="hslColor" mode="hsl" />
    <ColorPicker v-model="hsvColor" mode="hsv" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hexColor = ref('#ff6b6b')
const rgbColor = ref('rgb(255, 107, 107)')
const hslColor = ref('hsl(0, 100%, 71%)')
const hsvColor = ref('hsv(0, 58%, 100%)')
</script>
```

### 自定义预设颜色

```vue
<template>
  <ColorPicker 
    v-model="color"
    :presets="customPresets"
  />
</template>

<script setup>
import { ref } from 'vue'

const color = ref('#ff6b6b')
const customPresets = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
]
</script>
```

### 禁用透明度和预设

```vue
<template>
  <ColorPicker 
    v-model="color"
    :show-alpha="false"
    :show-presets="false"
  />
</template>
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

### 监听颜色变化

```vue
<template>
  <ColorPicker 
    v-model="color"
    @change="handleColorChange"
  />
</template>

<script setup>
import { ref } from 'vue'

const color = ref('#ff6b6b')

function handleColorChange(value, mode) {
  console.log(`颜色变化: ${value}, 模式: ${mode}`)
}
</script>
```

## 样式自定义

组件使用 Tailwind CSS 构建，支持通过以下方式自定义样式：

### 1. 通过 class 属性

```vue
<ColorPicker
  v-model="color"
  class="rounded-lg shadow-lg"
/>
```

### 2. 通过 CSS 变量

```css
:root {
  --color-primary: #your-primary-color;
  --color-border: #your-border-color;
  --color-background: #your-background-color;
}
```

## 工具函数

组件提供了一系列颜色转换工具函数：

```typescript
import { 
  parseColor,
  formatColor,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToHex,
  hexToRgb,
  isValidColor
} from '@/components/color-picker/utils'

// 解析颜色字符串
const colorState = parseColor('#ff6b6b')

// 格式化颜色输出
const hexColor = formatColor(colorState, 'hex')
const rgbColor = formatColor(colorState, 'rgb')

// 颜色格式转换
const hsl = rgbToHsl({ r: 255, g: 107, b: 107 })
const rgb = hslToRgb({ h: 0, s: 100, l: 71 })

// 验证颜色格式
const isValid = isValidColor('#ff6b6b') // true
```

## 注意事项

1. 组件基于 Vue 3 Composition API 开发
2. 使用 TypeScript 提供完整的类型支持
3. 样式基于 Tailwind CSS 构建
4. 使用 `cn` 工具函数合并类名
5. 依赖 reka-ui 的 Popover 和原生 Slider 组件
6. 色相和透明度滑块使用 reka-ui 的原生 Slider 组件
7. 支持键盘导航和无障碍访问
8. 自动处理颜色格式转换和验证
9. 已修复透明度滑块导致颜色变黑的问题
10. 优化了颜色状态更新逻辑，避免精度丢失

## 依赖要求

确保项目中已安装以下依赖：

```bash
npm install clsx tailwind-merge reka-ui
```

并且已配置 Tailwind CSS 和相应的组件依赖（Input、Button、Popover 等）。

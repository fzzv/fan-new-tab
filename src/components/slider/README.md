# Slider 滑块组件

基于 reka-ui 和项目主题的滑块组件，支持单值和范围选择，提供丰富的配置选项和优雅的视觉效果。

## 特性

- 🎯 支持单值和范围选择
- 📐 支持水平和垂直方向
- 🎨 多种尺寸和样式变体
- ♿ 完整的键盘导航支持
- 🎭 平滑的动画效果和交互反馈
- 🌙 支持暗色模式
- 🔧 丰富的配置选项
- 📱 触摸设备友好

## 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@/components/slider'

const value = ref([50])
</script>

<template>
  <Slider v-model="value" :min="0" :max="100" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `number[]` | - | 当前值，支持 v-model |
| `defaultValue` | `number[]` | - | 默认值（非受控模式） |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| `inverted` | `boolean` | `false` | 是否反向 |
| `minStepsBetweenThumbs` | `number` | `0` | 多个滑块之间的最小步数 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `variant` | `'default' \| 'secondary'` | `'default'` | 样式变体 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: number[])` | 值变化时触发 |
| `valueCommit` | `(value: number[])` | 拖拽结束时触发 |

## 使用示例

### 单值滑块

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@/components/slider'

const singleValue = ref([50])
</script>

<template>
  <div>
    <p>当前值: {{ singleValue[0] }}</p>
    <Slider v-model="singleValue" :min="0" :max="100" />
  </div>
</template>
```

### 范围滑块

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@/components/slider'

const rangeValue = ref([25, 75])
</script>

<template>
  <div>
    <p>范围: {{ rangeValue[0] }} - {{ rangeValue[1] }}</p>
    <Slider 
      v-model="rangeValue" 
      :min="0" 
      :max="100" 
      :min-steps-between-thumbs="5" 
    />
  </div>
</template>
```

### 垂直滑块

```vue
<template>
  <div class="h-48">
    <Slider 
      :default-value="[30]" 
      :min="0" 
      :max="100" 
      orientation="vertical"
      class="h-full"
    />
  </div>
</template>
```

### 不同尺寸

```vue
<template>
  <div class="space-y-4">
    <!-- 小尺寸 -->
    <Slider :default-value="[30]" size="sm" />
    
    <!-- 中等尺寸（默认） -->
    <Slider :default-value="[50]" size="md" />
    
    <!-- 大尺寸 -->
    <Slider :default-value="[70]" size="lg" />
  </div>
</template>
```

### 不同变体

```vue
<template>
  <div class="space-y-4">
    <!-- 默认变体（主色调） -->
    <Slider :default-value="[40]" variant="default" />
    
    <!-- 次要变体 -->
    <Slider :default-value="[60]" variant="secondary" />
  </div>
</template>
```

### 自定义步长

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@/components/slider'

const stepValue = ref([20])
</script>

<template>
  <div>
    <p>当前值: {{ stepValue[0] }} (步长: 10)</p>
    <Slider v-model="stepValue" :min="0" :max="100" :step="10" />
  </div>
</template>
```

### 禁用状态

```vue
<template>
  <Slider :default-value="[60]" :min="0" :max="100" disabled />
</template>
```

### 事件处理

```vue
<script setup>
import { Slider } from '@/components/slider'

const handleValueChange = (value: number[]) => {
  console.log('值变化:', value)
}

const handleValueCommit = (value: number[]) => {
  console.log('拖拽结束:', value)
  // 可以在这里保存到后端
}
</script>

<template>
  <Slider 
    :default-value="[50]" 
    :min="0" 
    :max="100"
    @update:model-value="handleValueChange"
    @value-commit="handleValueCommit"
  />
</template>
```

## 样式定制

组件使用项目的主题系统，支持以下 CSS 变量：

- `--primary`: 主色调（滑块范围和焦点环）
- `--secondary`: 次要色调
- `--background`: 背景色（滑块按钮）
- `--muted`: 静音色（轨道背景）
- `--border`: 边框色

## 键盘导航

| 按键 | 功能 |
|------|------|
| `←` / `→` | 水平方向调整值 |
| `↑` / `↓` | 垂直方向调整值 |
| `Page Up` / `Page Down` | 大步长调整 |
| `Home` / `End` | 跳转到最小/最大值 |
| `Shift + ↑/↓` | 大步长调整 |

## 注意事项

1. 垂直滑块需要设置容器高度
2. 范围滑块需要传入包含两个值的数组
3. `valueCommit` 事件适合用于保存最终值到后端
4. 组件会自动处理触摸设备的交互
5. 支持 RTL（从右到左）布局

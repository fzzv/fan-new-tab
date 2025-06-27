# ColorPicker 使用示例

## 快速开始

### 1. 导入组件

```typescript
import { ColorPicker } from '@/components/color-picker'
// 或者
import ColorPicker from '@/components/color-picker/ColorPicker.vue'
```

### 2. 基础使用

```vue
<template>
  <div>
    <ColorPicker v-model="selectedColor" />
    <p>选中的颜色: {{ selectedColor }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@/components/color-picker'

const selectedColor = ref('#ff6b6b')
</script>
```

### 3. 完整配置示例

```vue
<template>
  <div class="space-y-4">
    <!-- 基础用法 -->
    <ColorPicker v-model="color1" />
    
    <!-- RGB 模式 -->
    <ColorPicker 
      v-model="color2" 
      mode="rgb"
      @change="handleColorChange"
    />
    
    <!-- 自定义配置 -->
    <ColorPicker 
      v-model="color3"
      mode="hsl"
      size="lg"
      :show-alpha="false"
      :presets="customPresets"
      @change="handleColorChange"
    />
    
    <!-- 禁用状态 -->
    <ColorPicker 
      v-model="color4"
      disabled
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@/components/color-picker'
import type { ColorMode } from '@/components/color-picker/types'

const color1 = ref('#ff6b6b')
const color2 = ref('rgb(255, 107, 107)')
const color3 = ref('hsl(0, 100%, 71%)')
const color4 = ref('#cccccc')

const customPresets = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
]

function handleColorChange(value: string, mode: ColorMode) {
  console.log(`颜色变化: ${value}, 模式: ${mode}`)
}
</script>
```

## 在表单中使用

```vue
<template>
  <form @submit="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">
        主题颜色
      </label>
      <ColorPicker 
        v-model="formData.primaryColor"
        mode="hex"
        size="md"
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium mb-2">
        背景颜色 (支持透明度)
      </label>
      <ColorPicker 
        v-model="formData.backgroundColor"
        mode="rgba"
        :show-alpha="true"
      />
    </div>
    
    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
      保存设置
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@/components/color-picker'

const formData = ref({
  primaryColor: '#3b82f6',
  backgroundColor: 'rgba(255, 255, 255, 0.9)'
})

function handleSubmit(event: Event) {
  event.preventDefault()
  console.log('表单数据:', formData.value)
}
</script>
```

## 与其他组件结合

```vue
<template>
  <div class="p-6 space-y-6">
    <!-- 颜色主题设置 -->
    <div class="border rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-4">主题设置</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">主色调</label>
          <ColorPicker v-model="theme.primary" mode="hex" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">辅助色</label>
          <ColorPicker v-model="theme.secondary" mode="hex" />
        </div>
      </div>
    </div>
    
    <!-- 实时预览 -->
    <div class="border rounded-lg p-4" :style="previewStyle">
      <h3 class="text-lg font-semibold mb-2">预览效果</h3>
      <p>这是使用当前主题颜色的预览区域</p>
      <button 
        class="mt-2 px-4 py-2 rounded"
        :style="buttonStyle"
      >
        示例按钮
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ColorPicker } from '@/components/color-picker'

const theme = ref({
  primary: '#3b82f6',
  secondary: '#64748b'
})

const previewStyle = computed(() => ({
  backgroundColor: theme.value.secondary + '20', // 添加透明度
  borderColor: theme.value.primary
}))

const buttonStyle = computed(() => ({
  backgroundColor: theme.value.primary,
  color: 'white'
}))
</script>
```

## 工具函数使用

```typescript
import { 
  parseColor, 
  formatColor, 
  isValidColor,
  rgbToHsl,
  hslToRgb 
} from '@/components/color-picker/utils'

// 解析颜色
const colorState = parseColor('#ff6b6b')
console.log(colorState)
// {
//   rgb: { r: 255, g: 107, b: 107, a: 1 },
//   hsl: { h: 0, s: 100, l: 71, a: 1 },
//   hsv: { h: 0, s: 58, v: 100, a: 1 },
//   hex: '#ff6b6b',
//   alpha: 1
// }

// 格式化输出
const hexColor = formatColor(colorState, 'hex')     // '#ff6b6b'
const rgbColor = formatColor(colorState, 'rgb')     // 'rgb(255, 107, 107)'
const hslColor = formatColor(colorState, 'hsl')     // 'hsl(0, 100%, 71%)'

// 验证颜色
console.log(isValidColor('#ff6b6b'))    // true
console.log(isValidColor('invalid'))    // false

// 颜色转换
const hsl = rgbToHsl({ r: 255, g: 107, b: 107 })
const rgb = hslToRgb({ h: 0, s: 100, l: 71 })
```

## 注意事项

1. 确保项目中已安装必要的依赖：`clsx`, `tailwind-merge`, `reka-ui`
2. 组件依赖 Tailwind CSS，确保已正确配置
3. 使用 TypeScript 时，导入相关类型定义
4. 组件支持 v-model 双向绑定
5. 所有颜色格式都会自动转换和验证

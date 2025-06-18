# Image 组件

一个功能完整的图片显示组件，支持错误处理、占位符、预览功能等。

## 特性

- ✅ 图片加载失败时自动显示默认图片
- ✅ 支持加载占位符
- ✅ 支持图片预览功能（点击放大、缩放、拖拽）
- ✅ 遵循项目主题系统
- ✅ 支持自定义预览遮罩
- ✅ 完整的 TypeScript 支持
- ✅ 防止图片切换时的闪烁问题
- ✅ 平滑的加载状态过渡

## 基础用法

```vue
<script setup lang="ts">
import { Image } from '@/components/image'
</script>

<template>
  <!-- 基础用法 -->
  <Image
    src="https://example.com/image.jpg"
    alt="示例图片"
    width="200"
    height="150"
  />

  <!-- 带占位符 -->
  <Image
    src="https://example.com/image.jpg"
    alt="示例图片"
    :placeholder="true"
    width="200"
    height="150"
  />

  <!-- 禁用预览 -->
  <Image
    src="https://example.com/image.jpg"
    alt="示例图片"
    :preview="false"
  />
</template>
```

## API

### Image Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | - |
| alt | 图像描述 | `string` | `''` |
| fallback | 加载失败容错地址 | `string` | `'/src/assets/page-not-found.png'` |
| width | 图像宽度 | `string \| number` | - |
| height | 图像高度 | `string \| number` | - |
| placeholder | 加载占位, 为 true 时使用默认占位 | `boolean \| slot` | `false` |
| preview | 预览参数，为 false 时禁用 | `boolean \| PreviewType` | `true` |
| previewMask | 自定义 mask | `false \| function \| slot` | `true` |

### Image Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| error | 加载错误回调 | `(event: Event) => void` |

### PreviewType

```typescript
interface PreviewType {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  getContainer?: () => HTMLElement
  mask?: boolean | (() => string)
  maskClosable?: boolean
  zIndex?: number
}
```

## 插槽

### placeholder

自定义加载占位符内容。

```vue
<Image src="https://example.com/image.jpg" :placeholder="true">
  <template #placeholder>
    <div class="flex items-center justify-center">
      <Icon name="loading" class="animate-spin" />
      <span class="ml-2">加载中...</span>
    </div>
  </template>
</Image>
```

### previewMask

自定义预览遮罩内容。

```vue
<Image src="https://example.com/image.jpg">
  <template #previewMask>
    <div class="text-white">
      <Icon name="zoom-in" />
      <span class="ml-1">查看大图</span>
    </div>
  </template>
</Image>
```

## 高级用法

### 自定义预览配置

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Image } from '@/components/image'

const previewVisible = ref(false)

const previewConfig = {
  visible: previewVisible.value,
  onVisibleChange: (visible: boolean) => {
    previewVisible.value = visible
  },
  maskClosable: true,
  zIndex: 2000
}
</script>

<template>
  <Image
    src="https://example.com/image.jpg"
    alt="自定义预览"
    :preview="previewConfig"
  />
</template>
```

### 错误处理

```vue
<script setup lang="ts">
import { Image } from '@/components/image'

const handleError = (event: Event) => {
  console.error('图片加载失败:', event)
  // 可以在这里添加错误上报逻辑
}
</script>

<template>
  <Image
    src="https://example.com/invalid-image.jpg"
    alt="可能失败的图片"
    fallback="/src/assets/page-not-found.png"
    @error="handleError"
  />
</template>
```

## 预览功能

图片预览支持以下操作：

- **点击图片**: 打开预览
- **鼠标滚轮**: 缩放图片
- **拖拽**: 移动图片位置
- **工具栏按钮**: 放大、缩小、重置、关闭
- **ESC 键**: 关闭预览
- **点击遮罩**: 关闭预览（可配置）

## 样式定制

组件使用项目的主题系统，支持明暗模式切换。可以通过 CSS 变量进行样式定制：

```css
:root {
  --muted: #aeaeae;
  --muted-foreground: #5a5a5a;
  --border: #000;
}
```

## 注意事项

1. 确保 `fallback` 图片路径正确且可访问
2. 预览功能会阻止页面滚动，组件会在关闭时自动恢复
3. 大图片可能影响性能，建议适当控制图片尺寸
4. 组件会自动处理图片加载状态，无需手动管理
5. 组件已优化防止图片切换时的闪烁问题
6. 支持原图和 fallback 图片的独立加载状态管理

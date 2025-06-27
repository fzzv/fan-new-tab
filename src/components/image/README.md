# N-Image 组件

基于 Naive UI 设计理念实现的 Vue 3 图片组件库，包含 Image、ImageGroup、ImagePreview 三个组件。

## 组件特性

### Image 组件
- ✅ 基础图片显示
- ✅ 懒加载支持
- ✅ 内置预览功能（无需额外引入 ImagePreview）
- ✅ 错误处理和回退图片
- ✅ 多种对象适应方式
- ✅ 加载状态显示
- ✅ 自定义尺寸
- ✅ 智能预览模式（单独使用时内置预览，在图片组中使用组预览）
- ✅ Mask 蒙层插槽（hover显示，支持自定义内容和操作按钮）

### ImageGroup 组件
- ✅ 图片组管理
- ✅ 统一预览控制
- ✅ 自动索引管理
- ✅ 键盘导航支持

### ImagePreview 组件
- ✅ 全屏预览
- ✅ 缩放功能（鼠标滚轮 + 工具栏）
- ✅ 旋转功能
- ✅ 翻转功能
- ✅ 拖拽移动
- ✅ 键盘快捷键
- ✅ 多图切换
- ✅ 工具栏控制

## 安装使用

```typescript
import { Image, ImageGroup, ImagePreview } from '@/components/image'
```

## 基础用法

### 单个图片

```vue
<template>
  <!-- 基础用法 -->
  <Image
    src="https://example.com/image.jpg"
    alt="示例图片"
    width="300"
    height="200"
  />

  <!-- 带预览功能（内置预览组件） -->
  <Image
    src="https://example.com/image.jpg"
    alt="可预览图片"
    :preview="true"
    :lazy="true"
    width="300"
    height="200"
  />
</template>
```

> **注意**：当设置 `preview="true"` 时，Image 组件会自动内置 ImagePreview 组件，无需额外引入。

## 预览行为说明

Image 组件的预览功能具有智能行为：

1. **单独使用时**：当 Image 组件设置 `preview="true"` 且不在 ImageGroup 中时，会使用内置的 ImagePreview 组件
2. **在图片组中使用时**：当 Image 组件在 ImageGroup 中时，会自动使用 ImageGroup 的统一预览功能
3. **手动控制预览**：可以单独使用 ImagePreview 组件来实现完全自定义的预览控制

这种设计让使用者可以：
- 简单场景下无需关心预览组件的引入和管理
- 复杂场景下仍有完全的控制权

### Mask 蒙层插槽

Image 组件支持 mask 插槽，可以在 hover 时显示自定义内容：

```vue
<template>
  <!-- 基础预览功能 -->
  <Image
    src="/path/to/image.jpg"
    :preview="true"
    width="300"
    height="200"
  />

  <!-- 自定义 mask 内容 -->
  <Image
    src="/path/to/image.jpg"
    width="300"
    height="200"
  >
    <template #mask>
      <div class="flex items-center gap-4 text-white">
        <button @click="handleDownload">
          <Icon icon="material-symbols:download-rounded" />
        </button>
        <button @click="handleEdit">
          <Icon icon="material-symbols:edit-outline" />
        </button>
      </div>
    </template>
  </Image>

  <!-- 自定义 mask 背景色 -->
  <Image
    src="/path/to/image.jpg"
    :preview="true"
    mask-background="rgba(255, 0, 0, 0.3)"
    width="300"
    height="200"
  />

  <!-- 禁用 mask -->
  <Image
    src="/path/to/image.jpg"
    :preview="true"
    :show-mask="false"
    width="300"
    height="200"
  />
</template>
```

### 图片组

```vue
<template>
  <ImageGroup>
    <Image
      v-for="(img, index) in images"
      :key="index"
      :src="img.src"
      :alt="img.alt"
      :preview="true"
      width="200"
      height="150"
    />
  </ImageGroup>
</template>
```

> **注意**：在 ImageGroup 中的 Image 组件会自动使用 ImageGroup 的预览功能，不会显示单独的预览组件。

### 独立预览组件

当需要程序化控制预览或预览多张图片时，可以单独使用 ImagePreview 组件：

```vue
<template>
  <button @click="showPreview = true">打开预览</button>

  <ImagePreview
    v-model:show="showPreview"
    v-model:current="currentIndex"
    :src="imageList"
    @close="showPreview = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ImagePreview } from '@/components/image'

const showPreview = ref(false)
const currentIndex = ref(0)
const imageList = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
]
</script>
```

## API 文档

### Image Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | string | - | 图片地址 |
| alt | string | - | 图片描述 |
| width | string \| number | - | 图片宽度 |
| height | string \| number | - | 图片高度 |
| lazy | boolean | false | 是否懒加载 |
| preview | boolean | false | 是否可预览 |
| previewSrc | string | - | 预览时的图片地址 |
| fallbackSrc | string | - | 加载失败时的回退图片 |
| objectFit | string | 'cover' | 对象适应方式 |
| showToolbar | boolean | true | 是否显示工具栏 |
| showToolbarTooltip | boolean | true | 是否显示工具栏提示 |
| showMask | boolean | true | 是否显示mask蒙层 |
| maskBackground | string | 'rgba(0, 0, 0, 0.5)' | mask蒙层背景色 |
| imgClass | string | - | 图片的样式类 |
| imgProps | object | - | img 元素的原生属性 |

### Image Slots

| 插槽 | 说明 |
|------|------|
| mask | 自定义mask蒙层内容，hover时显示 |

### Image Events

| 事件 | 参数 | 说明 |
|------|------|------|
| load | (e: Event) | 图片加载完成 |
| error | (e: Event) | 图片加载失败 |
| preview | () | 点击预览 |

### ImageGroup Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showToolbar | boolean | true | 是否显示工具栏 |
| showToolbarTooltip | boolean | true | 是否显示工具栏提示 |

### ImageGroup Events

| 事件 | 参数 | 说明 |
|------|------|------|
| preview-prev | (current: number) | 预览上一张 |
| preview-next | (current: number) | 预览下一张 |

### ImagePreview Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | boolean | false | 是否显示 |
| src | string \| string[] | - | 图片地址或地址列表 |
| current | number | 0 | 当前预览的图片索引 |
| showToolbar | boolean | true | 是否显示工具栏 |
| showToolbarTooltip | boolean | true | 是否显示工具栏提示 |

### ImagePreview Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:show | (value: boolean) | 更新显示状态 |
| update:current | (value: number) | 更新当前索引 |
| close | () | 关闭预览 |
| change | (current: number) | 切换图片 |
| prev | () | 上一张 |
| next | () | 下一张 |

### ImagePreview Methods

| 方法 | 说明 |
|------|------|
| reset() | 重置图片状态 |
| zoomIn() | 放大 |
| zoomOut() | 缩小 |
| rotateClockwise() | 顺时针旋转 |
| rotateCounterclockwise() | 逆时针旋转 |
| flipHorizontal() | 水平翻转 |
| flipVertical() | 垂直翻转 |
| prev() | 上一张 |
| next() | 下一张 |
| close() | 关闭预览 |

## 键盘快捷键

在图片预览模式下支持以下快捷键：

- `Escape` - 关闭预览
- `←` / `→` - 切换图片
- `+` / `=` - 放大
- `-` - 缩小
- `0` - 重置

## 样式自定义

组件使用 Tailwind CSS 构建，支持通过以下方式自定义样式：

### 1. 通过 class 属性
```vue
<Image
  src="image.jpg"
  class="rounded-lg shadow-lg border-2 border-primary"
/>
```

### 2. 通过 Tailwind 配置
在 `tailwind.config.js` 中自定义主题变量：

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        muted: '#your-muted-color',
        // ...
      }
    }
  }
}
```

### 3. 覆盖组件样式
使用 CSS 变量或直接覆盖 Tailwind 类：

```css
/* 自定义预览遮罩透明度 */
.n-image-preview {
  @apply bg-black/90;
}

/* 自定义工具栏样式 */
.n-image-preview__toolbar {
  @apply bg-white/20 backdrop-blur-sm;
}
```

## 注意事项

1. 组件基于 Vue 3 Composition API 开发
2. 使用 TypeScript 提供完整的类型支持
3. 样式基于 Tailwind CSS 构建，需要项目中配置 Tailwind
4. 使用 `cn` 工具函数合并类名，需要安装 `clsx` 和 `tailwind-merge`
5. 懒加载功能依赖 Intersection Observer API
6. 预览功能使用 Teleport 渲染到 body
7. 支持响应式设计，在移动端也有良好体验
8. **Image 组件内置预览功能**：设置 `preview="true"` 时会自动包含 ImagePreview 组件
9. **智能预览模式**：单独使用时显示内置预览，在 ImageGroup 中使用组预览

## 依赖要求

```bash
npm install clsx tailwind-merge
```

确保项目中已配置 Tailwind CSS 和相应的 CSS 变量。

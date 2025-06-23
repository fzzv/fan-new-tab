# 优化后的Image组件

基于Ant Design Vue的Image组件设计理念，提供了功能丰富、性能优化的图片展示和预览解决方案。

## 主要特性

### 🚀 性能优化
- **懒加载支持**: 使用Intersection Observer API实现高性能懒加载
- **渐进式加载**: 支持占位符和加载状态显示
- **错误处理**: 完善的fallback机制和错误状态处理

### 🎨 丰富的预览功能
- **缩放控制**: 支持鼠标滚轮、按钮和键盘缩放，按钮缩放以图片中心为基准，滚轮缩放以鼠标位置为基准
- **拖拽移动**: 可拖拽移动图片位置
- **旋转翻转**: 支持90度旋转和水平/垂直翻转
- **键盘导航**: 完整的键盘快捷键支持
- **工具栏**: 丰富的操作工具栏，支持下载等功能

### 🔄 多图片预览组
- **组预览**: 支持多图片组合预览
- **导航控制**: 上一张/下一张导航
- **计数显示**: 当前图片位置显示
- **键盘导航**: 方向键切换图片

### ♿ 无障碍支持
- **ARIA标签**: 完整的无障碍标签支持
- **键盘导航**: 支持Tab和方向键导航
- **屏幕阅读器**: 友好的屏幕阅读器支持

## 组件API

### Image组件

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | string | - | 图片地址 |
| alt | string | '' | 图片描述 |
| fallback | string | - | 加载失败时的备用图片 |
| width | string \| number | - | 图片宽度 |
| height | string \| number | - | 图片高度 |
| placeholder | boolean \| string | true | 占位符，true显示默认占位符，string显示自定义文本 |
| preview | boolean \| PreviewType | true | 预览配置 |
| previewMask | boolean \| (() => string) | true | 预览遮罩 |
| lazy | boolean | false | 是否启用懒加载 |
| crossOrigin | 'anonymous' \| 'use-credentials' | - | CORS设置 |
| loading | 'eager' \| 'lazy' | 'lazy' | 原生loading属性 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| load | (event: Event) | 图片加载成功 |
| error | (event: Event) | 图片加载失败 |
| click | (event: Event) | 图片点击 |
| preview | (event: Event) | 预览触发 |

### ImagePreviewGroup组件

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| preview | boolean \| PreviewGroupType | true | 预览配置 |
| items | string[] \| ImageItem[] | [] | 预设图片列表 |
| fallback | string | - | 加载失败时的备用图片 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | (current: number, prev: number) | 当前图片切换 |
| visibleChange | (visible: boolean, prevVisible: boolean, current: number) | 预览可见性变化 |

### PreviewType配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | string | - | 自定义预览图片地址 |
| visible | boolean | - | 预览可见性（受控模式） |
| maskClosable | boolean | true | 点击遮罩是否关闭 |
| zIndex | number | 1000 | 预览层级 |
| scaleStep | number | 0.5 | 缩放步长 |
| minScale | number | 0.25 | 最小缩放比例 |
| maxScale | number | 50 | 最大缩放比例 |
| movable | boolean | true | 是否可拖拽移动 |
| destroyOnClose | boolean | false | 关闭时是否销毁 |

## 使用示例

### 基础用法

```vue
<template>
  <Image
    src="https://example.com/image.jpg"
    alt="示例图片"
    width="200"
    height="200"
  />
</template>
```

### 懒加载

```vue
<template>
  <Image
    src="https://example.com/large-image.jpg"
    alt="大图片"
    lazy
    placeholder="正在加载..."
  />
</template>
```

### 错误处理

```vue
<template>
  <Image
    src="https://invalid-url.com/image.jpg"
    fallback="https://example.com/fallback.jpg"
    alt="可能失败的图片"
    @error="handleError"
  />
</template>
```

### 自定义预览

```vue
<template>
  <Image
    src="https://example.com/thumb.jpg"
    :preview="{
      src: 'https://example.com/full-size.jpg',
      scaleStep: 0.3,
      minScale: 0.5,
      maxScale: 10,
    }"
    alt="自定义预览"
  />
</template>
```

### 图片预览组

```vue
<template>
  <ImagePreviewGroup @change="handleChange">
    <div class="image-grid">
      <Image
        v-for="(img, index) in images"
        :key="index"
        :src="img.src"
        :alt="img.alt"
      />
    </div>
  </ImagePreviewGroup>
</template>

<script setup>
const images = [
  { src: 'https://example.com/1.jpg', alt: '图片1' },
  { src: 'https://example.com/2.jpg', alt: '图片2' },
  { src: 'https://example.com/3.jpg', alt: '图片3' },
]

const handleChange = (current, prev) => {
  console.log(`从第${prev + 1}张切换到第${current + 1}张`)
}
</script>
```

## 缩放行为说明

### 缩放模式
- **按钮缩放**: 点击工具栏的放大/缩小按钮，以图片中心为基准进行缩放
- **键盘缩放**: 使用↑↓方向键，以图片中心为基准进行缩放
- **滚轮缩放**: 鼠标滚轮缩放，以鼠标当前位置为基准进行缩放
- **双击缩放**: 双击图片，以双击位置为基准进行2倍缩放，再次双击重置

### 缩放范围
- **最小缩放**: 25%（0.25倍）
- **最大缩放**: 5000%（50倍）
- **缩放步长**: 默认50%，可通过`scaleStep`配置

## 键盘快捷键

### 预览模式下
- `ESC`: 关闭预览
- `↑`: 放大（以中心为基准）
- `↓`: 缩小（以中心为基准）
- `←`: 左旋转 / 上一张（预览组）
- `→`: 右旋转 / 下一张（预览组）
- `R`: 重置变换
- `Home`: 跳转到第一张（预览组）
- `End`: 跳转到最后一张（预览组）

## 浏览器兼容性

- Chrome >= 51
- Firefox >= 55
- Safari >= 12.1
- Edge >= 15

## 注意事项

1. 懒加载功能需要浏览器支持Intersection Observer API
2. 某些变换功能可能在旧版浏览器中表现不一致
3. 大图片建议使用懒加载以提升页面性能
4. 预览组中的图片会自动注册，无需手动管理

## 更新日志

### v2.0.0
- ✨ 新增懒加载支持
- ✨ 新增图片预览组功能
- ✨ 新增旋转和翻转功能
- ✨ 新增键盘导航支持
- ✨ 新增下载功能
- ✨ 改进无障碍支持
- 🐛 修复多个已知问题
- 💄 优化UI和交互体验

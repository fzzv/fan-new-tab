<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'reka-ui'
import { cn } from '@/lib/utils'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import {
  parseColor,
  formatColor,
  rgbaToHsv,
  hsvToRgba,
  isValidColor,
  type RGBA,
  type ColorFormat,
} from '@/lib/colorUtils.ts'
import type { ColorPickerPanelProps, ColorPickerPanelEmits } from './types'

const props = withDefaults(defineProps<ColorPickerPanelProps>(), {
  modelValue: '#ffffff',
  mode: 'hex',
  showAlpha: true,
  disabled: false,
  presets: () => [],
  showPresets: false,
  showInput: true,
  showFormatSwitch: true,
  showPreview: false,
})

const emits = defineEmits<ColorPickerPanelEmits>()

const currentFormat = ref<ColorFormat>(props.mode)
const inputValue = ref('')
const isDragging = ref(false)
// 是否是更新色相滑块的值
const isSaturationBrightnessUpdate = ref(false)

// 解析当前颜色
const currentRgba = computed(() => {
  return parseColor(props.modelValue)
})

// 转换为 HSV
const currentHsv = computed(() => {
  return rgbaToHsv(currentRgba.value)
})

// 色相滑块值 (0-360)
const hueValue = ref([currentHsv.value.h])

// 透明度滑块值 (0-100)
const alphaValue = ref([Math.round(currentRgba.value.a * 100)])

// 饱和度/亮度面板的引用
const saturationPanelRef = ref<HTMLElement>()

// 当前饱和度和亮度
const saturation = ref(currentHsv.value.s)
const brightness = ref(currentHsv.value.v)

// 监听颜色变化，更新内部状态
watch(
  () => props.modelValue,
  (newValue) => {
    const rgba = parseColor(newValue)
    const hsv = rgbaToHsv(rgba)

    // 只有在非饱和度/亮度更新时才更新色相值
    if (!isSaturationBrightnessUpdate.value) {
      hueValue.value = [hsv.h]
    }

    alphaValue.value = [Math.round(rgba.a * 100)]
    saturation.value = hsv.s
    brightness.value = hsv.v

    updateInputValue()

    // 重置标志
    isSaturationBrightnessUpdate.value = false
  },
  { immediate: true },
)

// 监听格式变化
watch(
  () => props.mode,
  (newMode) => {
    currentFormat.value = newMode
    updateInputValue()
  },
  { immediate: true },
)

// 更新输入框值
function updateInputValue() {
  // 如果颜色有透明度且当前格式不支持透明度，则使用支持透明度的格式显示
  let displayFormat = currentFormat.value
  if (currentRgba.value.a < 1) {
    switch (currentFormat.value) {
      case 'hex':
        displayFormat = 'hex' // hex 格式会自动处理透明度
        break
      case 'rgb':
        displayFormat = 'rgba'
        break
      case 'hsl':
        displayFormat = 'hsla'
        break
      case 'hsv':
        displayFormat = 'hsva'
        break
    }
  }

  inputValue.value = formatColor(currentRgba.value, displayFormat)
}

// 触发颜色变化事件
const emitColorChange = (rgba: RGBA, isSaturationBrightness = false) => {
  // 如果是饱和度/亮度更新，设置标志
  if (isSaturationBrightness) {
    isSaturationBrightnessUpdate.value = true
  }

  // 如果颜色有透明度且当前格式不支持透明度，则使用支持透明度的格式
  let outputFormat = currentFormat.value
  if (rgba.a < 1) {
    switch (currentFormat.value) {
      case 'hex':
        outputFormat = 'hex' // hex 格式会自动处理透明度
        break
      case 'rgb':
        outputFormat = 'rgba'
        break
      case 'hsl':
        outputFormat = 'hsla'
        break
      case 'hsv':
        outputFormat = 'hsva'
        break
    }
  }

  const colorString = formatColor(rgba, outputFormat)
  emits('update:modelValue', colorString)
  emits('change', colorString, rgba)
}

// 处理色相滑块变化
const handleHueChange = (value: number[] | undefined) => {
  if (!value || value.length === 0) return

  const newHsv = {
    h: value[0],
    s: saturation.value,
    v: brightness.value,
    a: currentRgba.value.a,
  }
  const newRgba = hsvToRgba(newHsv)
  emitColorChange(newRgba)
}

// 处理透明度滑块变化
const handleAlphaChange = (value: number[] | undefined) => {
  if (!value || value.length === 0) return

  const newAlpha = value[0] / 100

  // 更新内部状态
  alphaValue.value = [value[0]]

  // 创建新的RGBA颜色，保持当前的RGB值，只更新透明度
  const newRgba = {
    ...currentRgba.value,
    a: newAlpha,
  }

  // 触发颜色变化事件
  emitColorChange(newRgba)
}

// 更新饱和度和亮度的通用函数
const updateSaturationBrightness = (event: MouseEvent | Touch) => {
  if (props.disabled) return

  const rect = saturationPanelRef.value?.getBoundingClientRect()
  if (!rect) return

  // 确保坐标在面板范围内
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
  const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top))

  // 计算新的饱和度和亮度值，并进行精度控制
  const newSaturation = Math.round((x / rect.width) * 100 * 100) / 100
  const newBrightness = Math.round((100 - (y / rect.height) * 100) * 100) / 100

  // 只有当值发生变化时才更新
  if (Math.abs(saturation.value - newSaturation) < 0.01 && Math.abs(brightness.value - newBrightness) < 0.01) {
    return
  }

  saturation.value = newSaturation
  brightness.value = newBrightness

  const newHsv = {
    h: hueValue.value[0],
    s: newSaturation,
    v: newBrightness,
    a: currentRgba.value.a,
  }
  const newRgba = hsvToRgba(newHsv)
  emitColorChange(newRgba, true)
}

// 处理饱和度/亮度面板点击
const handleSaturationPanelClick = (event: MouseEvent) => {
  updateSaturationBrightness(event)
}

// 处理饱和度/亮度面板鼠标按下
const handleSaturationPanelMouseDown = (event: MouseEvent) => {
  if (props.disabled) return

  isDragging.value = true
  updateSaturationBrightness(event)

  // 阻止默认行为和事件冒泡
  event.preventDefault()
  event.stopPropagation()

  // 添加全局鼠标事件监听，使用 passive: false 提高性能
  document.addEventListener('mousemove', handleMouseMove, { passive: false })
  document.addEventListener('mouseup', handleMouseUp, { passive: true })
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || props.disabled) return

  // 使用 requestAnimationFrame 优化渲染性能
  requestAnimationFrame(() => {
    updateSaturationBrightness(event)
  })

  event.preventDefault()
}

// 处理鼠标释放
const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

// 处理触摸开始
const handleSaturationPanelTouchStart = (event: TouchEvent) => {
  if (props.disabled) return

  isDragging.value = true
  const touch = event.touches[0]
  updateSaturationBrightness(touch)

  event.preventDefault()

  // 添加全局触摸事件监听
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
}

// 处理触摸移动
const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || props.disabled) return

  const touch = event.touches[0]

  // 使用 requestAnimationFrame 优化渲染性能
  requestAnimationFrame(() => {
    updateSaturationBrightness(touch)
  })

  event.preventDefault()
}

// 处理触摸结束
const handleTouchEnd = () => {
  if (isDragging.value) {
    isDragging.value = false

    // 移除全局事件监听
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
}

// 处理键盘事件
const handleSaturationPanelKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return

  const step = event.shiftKey ? 10 : 1 // Shift键加速
  let newSaturation = saturation.value
  let newBrightness = brightness.value

  switch (event.key) {
    case 'ArrowLeft':
      newSaturation = Math.max(0, saturation.value - step)
      break
    case 'ArrowRight':
      newSaturation = Math.min(100, saturation.value + step)
      break
    case 'ArrowUp':
      newBrightness = Math.min(100, brightness.value + step)
      break
    case 'ArrowDown':
      newBrightness = Math.max(0, brightness.value - step)
      break
    default:
      return // 不处理其他按键
  }

  event.preventDefault()

  saturation.value = newSaturation
  brightness.value = newBrightness

  const newHsv = {
    h: hueValue.value[0],
    s: newSaturation,
    v: newBrightness,
    a: currentRgba.value.a,
  }
  const newRgba = hsvToRgba(newHsv)
  emitColorChange(newRgba, true)
}

// 处理输入框变化
const handleInputChange = (value: string) => {
  if (isValidColor(value)) {
    const rgba = parseColor(value)
    const hsv = rgbaToHsv(rgba)

    hueValue.value = [hsv.h]
    alphaValue.value = [Math.round(rgba.a * 100)]
    saturation.value = hsv.s
    brightness.value = hsv.v

    emitColorChange(rgba)
  }
}

// 处理格式切换
const handleFormatChange = (format: ColorFormat) => {
  currentFormat.value = format
  updateInputValue()
  emits('format-change', format)
}

// 处理预设颜色选择
const handlePresetSelect = (color: string) => {
  const rgba = parseColor(color)
  const hsv = rgbaToHsv(rgba)

  hueValue.value = [hsv.h]
  alphaValue.value = [Math.round(rgba.a * 100)]
  saturation.value = hsv.s
  brightness.value = hsv.v

  emitColorChange(rgba)
  updateInputValue()
}

// 计算饱和度/亮度面板的背景
const saturationPanelBackground = computed(() => {
  const hue = hueValue.value[0]
  return `
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
  `
})

// 计算饱和度/亮度面板指示器位置
const saturationIndicatorStyle = computed(() => {
  return {
    left: `${saturation.value}%`,
    top: `${100 - brightness.value}%`,
  }
})

// 计算当前颜色的预览
const currentColorPreview = computed(() => {
  return formatColor(currentRgba.value, 'rgba')
})

// 计算色相滑块指示器的背景颜色
const hueThumbBackground = computed(() => {
  const hue = hueValue.value[0]
  return `hsl(${hue}, 100%, 50%)`
})

// 计算透明度滑块指示器的背景颜色
const alphaThumbBackground = computed(() => {
  const alpha = alphaValue.value[0] / 100
  return `rgba(${currentRgba.value.r}, ${currentRgba.value.g}, ${currentRgba.value.b}, ${alpha})`
})

// 初始化输入框值
updateInputValue()

// 组件卸载时清理事件监听器
onUnmounted(() => {
  // 清理鼠标事件
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 清理触摸事件
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<template>
  <div class="space-y-4">
    <!-- 饱和度/亮度面板 -->
    <div class="relative">
      <div
        ref="saturationPanelRef"
        :class="
          cn(
            'relative w-full h-48 rounded-md border-2 border-border select-none touch-none',
            'focus:outline-none',
            'cursor-crosshair',
          )
        "
        :style="{ background: saturationPanelBackground }"
        tabindex="0"
        role="slider"
        aria-label="选择颜色饱和度和亮度"
        :aria-valuetext="`饱和度 ${Math.round(saturation)}%, 亮度 ${Math.round(brightness)}%`"
        @click="handleSaturationPanelClick"
        @mousedown="handleSaturationPanelMouseDown"
        @touchstart="handleSaturationPanelTouchStart"
        @keydown="handleSaturationPanelKeyDown"
      >
        <!-- 指示器 -->
        <div
          :class="
            cn(
              'absolute border-2 border-white rounded-full pointer-events-none',
              'w-4 h-4 transform -translate-x-1/2 -translate-y-1/2',
            )
          "
          :style="saturationIndicatorStyle"
        >
          <!-- 内部圆点，显示当前颜色 -->
          <div class="absolute inset-0 rounded-full" :style="{ backgroundColor: currentColorPreview }" />
        </div>
      </div>
    </div>

    <!-- 色相滑块 -->
    <div class="space-y-2">
      <SliderRoot
        v-model="hueValue"
        :min="0"
        :max="360"
        :step="1"
        :disabled="disabled"
        class="relative flex w-full touch-none select-none items-center"
        @update:model-value="handleHueChange"
      >
        <SliderTrack class="relative h-3 w-full grow overflow-hidden rounded border-2 border-border">
          <!-- 色相背景渐变 -->
          <div
            class="absolute inset-0"
            style="
              background: linear-gradient(
                to right,
                #ff0000 0%,
                #ffff00 17%,
                #00ff00 33%,
                #00ffff 50%,
                #0000ff 67%,
                #ff00ff 83%,
                #ff0000 100%
              );
            "
          />
          <SliderRange class="absolute h-full bg-transparent" />
        </SliderTrack>
        <SliderThumb
          class="block h-4 w-4 rounded-full border-2 border-white shadow-sm focus:outline-none hover:translate-y-[1px] hover:shadow-none"
          :style="{ backgroundColor: hueThumbBackground }"
        />
      </SliderRoot>
    </div>

    <!-- 透明度滑块 -->
    <div v-if="showAlpha" class="space-y-2">
      <SliderRoot
        v-model="alphaValue"
        :min="0"
        :max="100"
        :step="1"
        :disabled="disabled"
        class="relative flex w-full touch-none select-none items-center"
        @update:model-value="handleAlphaChange"
      >
        <SliderTrack class="relative h-3 w-full grow overflow-hidden rounded border-2 border-border">
          <!-- 透明度背景 -->
          <div
            class="absolute inset-0"
            style="background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px"
          >
            <div
              class="absolute inset-0"
              :style="{
                background: `linear-gradient(to right, transparent, rgb(${currentRgba.r}, ${currentRgba.g}, ${currentRgba.b}))`,
              }"
            />
          </div>
          <SliderRange class="absolute h-full bg-transparent" />
        </SliderTrack>
        <SliderThumb
          class="block h-4 w-4 rounded-full border-2 border-white shadow-sm focus:outline-none hover:translate-y-[1px] hover:shadow-none"
          :style="{ backgroundColor: alphaThumbBackground }"
        />
      </SliderRoot>
    </div>

    <!-- 颜色值输入和格式切换 -->
    <div v-if="showInput" class="space-y-2">
      <div class="flex items-center justify-between">
        <div v-if="showFormatSwitch" class="flex gap-1">
          <Button
            v-for="format in ['hex', 'rgb', 'hsl', 'hsv'] as ColorFormat[]"
            :key="format"
            :variant="currentFormat === format ? 'default' : 'outline'"
            size="sm"
            class="px-2 py-1 text-xs"
            @click="handleFormatChange(format)"
          >
            {{ format.toUpperCase() }}
          </Button>
        </div>
      </div>
      <Input
        v-model="inputValue"
        :disabled="disabled"
        class="font-mono text-sm h-10"
        @blur="handleInputChange(inputValue)"
        @keydown.enter="handleInputChange(inputValue)"
      />
    </div>

    <!-- 预设颜色 -->
    <div v-if="showPresets && presets.length > 0" class="space-y-2">
      <div class="grid grid-cols-10 gap-2">
        <button
          v-for="preset in presets"
          :key="preset"
          :disabled="disabled"
          class="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
          :style="{ backgroundColor: preset }"
          @click="handlePresetSelect(preset)"
        />
      </div>
    </div>

    <!-- 当前颜色预览 -->
    <div v-if="showPreview" class="flex items-center gap-3 pt-2 border-t border-border">
      <div class="flex items-center gap-2">
        <div class="relative w-8 h-8 rounded border-2 border-border overflow-hidden">
          <!-- 透明度背景 -->
          <div
            class="absolute inset-0"
            style="background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 4px 4px"
          />
          <!-- 颜色预览 -->
          <div class="absolute inset-0" :style="{ backgroundColor: currentColorPreview }" />
        </div>
        <div class="text-muted-foreground font-mono text-xs">{{ inputValue }}</div>
      </div>
    </div>
  </div>
</template>

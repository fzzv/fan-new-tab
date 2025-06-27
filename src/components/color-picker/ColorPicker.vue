<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { cn } from '@/lib/utils'
import Input from '@/components/input/Input.vue'
import Button from '@/components/button/Button.vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from 'reka-ui'
import type { ColorMode, ColorPickerProps, ColorPickerEmits, ColorState } from './types'
import { parseColor, formatColor, isValidColor, DEFAULT_PRESETS, hsvToRgb, rgbToHex, rgbToHsl } from './utils'

const props = withDefaults(defineProps<ColorPickerProps>(), {
  mode: 'hex',
  showAlpha: true,
  showPresets: false,
  presets: () => DEFAULT_PRESETS,
  disabled: false,
  size: 'md',
  placement: 'bottom',
})

const emit = defineEmits<ColorPickerEmits>()

// 响应式状态
const isOpen = ref(false)
const currentMode = ref<ColorMode>(props.mode)
const colorState = ref<ColorState>(parseColor(props.modelValue || '#000000'))
const inputValue = ref('')

// DOM 引用
const saturationRef = ref<HTMLElement>()

// Slider 值
const hueValue = ref([0])
const alphaValue = ref([100])

// 拖拽状态
const isDragging = ref(false)

// 计算属性
const displayValue = computed(() => {
  return formatColor(colorState.value, currentMode.value)
})

const triggerStyle = computed(() => {
  const { rgb, alpha } = colorState.value
  return {
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
  }
})

const saturationStyle = computed(() => {
  const hue = colorState.value.hsv.h
  return {
    backgroundColor: `hsl(${hue}, 100%, 50%)`,
  }
})

const saturationPointerStyle = computed(() => {
  const { s, v } = colorState.value.hsv
  return {
    left: `${s}%`,
    top: `${100 - v}%`,
  }
})

// 同步 slider 值与颜色状态（避免循环更新）
let isUpdatingFromSlider = false

watch(
  () => colorState.value.hsv.h,
  (newHue) => {
    if (!isUpdatingFromSlider) {
      hueValue.value = [newHue]
    }
  },
  { immediate: true },
)

watch(
  () => colorState.value.alpha,
  (newAlpha) => {
    if (!isUpdatingFromSlider) {
      alphaValue.value = [Math.round(newAlpha * 100)]
    }
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== displayValue.value) {
      colorState.value = parseColor(newValue)
      inputValue.value = displayValue.value
    }
  },
  { immediate: true },
)

watch(displayValue, (newValue) => {
  inputValue.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue, currentMode.value)
})

function updateColorFromHsv(hsv: Partial<typeof colorState.value.hsv>) {
  const newHsv = { ...colorState.value.hsv, ...hsv }
  const newRgb = hsvToRgb(newHsv)
  newRgb.a = colorState.value.alpha

  // 直接更新颜色状态，避免重新解析导致的精度丢失
  colorState.value = {
    rgb: newRgb,
    hsl: rgbToHsl(newRgb),
    hsv: newHsv,
    hex: rgbToHex(newRgb),
    alpha: colorState.value.alpha,
  }
}

function handleSaturationChange(event: MouseEvent) {
  if (!saturationRef.value) return

  const rect = saturationRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))

  updateColorFromHsv({
    s: Math.round(x * 100),
    v: Math.round((1 - y) * 100),
  })
}

function handleHueSliderChange(value: number[]) {
  isUpdatingFromSlider = true
  updateColorFromHsv({
    h: value[0],
  })
  nextTick(() => {
    isUpdatingFromSlider = false
  })
}

function handleAlphaSliderChange(value: number[]) {
  isUpdatingFromSlider = true
  const newAlpha = value[0] / 100

  // 正确更新颜色状态，保持RGB值不变，只更新alpha
  const newRgb = { ...colorState.value.rgb, a: newAlpha }
  const newColorState = {
    ...colorState.value,
    rgb: newRgb,
    alpha: newAlpha
  }

  colorState.value = newColorState

  nextTick(() => {
    isUpdatingFromSlider = false
  })
}

function startDragging(handler: (event: MouseEvent) => void) {
  isDragging.value = true

  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault()
    handler(event)
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handlePresetClick(preset: string) {
  colorState.value = parseColor(preset)
}

function handleInputChange() {
  if (isValidColor(inputValue.value)) {
    colorState.value = parseColor(inputValue.value)
  }
}

function handleModeChange(mode: ColorMode) {
  currentMode.value = mode
}

// 尺寸样式
const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}
</script>

<template>
  <PopoverRoot v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button
        :disabled="disabled"
        :class="
          cn(
            'border-2 border-border rounded cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size],
            $props.class,
          )
        "
        :style="triggerStyle"
      >
        <span class="sr-only">选择颜色</span>
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="w-64 p-4 bg-background border-2 border-border shadow-lg rounded z-[3000] select-none"
        :side="placement"
        :side-offset="4"
      >
        <!-- 饱和度/亮度面板 -->
        <div
          ref="saturationRef"
          class="relative w-full h-32 mb-4 cursor-crosshair rounded border border-border overflow-hidden select-none"
          :style="saturationStyle"
          @mousedown="
            (e) => {
              handleSaturationChange(e)
              startDragging(handleSaturationChange)
            }
          "
        >
          <!-- 白色到透明渐变 -->
          <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
          <!-- 透明到黑色渐变 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <!-- 指针 -->
          <div
            class="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
            :style="saturationPointerStyle"
          ></div>
        </div>

        <!-- 色相滑块 -->
        <div class="mb-4">
          <div class="text-xs text-muted-foreground mb-2">色相</div>
          <div class="relative">
            <SliderRoot
              v-model="hueValue"
              :min="0"
              :max="360"
              :step="1"
              class="relative flex w-full touch-none select-none items-center"
              @update:modelValue="handleHueSliderChange"
            >
              <SliderTrack class="relative h-3 w-full grow overflow-hidden rounded border border-border">
                <!-- 色相背景 -->
                <div
                  class="absolute inset-0 rounded"
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
                ></div>
                <SliderRange class="absolute h-full bg-transparent" />
              </SliderTrack>
              <SliderThumb
                class="block h-4 w-4 rounded-full border-2 border-white bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              />
            </SliderRoot>
          </div>
        </div>

        <!-- 透明度滑块 -->
        <div v-if="showAlpha" class="mb-4">
          <div class="text-xs text-muted-foreground mb-2">透明度</div>
          <div class="relative">
            <SliderRoot
              v-model="alphaValue"
              :min="0"
              :max="100"
              :step="1"
              class="relative flex w-full touch-none select-none items-center"
              @update:modelValue="handleAlphaSliderChange"
            >
              <SliderTrack class="relative h-3 w-full grow overflow-hidden rounded border border-border">
                <!-- 透明度背景 -->
                <div
                  class="absolute inset-0 rounded"
                  style="background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                >
                  <div
                    class="absolute inset-0 rounded"
                    :style="{
                      background: `linear-gradient(to right, transparent, rgb(${colorState.rgb.r}, ${colorState.rgb.g}, ${colorState.rgb.b}))`,
                    }"
                  ></div>
                </div>
                <SliderRange class="absolute h-full bg-transparent" />
              </SliderTrack>
              <SliderThumb
                class="block h-4 w-4 rounded-full border-2 border-white bg-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              />
            </SliderRoot>
          </div>
        </div>

        <!-- 模式切换 -->
        <div class="flex gap-1 mb-3">
          <Button
            v-for="mode in ['hex', 'rgb', 'hsl', 'hsv']"
            :key="mode"
            size="sm"
            :variant="currentMode === mode ? 'default' : 'outline'"
            @click="handleModeChange(mode as ColorMode)"
          >
            {{ mode.toUpperCase() }}
          </Button>
        </div>

        <!-- 颜色值输入 -->
        <div class="mb-4">
          <Input
            v-model="inputValue"
            :placeholder="`输入 ${currentMode.toUpperCase()} 值`"
            class="h-10 py-2 font-mono"
            @blur="handleInputChange"
            @keydown.enter="handleInputChange"
          />
        </div>

        <!-- 预设颜色 -->
        <div v-if="showPresets && presets.length" class="space-y-2">
          <div class="text-sm font-medium text-foreground">预设颜色</div>
          <div class="grid grid-cols-8 gap-1">
            <button
              v-for="preset in presets"
              :key="preset"
              class="w-6 h-6 border border-border rounded cursor-pointer hover:scale-110 transition-transform"
              :style="{ backgroundColor: preset }"
              @click="handlePresetClick(preset)"
            >
              <span class="sr-only">{{ preset }}</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

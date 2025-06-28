<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from 'reka-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/button'
import { parseColor, formatColor } from '@/lib/colorUtils.ts'
import type { ClassValue } from 'clsx'
import type { ColorPickerProps, ColorPickerEmits } from './types'
import ColorPickerPanel from './ColorPickerPanel.vue'

const props = withDefaults(defineProps<ColorPickerProps>(), {
  modelValue: '#ffffff',
  mode: 'hex',
  showAlpha: true,
  disabled: false,
  presets: () => [],
  showPresets: false,
  showInput: true,
  showFormatSwitch: true,
  showPreview: false,
  placement: 'bottom-start',
})

const emits = defineEmits<ColorPickerEmits>()

// 弹出层
const popoverOpen = ref(false)

// 解析当前颜色
const currentRgba = computed(() => {
  return parseColor(props.modelValue)
})

// 处理面板颜色变化
const handlePanelModelValueChange = (value: string) => {
  emits('update:modelValue', value)
}

const handlePanelChange = (value: string, rgba: any) => {
  emits('change', value, rgba)
}

// 处理格式变化
const handleFormatChange = (format: any) => {
  emits('format-change', format)
}

// 计算当前颜色的预览
const currentColorPreview = computed(() => {
  return formatColor(currentRgba.value, 'rgba')
})
</script>

<template>
  <PopoverRoot v-model:open="popoverOpen">
    <PopoverTrigger>
      <Button
        :disabled="disabled"
        :class="cn('relative h-8 w-8', $attrs.class as ClassValue)"
        variant="outline"
        size="icon"
      >
        <!-- 透明度背景 -->
        <div
          class="absolute inset-0"
          style="background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px"
        />
        <!-- 颜色预览 -->
        <div class="absolute inset-0" :style="{ backgroundColor: currentColorPreview }" />
      </Button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        :class="
          cn(
            'z-[3000] w-80 p-4 bg-background border-2 border-border rounded-lg shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            popoverClass,
          )
        "
        :side="placement.split('-')[0] as any"
        :align="placement.includes('-') ? (placement.split('-')[1] as any) : 'center'"
        :side-offset="8"
        :collision-padding="8"
      >
        <ColorPickerPanel
          :model-value="modelValue"
          :mode="mode"
          :show-alpha="showAlpha"
          :disabled="disabled"
          :presets="presets"
          :show-presets="showPresets"
          :show-input="showInput"
          :show-format-switch="showFormatSwitch"
          :show-preview="showPreview"
          @update:model-value="handlePanelModelValueChange"
          @change="handlePanelChange"
          @format-change="handleFormatChange"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

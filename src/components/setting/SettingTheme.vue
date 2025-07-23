<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Label from '@/components/label/Label.vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/button'
import { ColorPicker } from '@/components/color-picker'
import { useSettings, type ThemeColorConfig } from '@/composables/useSettings'

interface SettingThemeProps {
  title?: string // 标题
}

withDefaults(defineProps<SettingThemeProps>(), {
  title: '主题颜色',
})

// 控制折叠面板的展开状态
const isThemeOpen = ref(true)

// 获取设置
const { themeColorConfig, setThemeColor, resetThemeColors, applyThemeColors } = useSettings()

// 主题颜色配置项
const themeColorItems = [
  {
    key: 'primary' as keyof ThemeColorConfig,
    label: '主要颜色',
    description: '按钮、链接等主要元素的颜色',
    icon: 'material-symbols:palette-outline',
  },
  {
    key: 'primaryHover' as keyof ThemeColorConfig,
    label: '主要颜色悬停',
    description: '主要元素悬停时的颜色',
    icon: 'material-symbols:touch-app-outline',
  },
  {
    key: 'primaryForeground' as keyof ThemeColorConfig,
    label: '主要前景色',
    description: '主要元素上的文字颜色',
    icon: 'material-symbols:text-fields-rounded',
  },
]

// 处理颜色变化
const handleColorChange = (colorType: keyof ThemeColorConfig, color: string) => {
  setThemeColor(colorType, color)
}

// 重置为默认颜色
const handleReset = () => {
  resetThemeColors()
}

// 组件挂载时应用主题颜色
onMounted(() => {
  applyThemeColors()
})
</script>

<template>
  <!-- 可折叠面板模式 -->
  <CollapsibleRoot v-model:open="isThemeOpen" class="w-full" variant="default" size="md">
    <CollapsibleTrigger variant="default" size="md" @click="isThemeOpen = !isThemeOpen">
      <div class="flex items-center gap-2">
        <Icon icon="material-symbols:palette-outline" width="20" height="20" />
        <span class="text-lg font-semibold">{{ title }}</span>
      </div>
      <template #expandIcon>
        <Icon v-if="isThemeOpen" icon="radix-icons:cross-2" class="h-4 w-4" />
        <Icon v-else icon="radix-icons:row-spacing" class="h-4 w-4" />
      </template>
    </CollapsibleTrigger>
    <CollapsibleContent variant="default" size="md">
      <div class="p-4 space-y-6">
        <!-- 主题颜色说明 -->
        <div class="p-3 bg-muted/50 rounded-lg">
          <p class="text-sm text-muted-foreground">自定义主题颜色，更改后会立即应用到整个应用界面。</p>
        </div>

        <!-- 颜色配置项 -->
        <div class="space-y-4">
          <div v-for="item in themeColorItems" :key="item.key" class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon :icon="item.icon" width="16" height="16" />
                <Label class="text-sm font-medium">{{ item.label }}</Label>
              </div>
              <div class="flex items-center gap-2">
                <!-- 颜色预览 -->
                <div
                  class="w-6 h-6 rounded border border-border shadow-sm"
                  :style="{ backgroundColor: themeColorConfig[item.key] }"
                />
                <!-- 颜色选择器 -->
                <ColorPicker
                  v-model="themeColorConfig[item.key]"
                  mode="hex"
                  :showAlpha="false"
                  :showPresets="true"
                  :showInput="true"
                  :showFormatSwitch="false"
                  @change="(color) => handleColorChange(item.key, color)"
                />
              </div>
            </div>
            <p class="text-xs text-muted-foreground ml-6">{{ item.description }}</p>
          </div>
        </div>

        <!-- 重置按钮 -->
        <div class="pt-4 border-t border-border">
          <Button variant="outline" size="sm" class="w-full justify-center" @click="handleReset">
            <Icon icon="material-symbols:refresh-rounded" width="16" height="16" />
            重置为默认颜色
          </Button>
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped></style>

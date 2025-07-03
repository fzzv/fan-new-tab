<script setup lang="ts">
import { ref, computed } from 'vue'
import Label from '@/components/label/Label.vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import { Slider } from '@/components/slider'
import { Switch } from '@/components/switch'
import { useSettings } from '@/composables/useSettings'

interface SettingSearchBarProps {
  title?: string // 标题
}

withDefaults(defineProps<SettingSearchBarProps>(), {
  title: '搜索框设置',
})

// 控制折叠面板的展开状态
const isSearchBarOpen = ref(true)

// 获取设置
const { searchBarConfig } = useSettings()

// 设置 CSS 变量值
const setCssVar = (varName: string, value: number) => {
  console.log(value, 'value')
  if (varName === '--search-width') {
    // 将 50-150 的值映射到 40vw-80vw
    const vwValue = 20 + value * 0.4 // 50->40vw, 150->80vw
    document.documentElement.style.setProperty(varName, `${vwValue}vw`)
  } else if (varName === '--search-height') {
    // 高度根据宽度自适应，基础高度60px，按比例调整
    const heightValue = 60 * (value / 100)
    document.documentElement.style.setProperty(varName, `${heightValue}px`)
  } else if (varName === '--search-radius') {
    document.documentElement.style.setProperty(varName, `${value}rem`)
  } else if (varName === '--search-opacity') {
    document.documentElement.style.setProperty(varName, (value / 100).toString())
  }
}

// 处理滑块值变化
const handleSizeChange = (value: number) => {
  const finalValue = Array.isArray(value) ? value[0] : value
  setCssVar('--search-width', finalValue)
  setCssVar('--search-height', finalValue)
}

const handleRadiusChange = (value: number) => {
  const finalValue = Array.isArray(value) ? value[0] : value
  setCssVar('--search-radius', finalValue)
}

const handleOpacityChange = (value: number) => {
  const finalValue = Array.isArray(value) ? value[0] : value
  setCssVar('--search-opacity', finalValue)
}

// 计算显示值
const computedSize = computed(() =>
  Array.isArray(searchBarConfig.value.size) ? searchBarConfig.value.size[0] : searchBarConfig.value.size,
)

const computedRadius = computed(() => {
  const value = Array.isArray(searchBarConfig.value.radius)
    ? searchBarConfig.value.radius[0]
    : searchBarConfig.value.radius
  return Math.round((value / 2) * 50) // 0-2rem 映射到 0-50%
})

const computedOpacity = computed(() =>
  Array.isArray(searchBarConfig.value.opacity) ? searchBarConfig.value.opacity[0] : searchBarConfig.value.opacity,
)
</script>

<template>
  <!-- 可折叠面板模式 -->
  <CollapsibleRoot v-model:open="isSearchBarOpen" class="w-full" variant="default" size="md">
    <CollapsibleTrigger variant="default" size="md" @click="isSearchBarOpen = !isSearchBarOpen">
      <div class="flex items-center gap-2">
        <Icon icon="material-symbols:search-rounded" width="20" height="20" />
        <span class="text-lg font-semibold">{{ title }}</span>
      </div>
      <template #expandIcon>
        <Icon v-if="isSearchBarOpen" icon="radix-icons:cross-2" class="h-4 w-4" />
        <Icon v-else icon="radix-icons:row-spacing" class="h-4 w-4" />
      </template>
    </CollapsibleTrigger>
    <CollapsibleContent variant="default" size="md">
      <div class="p-4 space-y-6">
        <!-- 搜索框显示设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">显示搜索框</Label>
            <Switch v-model="searchBarConfig.visible" />
          </div>
          <p class="text-xs text-muted-foreground">控制搜索框是否在页面中显示</p>
        </div>

        <!-- 搜索按钮显示设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">显示搜索按钮</Label>
            <Switch v-model="searchBarConfig.showSearchButton" />
          </div>
          <p class="text-xs text-muted-foreground">控制搜索框右侧的搜索按钮是否显示</p>
        </div>

        <!-- 搜索框大小设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">搜索框大小</Label>
            <span class="text-xs text-muted-foreground">{{ computedSize }}%</span>
          </div>
          <Slider
            v-model="searchBarConfig.size"
            :min="50"
            :max="150"
            :step="1"
            class="w-full"
            @update:modelValue="handleSizeChange"
          />
          <p class="text-xs text-muted-foreground">调整搜索框的大小，50%对应40vw宽度，150%对应80vw宽度</p>
        </div>

        <!-- 搜索框圆角设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">搜索框圆角</Label>
            <span class="text-xs text-muted-foreground">{{ computedRadius }}%</span>
          </div>
          <Slider
            v-model="searchBarConfig.radius"
            :min="0"
            :max="2"
            :step="0.02"
            class="w-full"
            @update:modelValue="handleRadiusChange"
          />
          <p class="text-xs text-muted-foreground">调整搜索框的圆角大小，0%为直角，50%为最大圆角</p>
        </div>

        <!-- 搜索框透明度设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">搜索框透明度</Label>
            <span class="text-xs text-muted-foreground">{{ computedOpacity }}%</span>
          </div>
          <Slider
            v-model="searchBarConfig.opacity"
            :min="0"
            :max="100"
            :step="1"
            class="w-full"
            @update:modelValue="handleOpacityChange"
          />
          <p class="text-xs text-muted-foreground">调整搜索框的透明度，0%为完全透明，100%为完全不透明</p>
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Label from '@/components/label/Label.vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import { Slider } from '@/components/slider'
import { useSettings } from '@/composables/useSettings'

// 组件属性
interface SettingBackgroundProps {
  collapsible?: boolean // 是否显示为可折叠面板
  title?: string // 标题
}

withDefaults(defineProps<SettingBackgroundProps>(), {
  collapsible: true,
  title: '背景设置',
})

// 控制折叠面板的展开状态
const isBackgroundOpen = ref(true)

// 获取设置
const { backgroundConfig, backgroundConfigReady } = useSettings()

const config = ref({
  blur: [0],
  opacity: [0],
})

// 设置 CSS 变量值
const setCssVar = (varName: string, value: number) => {
  if (varName === '--backdrop-filter-blur') {
    document.documentElement.style.setProperty(varName, `${value}px`)
  } else if (varName === '--background-mask-opacity') {
    document.documentElement.style.setProperty(varName, value.toString())
  }
}

onMounted(() => {
  backgroundConfigReady.then(() => (config.value = backgroundConfig.value))
})

// 处理滑块值变化
const handleBlurChange = (value: number[]) => {
  backgroundConfig.value.blur = value
  setCssVar('--backdrop-filter-blur', value[0])
}

const handleOpacityChange = (value: number[]) => {
  backgroundConfig.value.opacity = value
  setCssVar('--background-mask-opacity', value[0] / 100)
}
</script>

<template>
  <!-- 可折叠面板模式 -->
  <CollapsibleRoot v-if="collapsible" v-model:open="isBackgroundOpen" class="w-full" variant="default" size="md">
    <CollapsibleTrigger variant="default" size="md" @click="isBackgroundOpen = !isBackgroundOpen">
      <div class="flex items-center gap-2">
        <Icon icon="material-symbols:blur-on-outline" width="20" height="20" />
        <span class="text-lg font-semibold">{{ title }}</span>
      </div>
      <template #expandIcon>
        <Icon v-if="isBackgroundOpen" icon="radix-icons:cross-2" class="h-4 w-4" />
        <Icon v-else icon="radix-icons:row-spacing" class="h-4 w-4" />
      </template>
    </CollapsibleTrigger>
    <CollapsibleContent variant="default" size="md">
      <div class="p-4 space-y-6">
        <!-- 背景模糊度设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">背景模糊度</Label>
            <span class="text-xs text-muted-foreground">{{ config.blur[0] * 10 }}%</span>
          </div>
          <Slider v-model="config.blur" :min="0" :max="10" :step="0.1" class="w-full" @valueCommit="handleBlurChange" />
          <p class="text-xs text-muted-foreground">调整背景图片的模糊程度，数值越大越模糊</p>
        </div>

        <!-- 背景遮罩透明度设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">背景遮罩透明度</Label>
            <span class="text-xs text-muted-foreground">{{ config.opacity[0] }}%</span>
          </div>
          <Slider
            v-model="config.opacity"
            :min="0"
            :max="100"
            :step="1"
            class="w-full"
            @valueCommit="handleOpacityChange"
          />
          <p class="text-xs text-muted-foreground">调整背景遮罩的不透明度，数值越大背景越暗</p>
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>

  <!-- 直接显示模式 -->
  <div v-else class="space-y-6">
    <h3 v-if="title" class="text-lg font-semibold flex items-center gap-2">
      <Icon icon="material-symbols:blur-on-outline" width="20" height="20" />
      {{ title }}
    </h3>

    <!-- 背景模糊度设置 -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <Label class="text-sm font-medium">背景模糊度</Label>
        <span class="text-xs text-muted-foreground">{{ config.blur[0] }}px</span>
      </div>
      <Slider v-model="config.blur" :min="0" :max="100" :step="1" class="w-full" @change="handleBlurChange" />
      <p class="text-xs text-muted-foreground">调整背景图片的模糊程度，数值越大越模糊</p>
    </div>

    <!-- 背景遮罩透明度设置 -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <Label class="text-sm font-medium">背景遮罩透明度</Label>
        <span class="text-xs text-muted-foreground">{{ config.opacity[0] }}%</span>
      </div>
      <Slider v-model="config.opacity" :min="0" :max="100" :step="1" class="w-full" @change="handleOpacityChange" />
      <p class="text-xs text-muted-foreground">调整背景遮罩的不透明度，数值越大背景越暗</p>
    </div>
  </div>
</template>

<style scoped>
/* 确保滑块组件的样式正确显示 */
:deep(.slider-root) {
  position: relative;
}
</style>

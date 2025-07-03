<script setup lang="ts">
import { ref, computed } from 'vue'
import Label from '@/components/label/Label.vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import { Slider } from '@/components/slider'
import { useSettings } from '@/composables/useSettings'
import { Image } from '@/components/image'
import { Button } from '@/components/button'
import { downloadFileFromUrl, isColor } from '@/lib'
import { openWallpaperSelector } from '@/composables/useDialog.ts'

// 组件属性
interface SettingBackgroundProps {
  title?: string // 标题
}

withDefaults(defineProps<SettingBackgroundProps>(), {
  title: '背景设置',
})

// 控制折叠面板的展开状态
const isBackgroundOpen = ref(true)

// 获取设置
const { backgroundConfig } = useSettings()

// 设置 CSS 变量值
const setCssVar = (varName: string, value: number) => {
  if (varName === '--backdrop-filter-blur') {
    document.documentElement.style.setProperty(varName, `${value}px`)
  } else if (varName === '--background-mask-opacity') {
    document.documentElement.style.setProperty(varName, value.toString())
  }
}

// 处理滑块值变化
const handleBlurChange = (value: number) => {
  setCssVar('--backdrop-filter-blur', value)
}

const handleOpacityChange = (value: number) => {
  setCssVar('--background-mask-opacity', value / 100)
}

// 下载背景图片
const handleDownload = () => {
  downloadFileFromUrl(backgroundConfig.value.background)
}

const computedBlur = computed(() =>
  Array.isArray(backgroundConfig.value.blur) ? backgroundConfig.value.blur[0] * 10 : backgroundConfig.value.blur * 10,
)
const computedOpacity = computed(() =>
  Array.isArray(backgroundConfig.value.opacity) ? backgroundConfig.value.opacity[0] : backgroundConfig.value.opacity,
)
</script>

<template>
  <!-- 可折叠面板模式 -->
  <CollapsibleRoot v-model:open="isBackgroundOpen" class="w-full" variant="default" size="md">
    <CollapsibleTrigger variant="default" size="md" @click="isBackgroundOpen = !isBackgroundOpen">
      <div class="flex items-center gap-2">
        <Icon icon="material-symbols:background-grid-small-sharp" width="20" height="20" />
        <span class="text-lg font-semibold">{{ title }}</span>
      </div>
      <template #expandIcon>
        <Icon v-if="isBackgroundOpen" icon="radix-icons:cross-2" class="h-4 w-4" />
        <Icon v-else icon="radix-icons:row-spacing" class="h-4 w-4" />
      </template>
    </CollapsibleTrigger>
    <CollapsibleContent variant="default" size="md">
      <div class="p-4 space-y-6">
        <!-- 背景图片设置 -->
        <div class="space-y-3">
          <div class="w-full flex items-center justify-between">
            <div
              v-if="isColor(backgroundConfig.background)"
              class="w-full h-[200px] border-2 border-border rounded"
              :style="{ backgroundColor: backgroundConfig.background }"
            />
            <Image
              v-else
              :src="backgroundConfig.background"
              :showMask="true"
              width="100%"
              height="200px"
              class="border-2 border-border rounded"
              imgClass="rounded"
              objectFit="cover"
            >
              <template #mask>
                <div class="text-white text-sm font-medium">
                  <Icon
                    icon="material-symbols:download-rounded"
                    class="cursor-pointer"
                    width="28"
                    height="28"
                    @click="handleDownload"
                  />
                </div>
              </template>
            </Image>
          </div>
          <!-- 切换背景图片 -->
          <div class="flex items-center">
            <Button size="sm" class="w-full justify-center" @click="openWallpaperSelector">
              <Icon icon="material-symbols:imagesmode-outline-rounded" width="24" height="24" />
              切换背景图片
            </Button>
          </div>
        </div>

        <!-- 背景模糊度设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">背景模糊度</Label>
            <span class="text-xs text-muted-foreground">{{ computedBlur }}%</span>
          </div>
          <Slider
            v-model="backgroundConfig.blur"
            :min="0"
            :max="10"
            :step="0.1"
            class="w-full"
            @update:modelValue="handleBlurChange"
          />
          <p class="text-xs text-muted-foreground">调整背景图片的模糊程度，数值越大越模糊</p>
        </div>

        <!-- 背景遮罩透明度设置 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium">背景遮罩透明度</Label>
            <span class="text-xs text-muted-foreground">{{ computedOpacity }}%</span>
          </div>
          <Slider
            v-model="backgroundConfig.opacity"
            :min="0"
            :max="100"
            :step="1"
            class="w-full"
            @update:modelValue="handleOpacityChange"
          />
          <p class="text-xs text-muted-foreground">调整背景遮罩的不透明度，数值越大背景越暗</p>
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

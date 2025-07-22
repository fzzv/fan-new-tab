<script setup lang="ts">
import { computed } from 'vue'
import { Drawer, DrawerContent, DrawerHeader } from '@/components/drawer'
import { ScrollArea } from '@/components/scroll-area'
import { isPageSettingDialog, closePageSettingDialog } from '@/composables/useDialog'
import { useSettings, type DisplayMode } from '@/composables/useSettings.ts'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/tabs'
import { Icon } from '@iconify/vue'
import SettingGridLayout from './SettingGridLayout.vue'
import SettingBackground from './SettingBackground.vue'
import SettingSearchBar from './SettingSearchBar.vue'

const { currentDisplayMode, updateDisplayMode } = useSettings()

// 显示模式选项
const displayModeOptions = [
  { value: 'standard', label: '标准模式', icon: 'material-symbols:grid-view-outline' },
  { value: 'favorites', label: '收藏夹模式', icon: 'material-symbols:favorite-outline' },
  { value: 'minimal', label: '极简模式', icon: 'material-symbols:minimize-rounded' },
]

// 当前模式的字符串值（用于 Tabs 组件）
const currentModeStr = computed({
  get: () => currentDisplayMode.value,
  set: (value: string) => updateDisplayMode(value as DisplayMode),
})

// 当前模式说明文本
const modeDescriptionText = computed(() => {
  switch (currentDisplayMode.value) {
    case 'favorites':
      return '适合展示大量收藏网站，行数根据内容自动调整'
    case 'minimal':
      return '精简布局，适合快速访问常用网站'
    case 'standard':
    default:
      return '标准网格布局，平衡展示效果和内容密度'
  }
})
</script>

<template>
  <Drawer
    v-model:open="isPageSettingDialog"
    placement="right"
    width="400"
    :closeByMask="false"
    @close="closePageSettingDialog"
  >
    <DrawerHeader title="页面设置" @close="closePageSettingDialog" />
    <DrawerContent padding="none">
      <ScrollArea type="hover" class="h-full">
        <div class="p-6 space-y-6">
          <!-- 显示模式切换 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">显示模式</h3>

            <TabsRoot v-model="currentModeStr" class="w-full">
              <TabsList class="w-full">
                <TabsTrigger
                  v-for="option in displayModeOptions"
                  :key="option.value"
                  :value="option.value"
                  class="flex items-center gap-2 text-sm"
                >
                  <Icon :icon="option.icon" width="16" height="16" />
                  {{ option.label }}
                </TabsTrigger>
              </TabsList>
              <!-- 公共的内容 -->
              <div class="my-3 p-3 bg-muted/50 rounded-lg">
                <p class="text-sm text-muted-foreground">{{ modeDescriptionText }}</p>
              </div>
              <!-- 添加对背景的设置-->
              <SettingBackground class="mb-5" />
              <!-- 对搜索框的设置 -->
              <SettingSearchBar class="mb-5" />

              <TabsContent value="standard" class="p-0">
                <!-- 布局设置 -->
                <SettingGridLayout />
              </TabsContent>
              <TabsContent value="favorites" class="p-0">
                <!-- 收藏夹模式布局设置 -->
                <SettingGridLayout />
              </TabsContent>
              <TabsContent value="minimal" class="p-0">
                <!-- 极简模式没有布局设置 -->
              </TabsContent>
            </TabsRoot>
          </div>
        </div>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
</template>

<style scoped></style>

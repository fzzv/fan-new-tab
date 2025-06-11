<script setup lang="ts">
import { computed } from 'vue'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/drawer'
import Button from '@/components/button/Button.vue'
import { isPageSettingDialog, closePageSettingDialog } from '@/composables/useDialog'
import { useWebExtStorage } from '@/composables/useWebExtStorage.ts'
import { useGridLayout } from '@/composables/useGridLayout.ts'
import Label from '@/components/label/Label.vue'
import Switch from '@/components/switch/Switch.vue'
import SettingSelect from './SettingSelect.vue'

const { data: pageSetting } = useWebExtStorage('pageSetting', {
  favoritesMode: false,
})

const {
  currentLayoutConfig,
  isFavoritesMode,
  rowOptions,
  colOptions,
  gapOptions,
  updateRows,
  updateCols,
  updateGap,
  resetToDefault,
} = useGridLayout()

// 当前行数的字符串值（用于 Select 组件）
const currentRowsStr = computed({
  get: () => currentLayoutConfig.value.rows.toString(),
  set: (value: string) => updateRows(parseInt(value)),
})

// 当前列数的字符串值（用于 Select 组件）
const currentColsStr = computed({
  get: () => currentLayoutConfig.value.cols.toString(),
  set: (value: string) => updateCols(parseInt(value)),
})

// 当前间距的字符串值（用于 Select 组件）
const currentGapStr = computed({
  get: () => currentLayoutConfig.value.gap.toString(),
  set: (value: string) => updateGap(parseInt(value)),
})

// 布局限制说明文本
const layoutLimitText = computed(() => {
  if (isFavoritesMode.value) {
    return '收藏夹模式：行数不限制，列数最多 8 列'
  } else {
    return '普通模式：最多 8x8 布局'
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
    <DrawerContent padding="lg">
      <div class="space-y-6">
        <!-- 收藏夹模式设置 -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">显示模式</h3>
          <div class="flex items-center justify-between p-3 border rounded-lg">
            <div class="flex flex-col">
              <Label class="font-medium">收藏夹模式</Label>
              <span class="text-sm text-muted-foreground">开启后网站卡片行数不受限制，关闭后最多显示 8x8 布局</span>
            </div>
            <Switch v-model="pageSetting.favoritesMode" />
          </div>
        </div>

        <!-- 布局设置 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">网格布局</h3>
            <Button variant="outline" size="sm" @click="resetToDefault">重置默认</Button>
          </div>

          <div class="p-3 bg-muted/50 rounded-lg">
            <p class="text-sm text-muted-foreground">{{ layoutLimitText }}</p>
          </div>

          <!-- 行数设置 -->
          <div class="space-y-2">
            <Label class="font-medium">行数</Label>
            <div
              v-if="isFavoritesMode"
              class="px-3 py-2 border-2 border-muted bg-muted/50 rounded text-muted-foreground"
            >
              自动调整（无限制）
            </div>
            <SettingSelect
              v-else
              v-model="currentRowsStr"
              :options="rowOptions.map((opt) => ({ label: opt.label, value: opt.value.toString() }))"
              placeholder="选择行数"
            />
            <p class="text-xs text-muted-foreground">
              {{ isFavoritesMode ? '收藏夹模式下行数根据网站数量自动调整' : '设置网格的行数' }}
            </p>
          </div>

          <!-- 列数设置 -->
          <div class="space-y-2">
            <Label class="font-medium">列数</Label>
            <SettingSelect
              v-model="currentColsStr"
              :options="colOptions.map((opt) => ({ label: opt.label, value: opt.value.toString() }))"
              placeholder="选择列数"
            />
            <p class="text-xs text-muted-foreground">设置网格的列数，最多 8 列</p>
          </div>

          <!-- 间距设置 -->
          <div class="space-y-2">
            <Label class="font-medium">间距</Label>
            <SettingSelect
              v-model="currentGapStr"
              :options="gapOptions.map((opt) => ({ label: opt.label, value: opt.value.toString() }))"
              placeholder="选择间距"
            />
            <p class="text-xs text-muted-foreground">设置网格项之间的间距</p>
          </div>

          <!-- 当前配置预览 -->
          <div class="p-3 bg-primary/10 rounded-lg border">
            <h4 class="font-medium mb-2">当前配置</h4>
            <div class="text-sm space-y-1">
              <div>
                <span class="text-muted-foreground">布局：</span>
                <span class="font-medium">
                  {{ isFavoritesMode ? '自动' : currentLayoutConfig.rows }} × {{ currentLayoutConfig.cols }}
                </span>
              </div>
              <div>
                <span class="text-muted-foreground">间距：</span>
                <span class="font-medium">{{ currentLayoutConfig.gap }}px</span>
              </div>
              <div>
                <span class="text-muted-foreground">模式：</span>
                <span class="font-medium">{{ isFavoritesMode ? '收藏夹模式' : '普通模式' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
    <DrawerFooter>
      <Button variant="outline" @click="closePageSettingDialog">取消</Button>
      <Button @click="closePageSettingDialog">确定</Button>
    </DrawerFooter>
  </Drawer>
</template>

<style scoped></style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettings } from '@/composables/useSettings.ts'
import Label from '@/components/label/Label.vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible'
import { Icon } from '@iconify/vue'
import { InputNumber } from '@/components/input-number'

// 组件属性
interface SettingGridLayoutProps {
  collapsible?: boolean // 是否显示为可折叠面板
  title?: string // 标题
  showModeInfo?: boolean // 是否显示模式信息
}

withDefaults(defineProps<SettingGridLayoutProps>(), {
  collapsible: true,
  title: '网格布局',
  showModeInfo: true,
})

const { currentDisplayMode, currentLayoutConfig, updateRows, updateCols, updateGap } = useSettings()

// 控制折叠面板的展开状态
const isGridLayoutOpen = ref(true)

// 当前行数的数值（用于 InputNumber 组件）
const currentRows = computed({
  get: () => currentLayoutConfig.value.rows,
  set: (value: number | undefined) => updateRows(value || 1),
})

// 当前列数的数值（用于 InputNumber 组件）
const currentCols = computed({
  get: () => currentLayoutConfig.value.cols,
  set: (value: number | undefined) => updateCols(value || 1),
})

// 当前间距的数值（用于 InputNumber 组件）
const currentGap = computed({
  get: () => currentLayoutConfig.value.gap,
  set: (value: number | undefined) => updateGap(value || 0),
})

// 布局限制说明文本
const layoutLimitText = computed(() => {
  switch (currentDisplayMode.value) {
    case 'favorites':
      return '收藏夹模式：行数不限制，列数最多 8 列'
    case 'minimal':
      return '极简模式：最多 4x6 布局'
    case 'standard':
    default:
      return '标准模式：最多 8x8 布局'
  }
})
</script>

<template>
  <!-- 可折叠面板模式 -->
  <CollapsibleRoot v-if="collapsible" v-model:open="isGridLayoutOpen" class="w-full" variant="default" size="md">
    <CollapsibleTrigger variant="default" size="md" @click="isGridLayoutOpen = !isGridLayoutOpen">
      <div class="flex items-center gap-2">
        <Icon icon="material-symbols:grid-view-outline" width="20" height="20" />
        <span class="text-lg font-semibold">{{ title }}</span>
      </div>
      <template #expandIcon>
        <Icon v-if="isGridLayoutOpen" icon="radix-icons:cross-2" class="h-4 w-4" />
        <Icon v-else icon="radix-icons:row-spacing" class="h-4 w-4" />
      </template>
    </CollapsibleTrigger>
    <CollapsibleContent variant="default" size="md">
      <div class="p-4 space-y-4">
        <div v-if="showModeInfo" class="p-3 bg-muted/50 rounded-lg">
          <p class="text-sm text-muted-foreground">{{ layoutLimitText }}</p>
        </div>

        <!-- 行数设置 -->
        <div class="flex items-align gap-3">
          <Label class="font-medium text-right w-10 pt-2 shrink-0">行数</Label>
          <div class="flex-1 space-y-2">
            <div
              v-if="currentDisplayMode === 'favorites'"
              class="w-[190px] px-4 py-2 border-2 border-black bg-muted/50 rounded text-muted-foreground font-head font-medium text-center shadow-md"
            >
              自动调整（无限制）
            </div>
            <InputNumber
              v-else
              v-model="currentRows"
              :min="1"
              :max="currentDisplayMode === 'minimal' ? 4 : 8"
              :step="1"
              placeholder="行数"
              size="md"
              variant="default"
            />
            <p class="text-xs text-muted-foreground">
              {{
                currentDisplayMode === 'favorites'
                  ? '收藏夹模式下行数根据网站数量自动调整'
                  : currentDisplayMode === 'minimal'
                    ? '极简模式最多 4 行'
                    : '标准模式最多 8 行'
              }}
            </p>
          </div>
        </div>

        <!-- 列数设置 -->
        <div class="flex items-start gap-3">
          <Label class="font-medium text-right w-10 pt-2 shrink-0">列数</Label>
          <div class="flex-1 space-y-2">
            <InputNumber
              v-model="currentCols"
              :min="1"
              :max="currentDisplayMode === 'minimal' ? 6 : 8"
              :step="1"
              placeholder="列数"
              size="md"
              variant="default"
            />
            <p class="text-xs text-muted-foreground">
              {{ currentDisplayMode === 'minimal' ? '极简模式最多 6 列' : '最多 8 列' }}
            </p>
          </div>
        </div>

        <!-- 间距设置 -->
        <div class="flex items-start gap-3">
          <Label class="font-medium text-right w-10 pt-2 shrink-0">间距</Label>
          <div class="flex-1 space-y-2">
            <InputNumber
              v-model="currentGap"
              :min="0"
              :max="32"
              :step="4"
              placeholder="间距(px)"
              size="md"
              variant="default"
            />
            <p class="text-xs text-muted-foreground">设置网格项之间的间距，建议使用4的倍数，单位(px)</p>
          </div>
        </div>

        <!-- 当前配置预览 -->
        <div class="p-3 bg-primary/10 rounded-lg border">
          <h4 class="font-medium mb-2">当前配置</h4>
          <div class="text-sm space-y-1">
            <div>
              <span class="text-muted-foreground">布局：</span>
              <span class="font-medium">
                {{ currentDisplayMode === 'favorites' ? '自动' : currentLayoutConfig.rows }} ×
                {{ currentLayoutConfig.cols }}
              </span>
            </div>
            <div>
              <span class="text-muted-foreground">间距：</span>
              <span class="font-medium">{{ currentLayoutConfig.gap }}px</span>
            </div>
            <div>
              <span class="text-muted-foreground">模式：</span>
              <span class="font-medium">
                {{
                  currentDisplayMode === 'favorites'
                    ? '收藏夹模式'
                    : currentDisplayMode === 'minimal'
                      ? '极简模式'
                      : '标准模式'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>

  <!-- 直接显示模式 -->
  <div v-else class="w-full">
    <div v-if="title" class="flex items-center gap-2 mb-4">
      <Icon icon="material-symbols:grid-view-outline" width="20" height="20" />
      <span class="text-lg font-semibold">{{ title }}</span>
    </div>

    <div class="space-y-4">
      <div v-if="showModeInfo" class="p-3 bg-muted/50 rounded-lg">
        <p class="text-sm text-muted-foreground">{{ layoutLimitText }}</p>
      </div>

      <!-- 行数设置 -->
      <div class="flex items-align gap-3">
        <Label class="font-medium text-right w-10 pt-2 shrink-0">行数</Label>
        <div class="flex-1 space-y-2">
          <div
            v-if="currentDisplayMode === 'favorites'"
            class="px-4 py-2 border-2 border-black bg-muted/50 rounded text-muted-foreground font-head font-medium text-center shadow-md"
          >
            自动调整（无限制）
          </div>
          <InputNumber
            v-else
            v-model="currentRows"
            :min="1"
            :max="currentDisplayMode === 'minimal' ? 4 : 8"
            :step="1"
            placeholder="行数"
            size="md"
            variant="default"
          />
          <p class="text-xs text-muted-foreground">
            {{
              currentDisplayMode === 'favorites'
                ? '收藏夹模式下行数根据网站数量自动调整'
                : currentDisplayMode === 'minimal'
                  ? '极简模式最多 4 行'
                  : '标准模式最多 8 行'
            }}
          </p>
        </div>
      </div>

      <!-- 列数设置 -->
      <div class="flex items-start gap-3">
        <Label class="font-medium text-right w-10 pt-2 shrink-0">列数</Label>
        <div class="flex-1 space-y-2">
          <InputNumber
            v-model="currentCols"
            :min="1"
            :max="currentDisplayMode === 'minimal' ? 6 : 8"
            :step="1"
            placeholder="列数"
            size="md"
            variant="default"
          />
          <p class="text-xs text-muted-foreground">
            {{ currentDisplayMode === 'minimal' ? '极简模式最多 6 列' : '最多 8 列' }}
          </p>
        </div>
      </div>

      <!-- 间距设置 -->
      <div class="flex items-start gap-3">
        <Label class="font-medium text-right w-10 pt-2 shrink-0">间距</Label>
        <div class="flex-1 space-y-2">
          <InputNumber
            v-model="currentGap"
            :min="0"
            :max="64"
            :step="4"
            placeholder="间距(px)"
            size="md"
            variant="default"
          />
          <p class="text-xs text-muted-foreground">设置网格项之间的间距，建议使用4的倍数，单位(px)</p>
        </div>
      </div>

      <!-- 当前配置预览 -->
      <div class="p-3 bg-primary/10 rounded-lg border">
        <h4 class="font-medium mb-2">当前配置</h4>
        <div class="text-sm space-y-1">
          <div>
            <span class="text-muted-foreground">布局：</span>
            <span class="font-medium">
              {{ currentDisplayMode === 'favorites' ? '自动' : currentLayoutConfig.rows }} ×
              {{ currentLayoutConfig.cols }}
            </span>
          </div>
          <div>
            <span class="text-muted-foreground">间距：</span>
            <span class="font-medium">{{ currentLayoutConfig.gap }}px</span>
          </div>
          <div>
            <span class="text-muted-foreground">模式：</span>
            <span class="font-medium">
              {{
                currentDisplayMode === 'favorites'
                  ? '收藏夹模式'
                  : currentDisplayMode === 'minimal'
                    ? '极简模式'
                    : '标准模式'
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/scroll-area'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { useFavoriteWallpaper } from '@/composables/useFavoriteWallpaper'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextMenu } from '@/components/context-menu'
import { openColorPickerDialog } from '@/composables/useDialog.ts'
import { toast } from '@/lib/toast'
import type { MenuItemType } from '@/components/context-menu'

// 响应式网格容器引用
const gridContainerRef = ref<HTMLElement | null>(null)

// 使用响应式网格
const { gridStyle, reinitializeObserver: reinitializeGrid } = useResponsiveGrid(
  gridContainerRef,
  responsivePresets.imageGrid,
)

// 设置
const { setWallpaper, customColorList } = useSettings()

// 收藏壁纸
const { addFavoriteWallpaper } = useFavoriteWallpaper()

// 右击菜单
const { isOpen: isContextMenuOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()

// 处理颜色点击，设置为壁纸
async function handleColorClick(color: string) {
  await setWallpaper(color)
}

// 右击菜单项 - 纯色壁纸
const contextMenuItems: MenuItemType[] = [
  {
    label: '收藏颜色',
    icon: 'material-symbols:favorite-outline',
    click: async (item) => {
      if (item?.color) {
        try {
          await addFavoriteWallpaper(item.color, 'color', undefined, `颜色 ${item.color}`)
          toast.success('收藏成功', { richColors: true })
        } catch (error) {
          toast.error(`收藏失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
        }
      }
    },
  },
]

// 处理纯色壁纸右击菜单
function handleContextMenu(event: MouseEvent, color: string) {
  event.preventDefault()
  onContextMenu({ color, type: 'color' })
}

// 窗口大小变化监听
let resizeTimeout: number | null = null
const handleWindowResize = () => {
  // 防抖处理，避免频繁触发
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
    nextTick(() => {
      reinitializeGrid()
    })
  }, 150) // 150ms 防抖
}

onMounted(() => {
  // 延迟重新初始化网格，确保 DOM 已更新
  nextTick(() => {
    reinitializeGrid()
  })

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleWindowResize)
})

// 组件卸载时清理监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})
</script>

<template>
  <ScrollArea :height="400" type="hover">
    <div ref="gridContainerRef" class="p-2" :style="gridStyle">
      <!-- 自定义颜色按钮 -->
      <div class="flex items-center justify-center overflow-hidden rounded-lg">
        <div
          class="w-[200px] h-[150px] border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2"
          @click="openColorPickerDialog"
        >
          <Icon icon="material-symbols:add-circle-outline" width="32" height="32" />
          <span class="text-sm font-medium">自定义颜色</span>
        </div>
      </div>
      <!-- 颜色列表 -->
      <div
        v-for="color in customColorList"
        :key="color"
        class="flex items-center justify-center overflow-hidden rounded-lg"
      >
        <div
          class="w-[200px] h-[150px] border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
          :style="{ backgroundColor: color }"
          @click="() => handleColorClick(color)"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, color)"
        />
      </div>
    </div>

    <!-- 右击菜单 -->
    <ContextMenu
      v-model="isContextMenuOpen"
      :virtual-element="virtualElement"
      :items="contextMenuItems"
      :current-item="currentItem"
    />
  </ScrollArea>
</template>

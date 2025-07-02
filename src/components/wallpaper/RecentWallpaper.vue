<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Image } from '@/components/image'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/scroll-area'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { useRecentWallpaper } from '@/composables/useRecentWallpaper'
import { Modal } from '@/components/modal'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextMenu } from '@/components/context-menu'
import { toast } from '@/lib/toast'
import type { RecentWallpaper as RecentWallpaperType } from '@/types/wallpaper'
import type { MenuItemType } from '@/components/context-menu'

// 响应式网格容器引用
const gridContainerRef = ref<HTMLElement | null>(null)

// 使用响应式网格
const { gridStyle, reinitializeObserver: reinitializeGrid } = useResponsiveGrid(
  gridContainerRef,
  responsivePresets.imageGrid,
)

// 设置
const { setWallpaper } = useSettings()

// 最近使用壁纸
const {
  recentWallpapers,
  isLoading: isRecentLoading,
  loadRecentWallpapers,
  deleteRecentWallpaper,
  getWallpaperDisplayName,
  updateWallpaperUsedTime,
} = useRecentWallpaper()

// 右击菜单
const { isOpen: isContextMenuOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()

// 处理最近使用壁纸点击，设置为壁纸
async function handleRecentWallpaperClick(wallpaper: RecentWallpaperType) {
  // 设置壁纸时跳过添加到最近使用，而是更新使用时间
  await setWallpaper(wallpaper.data, true)
  await updateWallpaperUsedTime(wallpaper.id)
}

// 右击菜单项 - 最近使用壁纸
const contextMenuItems: MenuItemType[] = [
  {
    label: '从最近使用中移除',
    icon: 'material-symbols:delete-outline',
    click: async (item) => {
      if (item) {
        Modal.confirm({
          title: '确认移除',
          icon: 'material-symbols:delete-outline',
          content: '确定要从最近使用中移除这张壁纸吗？',
          okText: '移除',
          cancelText: '取消',
          onOk: async () => {
            try {
              if (item.id) {
                await deleteRecentWallpaper(item.id)
                toast.success('移除成功', { richColors: true })
              }
            } catch (error) {
              toast.error(`移除失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
            }
          },
        })
      }
    },
  },
]

// 处理最近使用壁纸右击菜单
function handleContextMenu(event: MouseEvent, wallpaper: RecentWallpaperType) {
  event.preventDefault()
  onContextMenu(wallpaper)
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
  }, 150)
}

onMounted(() => {
  // 加载最近使用壁纸
  loadRecentWallpapers()

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
      <!-- 最近使用壁纸列表 -->
      <div
        v-for="wallpaper in recentWallpapers"
        :key="wallpaper.id"
        class="flex items-center justify-center overflow-hidden rounded-lg"
      >
        <!-- 颜色壁纸 -->
        <div
          v-if="wallpaper.type === 'color'"
          class="w-[200px] h-[150px] border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
          :style="{ backgroundColor: wallpaper.data as string }"
          @click="() => handleRecentWallpaperClick(wallpaper)"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, wallpaper)"
        ></div>
        <!-- 图片壁纸 -->
        <Image
          v-else
          :src="wallpaper.blobUrl"
          :alt="getWallpaperDisplayName(wallpaper)"
          :width="200"
          :height="150"
          :preview="false"
          imgClass="border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
          @click="() => handleRecentWallpaperClick(wallpaper)"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, wallpaper)"
        />
      </div>
      <!-- 加载状态 -->
      <div v-if="isRecentLoading" class="text-center text-gray-500 py-5 text-sm" :style="{ gridColumn: '1 / -1' }">
        加载中...
      </div>
      <!-- 空状态 -->
      <div v-else-if="recentWallpapers.length === 0" class="text-center py-5" :style="{ gridColumn: '1 / -1' }">
        <div class="text-center text-muted-foreground py-8">
          <Icon icon="material-symbols:history" width="48" height="48" class="mx-auto mb-2" />
          <p>还没有最近使用的壁纸</p>
          <p class="text-sm">设置壁纸后会自动记录到这里</p>
        </div>
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

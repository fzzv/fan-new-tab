<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Image } from '@/components/image'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/scroll-area'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { useFavoriteWallpaper } from '@/composables/useFavoriteWallpaper'
import { Modal } from '@/components/modal'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextMenu } from '@/components/context-menu'
import { toast } from '@/lib/toast'
import type { FavoriteWallpaper as FavoriteWallpaperType } from '@/types/wallpaper'
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

// 收藏壁纸
const {
  favoriteWallpapers,
  isLoading: isFavoriteLoading,
  loadFavoriteWallpapers,
  deleteFavoriteWallpaper,
  getFavoriteWallpaperDisplayName,
} = useFavoriteWallpaper()

// 右击菜单
const { isOpen: isContextMenuOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()

// 处理收藏壁纸点击，设置为壁纸
async function handleFavoriteWallpaperClick(wallpaper: FavoriteWallpaperType) {
  await setWallpaper(wallpaper.data)
}

// 右击菜单项 - 收藏壁纸
const contextMenuItems: MenuItemType[] = [
  {
    label: '取消收藏',
    icon: 'material-symbols:heart-broken',
    click: async (item) => {
      if (item) {
        Modal.confirm({
          title: '确认取消收藏',
          icon: 'material-symbols:heart-broken',
          content: '确定要取消收藏这张壁纸吗？',
          okText: '取消收藏',
          cancelText: '保留',
          onOk: async () => {
            try {
              if (item.id) {
                await deleteFavoriteWallpaper(item.id)
                toast.success('取消收藏成功', { richColors: true })
              }
            } catch (error) {
              toast.error(`取消收藏失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
            }
          },
        })
      }
    },
  },
]

// 处理收藏壁纸右击菜单
function handleContextMenu(event: MouseEvent, wallpaper: FavoriteWallpaperType) {
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
  }, 150) // 150ms 防抖
}

onMounted(() => {
  // 加载收藏壁纸
  loadFavoriteWallpapers()

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
      <!-- 收藏壁纸列表 -->
      <div
        v-for="wallpaper in favoriteWallpapers"
        :key="wallpaper.id"
        class="flex items-center justify-center overflow-hidden rounded-lg"
      >
        <!-- 颜色壁纸 -->
        <div
          v-if="wallpaper.type === 'color'"
          class="w-[200px] h-[150px] border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
          :style="{ backgroundColor: wallpaper.data as string }"
          @click="() => handleFavoriteWallpaperClick(wallpaper)"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, wallpaper)"
        ></div>
        <!-- 图片壁纸 -->
        <Image
          v-else
          :src="wallpaper.blobUrl"
          :alt="getFavoriteWallpaperDisplayName(wallpaper)"
          :width="200"
          :height="150"
          :preview="false"
          imgClass="border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
          @click="() => handleFavoriteWallpaperClick(wallpaper)"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, wallpaper)"
        />
      </div>
      <!-- 加载状态 -->
      <div v-if="isFavoriteLoading" class="text-center text-gray-500 py-5 text-sm" :style="{ gridColumn: '1 / -1' }">
        加载中...
      </div>
      <!-- 空状态 -->
      <div v-else-if="favoriteWallpapers.length === 0" class="text-center py-5" :style="{ gridColumn: '1 / -1' }">
        <div class="text-center text-muted-foreground py-8">
          <Icon icon="material-symbols:favorite-outline" width="48" height="48" class="mx-auto mb-2" />
          <p>还没有收藏的壁纸</p>
          <p class="text-sm">右击壁纸选择收藏即可添加到这里</p>
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

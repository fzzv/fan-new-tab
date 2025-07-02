<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Image } from '@/components/image'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/scroll-area'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { useLocalWallpaper } from '@/composables/useLocalWallpaper'
import { useFavoriteWallpaper } from '@/composables/useFavoriteWallpaper'
import { Modal } from '@/components/modal'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextMenu } from '@/components/context-menu'
import { toast } from '@/lib/toast'
import type { LocalWallpaper as LocalWallpaperType } from '@/types/wallpaper'
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

// 本地壁纸
const {
  wallpapers: localWallpapers,
  isLoading: isLocalLoading,
  loadWallpapers,
  addWallpaper,
  deleteWallpaper,
} = useLocalWallpaper()

// 收藏壁纸
const { addFavoriteWallpaper } = useFavoriteWallpaper()

// 右击菜单
const { isOpen: isContextMenuOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()

// 处理本地壁纸点击，设置为壁纸
async function handleLocalWallpaperClick(wallpaper: LocalWallpaperType) {
  await setWallpaper(wallpaper.blob)
}

// 处理文件上传
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleUploadClick() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    try {
      await addWallpaper(file)
      // 清空input值，允许重复选择同一文件
      if (target) target.value = ''
      toast.success('上传成功', { richColors: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败，请重试')
    }
  }
}

// 右击菜单项 - 本地壁纸
const contextMenuItems: MenuItemType[] = [
  {
    label: '收藏壁纸',
    icon: 'material-symbols:favorite-outline',
    click: async (item) => {
      if (item?.blob) {
        try {
          await addFavoriteWallpaper(item.blob, 'local', undefined, item.name)
          toast.success('收藏成功', { richColors: true })
        } catch (error) {
          toast.error(`收藏失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
        }
      }
    },
  },
  {
    label: '删除壁纸',
    icon: 'material-symbols:delete-outline',
    click: async (item) => {
      if (item) {
        Modal.confirm({
          title: '确认删除',
          icon: 'material-symbols:delete-outline',
          content: '确定要删除这张本地壁纸吗？此操作不可撤销。',
          okText: '删除',
          cancelText: '取消',
          onOk: async () => {
            try {
              if (item.id) {
                await deleteWallpaper(item.id)
                toast.success('删除成功', { richColors: true })
              }
            } catch (error) {
              toast.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
            }
          },
        })
      }
    },
  },
]

// 处理本地壁纸右击菜单
function handleContextMenu(event: MouseEvent, wallpaper: LocalWallpaperType) {
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
  // 加载本地壁纸
  loadWallpapers()

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
      <!-- 上传按钮 -->
      <div class="flex items-center justify-center overflow-hidden rounded-lg">
        <div
          class="w-[200px] h-[150px] border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2"
          @click="handleUploadClick"
        >
          <Icon icon="material-symbols:upload-file-outline" width="32" height="32" />
          <span class="text-sm font-medium">上传本地壁纸</span>
        </div>
        <!-- 隐藏的文件输入 -->
        <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
      </div>
      <!-- 本地壁纸列表 -->
      <div
        v-for="wallpaper in localWallpapers"
        :key="wallpaper.id"
        class="flex items-center justify-center overflow-hidden rounded-lg"
      >
        <Image
          :src="wallpaper.blobUrl"
          :alt="wallpaper.name"
          :width="200"
          :height="150"
          :preview="false"
          imgClass="border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
          @click="() => handleLocalWallpaperClick(wallpaper)"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, wallpaper)"
        />
      </div>
      <!-- 加载状态 -->
      <div v-if="isLocalLoading" class="text-center text-gray-500 py-5 text-sm" :style="{ gridColumn: '1 / -1' }">
        加载中...
      </div>
      <!-- 空状态 -->
      <div v-else-if="localWallpapers.length === 0" class="text-center py-5" :style="{ gridColumn: '1 / -1' }">
        <div class="text-center text-muted-foreground py-8">
          <Icon icon="material-symbols:image-outline" width="48" height="48" class="mx-auto mb-2" />
          <p>还没有本地壁纸</p>
          <p class="text-sm">点击上传按钮添加您的第一张壁纸</p>
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

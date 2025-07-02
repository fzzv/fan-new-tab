<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Image } from '@/components/image'
import { $fetch } from 'ofetch'
import { ScrollArea } from '@/components/scroll-area'
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/select'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { useFavoriteWallpaper } from '@/composables/useFavoriteWallpaper'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextMenu } from '@/components/context-menu'
import { toast } from '@/lib/toast'
import type { MenuItemType } from '@/components/context-menu'

const images = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const source = ref('')

// 来源筛选选项
const sourceOptions = [
  { label: 'All', value: 'all' },
  { label: 'Bing', value: 'Bing' },
  { label: 'Unsplash', value: 'Unsplash' },
  { label: 'Life Of Pix', value: 'Life Of Pix' },
  { label: 'MMT', value: 'MMT' },
  { label: 'Realistic Shots', value: 'Realistic Shots' },
  { label: 'Jay Mantri', value: 'Jay Mantri' },
  { label: 'Free Nature Stock', value: 'Free Nature Stock' },
  { label: 'Skitter Photo', value: 'Skitter Photo' },
  { label: 'Startup Stock Photos', value: 'Startup Stock Photos' },
  { label: 'Barn Images', value: 'Barn Images' },
  { label: 'Picography', value: 'Picography' },
]

// 选中的来源
const selectedSource = ref('all')

// 响应式网格容器引用
const gridContainerRef = ref<HTMLElement | null>(null)

// 使用响应式网格
const {
  cols,
  gridStyle,
  reinitializeObserver: reinitializeGrid,
} = useResponsiveGrid(gridContainerRef, responsivePresets.imageGrid)

// 设置
const { setWallpaper } = useSettings()

// 收藏壁纸
const { addFavoriteWallpaper } = useFavoriteWallpaper()

// 右击菜单
const { isOpen: isContextMenuOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()

// 右击菜单项 - 云端壁纸
const contextMenuItems: MenuItemType[] = [
  {
    label: '收藏壁纸',
    icon: 'material-symbols:favorite-outline',
    click: async (item) => {
      if (item?.src?.rawSrc) {
        try {
          await addFavoriteWallpaper(item.src.rawSrc, 'cloud', item.src.rawSrc)
          toast.success('收藏成功', { richColors: true })
        } catch (error) {
          toast.error(`收藏失败: ${error instanceof Error ? error.message : '未知错误'}`, { richColors: true })
        }
      }
    },
  },
]

// 加载更多数据的函数
async function loadMoreData() {
  page.value += 1
  await getWallpaperList(true)
}

// 使用无限滚动 composable
const { handleScroll, isLoading, hasMore, reset } = useInfiniteScroll(loadMoreData, {
  threshold: 0.9, // 滚动到90%时触发
  debounceDelay: 150, // 防抖延迟150ms
  debug: true, // 开启调试日志
})

// 获取云端的壁纸列表
async function getWallpaperList(append = false) {
  try {
    const { data } = await $fetch(`http://localhost:3303/api/getWallpaperList`, {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        source: source.value,
      },
    })

    if (append) {
      images.value = images.value.concat(data.list)
    } else {
      images.value = data.list
    }

    // 如果返回的数据少于请求的数量，说明没有更多数据了
    if (!data.list || data.list.length < pageSize.value) {
      hasMore.value = false
    }
  } catch (err) {
    console.log('加载壁纸列表失败:', err)
    // 发生错误时也要停止加载更多
    hasMore.value = false
  }
}

// 处理图片点击，设置为壁纸
async function handleImageClick(item: any) {
  if (item?.src?.rawSrc) {
    await setWallpaper(item.src.rawSrc)
  }
}

// 处理云端壁纸右击菜单
function handleContextMenu(event: MouseEvent, wallpaper: any) {
  event.preventDefault()
  onContextMenu(wallpaper)
}

// 处理来源变化
function handleSourceChange(newSource: string) {
  selectedSource.value = newSource
  // 如果选择的是"all"，则将source设置为空字符串
  source.value = newSource === 'all' ? '' : newSource
  // 重置分页并重新加载数据
  page.value = 1
  images.value = []
  reset()
  getWallpaperList()
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
  // 初始化选中的来源为默认值（All）
  selectedSource.value = 'all'

  // 重置状态并重新加载数据
  page.value = 1
  images.value = []
  reset()
  getWallpaperList()

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
  <div class="space-y-4">
    <!-- 来源筛选 -->
    <div class="px-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">来源:</span>
        <SelectRoot v-model="selectedSource" @update:model-value="handleSourceChange">
          <SelectTrigger class="w-48">
            <SelectValue>
              {{ sourceOptions.find((opt) => opt.value === selectedSource)?.label || 'All' }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent class="z-[2001] w-48">
            <SelectItem v-for="option in sourceOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>
    </div>

    <!-- 壁纸列表 -->
    <ScrollArea :height="400" type="hover" @areaScroll="handleScroll">
      <div ref="gridContainerRef" class="p-2" :style="gridStyle">
        <div v-for="item in images" :key="item._id" class="flex items-center justify-center overflow-hidden rounded-lg">
          <Image
            :src="item.src.rawSrc"
            :alt="`wallpaper-${item._id}`"
            :width="200"
            :height="150"
            :preview="false"
            imgClass="border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
            @click="() => handleImageClick(item)"
            @contextmenu="(e: MouseEvent) => handleContextMenu(e, item)"
          />
        </div>
        <div v-if="isLoading" class="text-center text-gray-500 py-5 text-sm" :style="{ gridColumn: `1 / ${cols + 1}` }">
          加载中...
        </div>
        <div
          v-else-if="!hasMore"
          class="text-center text-gray-400 py-5 text-sm"
          :style="{ gridColumn: `1 / ${cols + 1}` }"
        >
          没有更多了
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
  </div>
</template>

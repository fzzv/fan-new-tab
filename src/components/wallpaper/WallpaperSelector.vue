<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { closeWallpaperSelector, openColorPickerDialog } from '@/composables/useDialog.ts'
import { ModalContent, ModalHeader } from '@/components/modal'
import { Tabs } from '@/components/tabs'
import { Image } from '@/components/image'
import { Icon } from '@iconify/vue'
import { $fetch } from 'ofetch'
import { ScrollArea } from '@/components/scroll-area'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'
import { useSettings } from '@/composables/useSettings'
import { useLocalWallpaper } from '@/composables/useLocalWallpaper'
import { Modal } from '@/components/modal'
import { useContextMenu } from '@/composables/useContextMenu'
import { ContextMenu } from '@/components/context-menu'
import { toast } from '@/lib/toast'
import type { LocalWallpaper } from '@/types/wallpaper'
import type { MenuItemType } from '@/components/context-menu'

const classificationTabs = [
  {
    label: '云端壁纸',
    value: 'cloud',
  },
  {
    label: '本地壁纸',
    value: 'local',
  },
  {
    label: '纯色壁纸',
    value: 'color',
  },
  {
    label: '最近使用',
    value: 'recent',
  },
  {
    label: '我的收藏',
    value: 'favorite',
  },
]

const modelValue = ref('cloud')

const images = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const source = ref('')

// 响应式网格容器引用
const gridContainerRef = ref<HTMLElement | null>(null)
const colorGridContainerRef = ref<HTMLElement | null>(null)
const localGridContainerRef = ref<HTMLElement | null>(null)

// 使用响应式网格
const { cols, gridStyle } = useResponsiveGrid(gridContainerRef, responsivePresets.imageGrid)
const { gridStyle: colorGridStyle } = useResponsiveGrid(colorGridContainerRef, responsivePresets.imageGrid)
const { gridStyle: localGridStyle } = useResponsiveGrid(localGridContainerRef, responsivePresets.imageGrid)

// 设置
const { setWallpaper, customColorList } = useSettings()

// 本地壁纸
const {
  wallpapers: localWallpapers,
  isLoading: isLocalLoading,
  loadWallpapers,
  addWallpaper,
  deleteWallpaper,
} = useLocalWallpaper()

// 右击菜单
const { isOpen: isContextMenuOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()

// 处理颜色点击，设置为壁纸
function handleColorClick(color: string) {
  setWallpaper(color)
}

// 处理本地壁纸点击，设置为壁纸
function handleLocalWallpaperClick(wallpaper: LocalWallpaper) {
  setWallpaper(wallpaper.base64)
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

// 右击菜单项
const contextMenuItems: MenuItemType[] = [
  {
    label: '删除壁纸',
    icon: 'material-symbols:delete-outline',
    click: async (item) => {
      if (item) {
        Modal.confirm({
          title: '确认删除',
          icon: 'material-symbols:delete-outline',
          content: '确定要删除这张壁纸吗？此操作不可撤销。',
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

// 处理右击菜单
function handleContextMenu(event: MouseEvent, wallpaper: LocalWallpaper) {
  event.preventDefault()
  onContextMenu(wallpaper)
}

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
function handleImageClick(item: any) {
  if (item?.src?.rawSrc) {
    setWallpaper(item.src.rawSrc)
  }
}

// 监听标签页切换，重置状态
watch(modelValue, (newValue) => {
  if (newValue === 'cloud') {
    // 重置状态并重新加载数据
    page.value = 1
    images.value = []
    reset()
    getWallpaperList()
  } else if (newValue === 'local') {
    // 加载本地壁纸
    loadWallpapers()
  }
})

onMounted(() => {
  if (modelValue.value === 'cloud') {
    getWallpaperList()
  } else if (modelValue.value === 'local') {
    loadWallpapers()
  }
})

// 区域滚动
function handleAreaScroll(event: Event) {
  // 云端壁纸支持滚动加载更多
  if (modelValue.value === 'cloud') {
    handleScroll(event)
  }
}
</script>

<template>
  <ModalContent size="xl">
    <ModalHeader @close="closeWallpaperSelector">
      <div class="text-xl">选择壁纸</div>
    </ModalHeader>

    <Tabs v-model="modelValue" :tabs="classificationTabs" :show-icon="false" class="p-5">
      <template v-for="tab in classificationTabs" :key="tab.value" #[tab.value]>
        <ScrollArea :height="400" type="hover" @areaScroll="handleAreaScroll">
          <!-- 云端壁纸 -->
          <div v-if="modelValue === 'cloud'" ref="gridContainerRef" class="responsive-grid" :style="gridStyle">
            <div v-for="item in images" :key="item._id" class="grid-item">
              <Image
                :src="item.src.rawSrc"
                :alt="`wallpaper-${item._id}`"
                :width="200"
                :height="150"
                :preview="false"
                imgClass="border-2 border-transparent hover:border-primary rounded-lg cursor-pointer"
                @click="() => handleImageClick(item)"
              />
            </div>
            <div v-if="isLoading" class="loading" :style="{ gridColumn: `1 / ${cols + 1}` }">加载中...</div>
            <div v-else-if="!hasMore" class="no-more" :style="{ gridColumn: `1 / ${cols + 1}` }">没有更多了</div>
          </div>
          <!-- 本地壁纸 -->
          <div
            v-else-if="modelValue === 'local'"
            ref="localGridContainerRef"
            class="responsive-grid"
            :style="localGridStyle"
          >
            <!-- 上传按钮 -->
            <div class="grid-item">
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
            <div v-for="wallpaper in localWallpapers" :key="wallpaper.id" class="grid-item">
              <Image
                :src="wallpaper.base64"
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
            <div v-if="isLocalLoading" class="loading" :style="{ gridColumn: '1 / -1' }">加载中...</div>
            <!-- 空状态 -->
            <div v-else-if="localWallpapers.length === 0" class="no-wallpapers" :style="{ gridColumn: '1 / -1' }">
              <div class="text-center text-muted-foreground py-8">
                <Icon icon="material-symbols:image-outline" width="48" height="48" class="mx-auto mb-2" />
                <p>还没有本地壁纸</p>
                <p class="text-sm">点击上传按钮添加您的第一张壁纸</p>
              </div>
            </div>
          </div>
          <!-- 纯色壁纸 -->
          <div
            v-else-if="modelValue === 'color'"
            ref="colorGridContainerRef"
            class="responsive-grid"
            :style="colorGridStyle"
          >
            <!-- 自定义颜色按钮 -->
            <div class="grid-item">
              <div
                class="w-[200px] h-[150px] border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2"
                @click="openColorPickerDialog"
              >
                <Icon icon="material-symbols:add-circle-outline" width="32" height="32" />
                <span class="text-sm font-medium">自定义颜色</span>
              </div>
            </div>
            <!-- 颜色列表 -->
            <div v-for="color in customColorList" :key="color" class="grid-item">
              <div
                class="w-[200px] h-[150px] border-2 border-transparent rounded-lg cursor-pointer"
                :style="{ backgroundColor: color }"
                @click="() => handleColorClick(color)"
              />
            </div>
          </div>
        </ScrollArea>
      </template>
    </Tabs>

    <!-- 右击菜单 -->
    <ContextMenu
      v-model="isContextMenuOpen"
      :virtual-element="virtualElement"
      :items="contextMenuItems"
      :current-item="currentItem"
    />
  </ModalContent>
</template>

<style scoped>
.responsive-grid {
  padding: 8px;
  container-type: inline-size;
}

.grid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.loading {
  text-align: center;
  color: #888;
  padding: 20px 0;
  font-size: 14px;
}

.no-more {
  text-align: center;
  color: #bbb;
  padding: 20px 0;
  font-size: 14px;
}

.no-wallpapers {
  text-align: center;
  padding: 20px 0;
}

/* 响应式调整 */
@container (max-width: 600px) {
  .responsive-grid {
    padding: 6px;
  }

  .grid-item {
    border-radius: 6px;
  }
}

@container (max-width: 400px) {
  .responsive-grid {
    padding: 4px;
  }

  .grid-item {
    border-radius: 4px;
  }

  .loading,
  .no-more {
    padding: 16px 0;
    font-size: 12px;
  }
}
</style>

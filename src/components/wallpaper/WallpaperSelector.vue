<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { closeWallpaperSelector } from '@/composables/useDialog.ts'
import { ModalContent, ModalHeader } from '@/components/modal'
import { Tabs } from '@/components/tabs'
import { Image } from '@/components/image'
import { $fetch } from 'ofetch'
import { ScrollArea } from '@/components/scroll-area'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useResponsiveGrid, responsivePresets } from '@/composables/useResponsiveGrid'

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

// 使用响应式网格
const { cols, gridStyle } = useResponsiveGrid(gridContainerRef, responsivePresets.imageGrid)

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

// 监听标签页切换，重置状态
watch(modelValue, (newValue) => {
  if (newValue === 'cloud') {
    // 重置状态并重新加载数据
    page.value = 1
    images.value = []
    reset()
    getWallpaperList()
  }
})

onMounted(() => {
  if (modelValue.value === 'cloud') {
    getWallpaperList()
  }
})
</script>

<template>
  <ModalContent size="xl">
    <ModalHeader @close="closeWallpaperSelector">
      <div class="text-xl">选择</div>
    </ModalHeader>

    <Tabs v-model="modelValue" :tabs="classificationTabs" :show-icon="false">
      <template v-for="tab in classificationTabs" :key="tab.value" #[tab.value]>
        <ScrollArea v-if="modelValue === 'cloud'" :height="400" type="hover" @areaScroll="handleScroll">
          <div ref="gridContainerRef" class="responsive-grid" :style="gridStyle">
            <div v-for="item in images" :key="item._id" class="grid-item">
              <Image
                :src="item.src.rawSrc"
                :alt="`wallpaper-${item._id}`"
                :width="200"
                :height="150"
                :preview="false"
                style="border: 1px solid #ddd; border-radius: 4px"
              />
            </div>
            <div v-if="isLoading" class="loading" :style="{ gridColumn: `1 / ${cols + 1}` }">加载中...</div>
            <div v-else-if="!hasMore" class="no-more" :style="{ gridColumn: `1 / ${cols + 1}` }">没有更多了</div>
          </div>
        </ScrollArea>
      </template>
    </Tabs>
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

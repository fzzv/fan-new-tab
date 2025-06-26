<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { closeWallpaperSelector } from '@/composables/useDialog.ts'
import { ModalContent, ModalHeader } from '@/components/modal'
import { Tabs } from '@/components/tabs'
import { Image } from '@/components/image'
import { $fetch } from 'ofetch'
import { ScrollArea } from '@/components/scroll-area'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

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
          <div class="grid">
            <Image
              v-for="item in images"
              :key="item._id"
              :src="item.src.rawSrc"
              :preview="false"
              alt="image"
              width="200px"
              height="150px"
              class="cursor-pointer"
            />
            <div v-if="isLoading" class="loading">加载中...</div>
            <div v-else-if="!hasMore" class="no-more">没有更多了</div>
          </div>
        </ScrollArea>
      </template>
    </Tabs>
  </ModalContent>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 8px;
}
.loading {
  grid-column: 1 / -1;
  text-align: center;
  color: #888;
  padding: 12px 0;
}
.no-more {
  grid-column: 1 / -1;
  text-align: center;
  color: #bbb;
  padding: 12px 0;
}
</style>

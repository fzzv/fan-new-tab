<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Tabs } from '@/components/tabs'
import { useFavorite } from '@/composables/useFavorite.ts'
import { openAddFavoriteDialog } from '@/composables/useDialog.ts'
import { useSite } from '@/composables/useSite.ts'
import { useSettings } from '@/composables/useSettings.ts'
import SiteCardGrid from '@/newtab/components/SiteCardGrid.vue'
import type { MenuItemType } from '@/components/context-menu'
import type { TabItem } from '@/components/tabs'

const { favorites, favoritesReady, removeFavorite } = useFavorite()

const menuItems = [
  {
    label: '添加收藏夹到左侧',
    icon: 'material-symbols:add-circle-outline',
    click: (item: TabItem) => {
      if (item) {
        const currentIndex = favorites.value.findIndex(fav => fav.id === item.id)
        if (currentIndex !== -1) {
          openAddFavoriteDialog(currentIndex)
        }
      }
    },
  },
  {
    label: '添加收藏夹到右侧',
    icon: 'material-symbols:add-circle-outline',
    click: (item: TabItem) => {
      if (item) {
        const currentIndex = favorites.value.findIndex(fav => fav.id === item.id)
        if (currentIndex !== -1) {
          openAddFavoriteDialog(currentIndex + 1)
        }
      }
    },
  },
  {
    label: '编辑',
    icon: 'material-symbols:edit-square-outline',
    click: () => {
      console.log(1)
    },
  },
  {
    label: '删除',
    icon: 'material-symbols:delete-outline-rounded',
    click: (item: TabItem) => {
      if (item) {
        removeFavorite(item)
      }
    },
  },
] as MenuItemType[]

const modelValue = ref('')

onMounted(() => {
  favoritesReady.then(() => {
    modelValue.value = favorites.value[0]?.value || ''
  })
})

const { sites } = useSite()
const { currentLayoutConfig, currentDisplayMode } = useSettings()

// 计算内容区域的可用高度
const contentHeight = ref<number>(0)

// 根据显示模式计算网格配置
const gridConfig = computed(() => {
  if (currentDisplayMode.value === 'favorites') {
    // 收藏夹模式：行数无限制（设为 0 表示自动计算）
    return {
      rows: 0, // 0 表示无限制，根据内容自动计算行数
      cols: currentLayoutConfig.value.cols,
      gap: currentLayoutConfig.value.gap,
    }
  } else {
    // 标准模式和极简模式：使用配置的行数
    return {
      rows: currentLayoutConfig.value.rows,
      cols: currentLayoutConfig.value.cols,
      gap: currentLayoutConfig.value.gap,
    }
  }
})

// 计算可用高度
const calculateContentHeight = () => {
  nextTick(() => {
    // 页面总高度
    const viewportHeight = window.innerHeight

    // 搜索栏区域高度（包含padding）：pt-20 + pb-10 + 搜索栏高度
    const searchAreaHeight = 80 + 40 + 60 // 80px(pt-20) + 40px(pb-10) + 60px(搜索栏)

    // 标签栏高度（估算）
    const tabsListHeight = 50

    // 内容区域的padding：p-20 pt-0
    const contentPadding = 80 // 80px(p-20, 但pt-0所以减去顶部)

    // 底部预留空间
    const bottomMargin = 100

    // 计算可用高度
    contentHeight.value = viewportHeight - searchAreaHeight - tabsListHeight - contentPadding - bottomMargin

    // 最小高度限制
    if (contentHeight.value < 200) {
      contentHeight.value = 200
    }
  })
}

function getSitesByFavoriteId(id: string) {
  return sites.value.filter((site) => site.favoriteId === id)
}

// 监听窗口大小变化
onMounted(() => {
  calculateContentHeight()
  window.addEventListener('resize', calculateContentHeight)
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', calculateContentHeight)
})
</script>

<template>
  <Tabs
    :tabs="favorites"
    v-model="modelValue"
    :items="menuItems"
    :show-icon="true"
    :content-height="contentHeight"
    class="w-[80vw]"
  >
    <template v-for="tab in favorites" :key="tab.value" #[tab.value]>
      <SiteCardGrid
        :sites="getSitesByFavoriteId(tab?.id || tab.value)"
        :rows="gridConfig.rows"
        :cols="gridConfig.cols"
        :gap="gridConfig.gap"
      />
    </template>
  </Tabs>
</template>

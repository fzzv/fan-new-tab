<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Tabs } from '@/components/tabs'
import { useFavorite } from '@/composables/useFavorite.ts'
import type { MenuItemType } from '@/components/context-menu'
import type { TabItem } from '@/components/tabs'
import SiteCardGrid from '@/newtab/components/SiteCardGrid.vue'
import { useSite } from '@/composables/useSite.ts'
import { useSettings } from '@/composables/useSettings.ts'

const { favorites, favoritesReady, removeFavorite } = useFavorite()

const menuItems = [
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
    modelValue.value = favorites.value[0]?.value
  })
})

const { sites } = useSite()
const { currentLayoutConfig, currentDisplayMode } = useSettings()

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

function getSitesByFavoriteId(id: string) {
  return sites.value.filter((site) => site.favoriteId === id)
}
</script>

<template>
  <Tabs :tabs="favorites" v-model="modelValue" :items="menuItems">
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

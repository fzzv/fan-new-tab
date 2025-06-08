<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tabs } from '@/components/tabs'
import { useFavorite } from '@/composables/useFavorite.ts'
import type { MenuItemType } from '@/components/context-menu'
import type { TabItem } from '@/components/tabs'
import SiteCardGrid from '@/newtab/components/SiteCardGrid.vue'
import { useSite } from '@/composables/useSite.ts'

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
const gridConfig = ref({
  rows: 2,
  cols: 4,
  gap: 16,
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
      ></SiteCardGrid>
    </template>
  </Tabs>
</template>

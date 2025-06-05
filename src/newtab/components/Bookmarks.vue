<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { Tabs } from '@/components/tabs'
import { useFavorite } from '@/composables/useFavorite.ts'
import { openAddFavoriteDialog } from '@/composables/useDialog'
import Button from '@/components/button/Button.vue'
import type { MenuItemType } from '@/components/context-menu'
import type { TabItem } from '@/components/tabs'

const { favorites, removeFavorite } = useFavorite()

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
  console.log(favorites.value)
  modelValue.value = favorites.value[0].value
})
</script>

<template>
  <Tabs :tabs="favorites" v-model="modelValue" :items="menuItems">
    <template v-for="tab in favorites" :key="tab.value" #[tab.value]>
      {{ tab.label }}
      <Button
        size="icon"
        @click="openAddFavoriteDialog"
      >
        <Icon icon="material-symbols:add" width="24" height="24" />
      </Button>
    </template>
  </Tabs>
</template>

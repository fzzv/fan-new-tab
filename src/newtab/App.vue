<script setup lang="ts">
import { onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ModalContainer from '@/components/modal/ModalContainer.vue'
import Button from '@/components/button/Button.vue'
import { theme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'
import Bookmarks from './components/Bookmarks.vue'
import { openAddFavoriteDialog, openPageSettingDialog } from '@/composables/useDialog.ts'
import { useWebExtStorage } from '@/composables/useWebExtStorage.ts'

const { data: isDark, dataReady: isDarkReady } = useWebExtStorage('isDark', false)

onMounted(() => {
  // 设置主题模式
  isDarkReady.then(() => {
    isDark.value = theme.value === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  })
})

async function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  theme.value = isDark.value ? 'dark' : 'light'
}
</script>

<template>
  <div class="app-container pt-10 min-h-dvh w-full relative box-border bg-background text-base font-sans">
    <div class="absolute top-5 right-5 z-20 flex items-center gap-2">
      <Button size="icon" @click="openAddFavoriteDialog">添加收藏夹</Button>
      <Button size="icon" @click="openPageSettingDialog">
        <Icon icon="material-symbols:settings-outline-rounded" width="24" height="24" />
      </Button>
      <Button size="icon" @click="toggleDark" class="cursor-pointer">
        <Icon v-if="isDark" icon="material-symbols:sunny-outline-rounded" width="24" height="24" />
        <Icon v-else icon="material-symbols:moon-stars-outline-rounded" width="24" height="24" />
      </Button>
    </div>
    <div class="max-w-[1200px] mx-auto p-20 pb-10 relative z-10">
      <SearchBar />
    </div>
    <div class="max-w-[80vw] mx-auto p-20 pt-0 relative z-10">
      <Bookmarks />
    </div>
    <ModalContainer />
  </div>
</template>

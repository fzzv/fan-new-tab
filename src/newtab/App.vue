<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ModalContainer from '@/components/modal/ModalContainer.vue'
import Button from '@/components/button/Button.vue'
import { theme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'
import Bookmarks from './components/Bookmarks.vue'

onMounted(() => {
  // 设置主题模式
  isDark.value = theme.value === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})

const isDark = ref(false)

async function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  theme.value = isDark.value ? 'dark' : 'light'
}
</script>

<template>
  <div class="app-container pt-10 min-h-dvh w-full relative box-border bg-background text-base">
    <Button size="icon" @click="toggleDark" class="absolute top-5 right-5 cursor-pointer z-20">
      <Icon v-if="isDark" icon="material-symbols:sunny-outline-rounded" width="24" height="24" />
      <Icon v-else icon="material-symbols:moon-stars-outline-rounded" width="24" height="24" />
    </Button>
    <div class="max-w-[1200px] mx-auto p-20 pb-10 relative z-10">
      <SearchBar />
    </div>
    <div class="max-w-[80vw] mx-auto p-20 pt-0 relative z-10">
      <Bookmarks />
    </div>
    <ModalContainer />
  </div>
</template>

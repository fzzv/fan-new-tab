<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ModalContainer from '@/components/modal/ModalContainer.vue'
import { theme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'

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
  <div class="app-container pt-10 min-h-dvh w-full relative box-border bg-background">
    <button @click="toggleDark" class="absolute top-5 right-5 cursor-pointer">
      <Icon v-if="isDark" class="text-border" icon="material-symbols:sunny-outline-rounded" width="24" height="24" />
      <Icon v-else class="text-border" icon="material-symbols:moon-stars-outline-rounded" width="24" height="24" />
    </button>
    <div class="max-w-[1200px] mx-auto p-20 relative z-10">
      <SearchBar />
    </div>
    <ModalContainer />
  </div>
</template>

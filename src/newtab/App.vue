<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ModalContainer from '@/components/modal/ModalContainer.vue'
import { theme } from '@/composables/useTheme'

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
  <div class="app-container pt-10 min-h-dvh w-full relative box-border bg-image">
    <button @click="toggleDark" class="absolute top-0 left-0 bg-yellow-700 dark:bg-gray-700 rounded">
      切换主题
    </button>
    <div class="max-w-[1200px] mx-auto p-5 relative z-10">
      <SearchBar />
    </div>
    <ModalContainer />
  </div>
</template>

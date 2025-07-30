<script setup lang="ts">
import { onMounted, watch } from 'vue'
import CommandPalette from './components/CommandPalette.vue'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { useGlobalShortcuts } from '@/composables/useKeyboardShortcuts'
import { useTheme, Theme } from '@/composables/useTheme'
import './contentActions'
import '@/styles/content.css' // Import content-specific styles

const commandPalette = useCommandPalette()
const { theme, themeReady } = useTheme()

// 设置全局快捷键
useGlobalShortcuts(commandPalette)

// Apply theme class to document root
const applyTheme = () => {
  document.documentElement.classList.toggle('dark', theme.value === Theme.Dark)
}

onMounted(() => {
  // Apply initial theme when ready
  themeReady.then(applyTheme)

  // Apply theme if already available
  if (theme.value) {
    applyTheme()
  }
})

// Watch for theme changes
watch(theme, applyTheme)
</script>

<template>
  <div class="fan-new-tab-command-palette">
    <CommandPalette />
  </div>
</template>

<style scoped>
.fan-new-tab-command-palette {
  /* 确保该组件不会干扰页面内容 */
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
}

/* 当命令面板打开时，允许与之进行交互操作 */
.fan-new-tab-command-palette :deep(.command-palette-overlay) {
  pointer-events: auto;
}
</style>

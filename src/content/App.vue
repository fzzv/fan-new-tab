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

const applyTheme = () => {
  // 在 html 中添加 data-fan-theme 属性
  document.documentElement.setAttribute('data-fan-theme', theme.value === Theme.Dark ? Theme.Dark : Theme.Light)
}

onMounted(() => {
  themeReady.then(applyTheme)
})

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

/* 确保命令面板覆盖层可以交互 */
.fan-new-tab-command-palette :deep(.command-palette-overlay) {
  pointer-events: auto;
}
</style>

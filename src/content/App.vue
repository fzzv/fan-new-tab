<script setup lang="ts">
import CommandPalette from './components/CommandPalette.vue'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { useGlobalShortcuts } from '@/composables/useKeyboardShortcuts'
import './contentActions'

const commandPalette = useCommandPalette()

// 设置全局快捷键
useGlobalShortcuts(commandPalette)
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

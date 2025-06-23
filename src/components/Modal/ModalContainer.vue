<script setup lang="ts">
import { isAddEngineDialog, isAddFavoriteDialog, isWallpaperSelector } from '@/composables/useDialog'
import ModalDialog from './ModalDialog.vue'
import AddEngine from '@/components/engine/AddEngine.vue'
import AddFavorite from '@/components/favorite/AddFavorite.vue'
import SettingDrawer from '@/components/setting/SettingDrawer.vue'
import WallpaperSelector from '@/components/wallpaper/WallpaperSelector.vue'
</script>

<template>
  <ModalDialog v-model="isAddEngineDialog">
    <AddEngine />
  </ModalDialog>
  <ModalDialog v-model="isAddFavoriteDialog">
    <AddFavorite />
  </ModalDialog>
  <ModalDialog v-model="isWallpaperSelector" :z-index="2001">
    <WallpaperSelector />
  </ModalDialog>
  <SettingDrawer />
</template>

<script setup lang="ts">
import {
  isAddEngineDialog,
  isAddFavoriteDialog,
  isAddSiteDialog,
  isWallpaperSelector,
  isColorPickerDialog,
  isConfirmDialog,
} from '@/composables/useDialog'
import ModalDialog from './ModalDialog.vue'
import ConfirmModal from './ConfirmModal.vue'
import AddEngine from '@/components/engine/AddEngine.vue'
import AddFavorite from '@/components/favorite/AddFavorite.vue'
import AddSite from '@/components/site/AddSite.vue'
import SettingDrawer from '@/components/setting/SettingDrawer.vue'
import WallpaperSelector from '@/components/wallpaper/WallpaperSelector.vue'
import ColorPickerDialog from '@/components/wallpaper/ColorPickerDialog.vue'
</script>

<template>
  <ModalDialog v-model="isAddEngineDialog">
    <AddEngine />
  </ModalDialog>
  <ModalDialog v-model="isAddFavoriteDialog">
    <AddFavorite />
  </ModalDialog>
  <ModalDialog v-model="isAddSiteDialog">
    <AddSite />
  </ModalDialog>
  <ModalDialog v-model="isWallpaperSelector">
    <WallpaperSelector />
  </ModalDialog>
  <ModalDialog v-model="isColorPickerDialog">
    <ColorPickerDialog />
  </ModalDialog>
  <ModalDialog v-model="isConfirmDialog">
    <ConfirmModal />
  </ModalDialog>
  <SettingDrawer />
</template>

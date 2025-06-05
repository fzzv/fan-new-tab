<script setup lang="ts">
import { isAddEngineDialog, isAddFavoriteDialog } from '@/composables/useDialog'
import ModalDialog from './ModalDialog.vue'
import AddEngine from '@/components/engine/AddEngine.vue'
import AddFavorite from '@/components/favorite/AddFavorite.vue'
</script>

<template>
  <ModalDialog v-model="isAddEngineDialog">
    <AddEngine />
  </ModalDialog>
  <ModalDialog v-model="isAddFavoriteDialog">
    <AddFavorite />
  </ModalDialog>
</template>

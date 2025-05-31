<script setup lang="ts">
import { isAddEngineDialog } from '@/composables/useDialog'
import ModalDialog from './ModalDialog.vue'
import AddEngine from '@/components/engine/AddEngine.vue'
</script>

<template>
  <ModalDialog v-model="isAddEngineDialog">
    <AddEngine />
  </ModalDialog>
</template>

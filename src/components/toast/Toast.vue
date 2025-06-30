<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster
    :toastOptions="{
      classes: {
        toast: 'h-auto w-full p-4 bg-background border text-foreground border-border flex items-center relative',
        description: 'text-muted-foreground ml-2 text-sm font-sans',
        actionButton:
          'text-primary-foreground py-1 px-2 bg-background border-border shadow border-2 ml-auto h-fit min-w-fit',
        cancelButton:
          'text-foreground py-1 px-2 text-sm bg-background border-border shadow border-2 ml-auto h-fit min-w-fit',
        title: 'ml-2 font-sans',
        closeButton: 'absolute bg-background -top-1 -left-1 rounded-full p-0.5',
      },
      unstyled: true,
    }"
    v-bind="$attrs"
  />
</template>

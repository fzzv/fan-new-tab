<script setup lang="ts">
import { ref } from 'vue'
import { Tabs } from '@/components/tabs'

const tabs = [
  {
    value: 'bookmarks',
    label: 'Bookmarks',
    icon: 'material-symbols:bookmarks-outline-rounded',
  },
  {
    value: 'bookmarks1',
    label: '1b',
    icon: 'material-symbols:bookmarks-outline-rounded',
  },
]

const modelValue = ref('bookmarks')
</script>

<template>
  <Tabs :tabs="tabs" v-model="modelValue">
    <template #bookmarks>
      {{ modelValue }}
    </template>
    <template #bookmarks1>
      {{ modelValue }}
    </template>
  </Tabs>
</template>

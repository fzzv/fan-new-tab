<script setup lang="ts">
import { ref } from 'vue'
import { closeWallpaperSelector } from '@/composables/useDialog.ts'
import { ModalContent, ModalHeader } from '@/components/modal'
import { Tabs } from '@/components/tabs'
import CloudWallpaper from './CloudWallpaper.vue'
import LocalWallpaper from './LocalWallpaper.vue'
import ColorWallpaper from './ColorWallpaper.vue'
import RecentWallpaper from './RecentWallpaper.vue'
import FavoriteWallpaper from './FavoriteWallpaper.vue'

const classificationTabs = [
  {
    label: '云端壁纸',
    value: 'cloud',
  },
  {
    label: '本地壁纸',
    value: 'local',
  },
  {
    label: '纯色壁纸',
    value: 'color',
  },
  {
    label: '最近使用',
    value: 'recent',
  },
  {
    label: '我的收藏',
    value: 'favorite',
  },
]

const modelValue = ref('cloud')
</script>

<template>
  <ModalContent size="xl">
    <ModalHeader @close="closeWallpaperSelector">
      <div class="text-xl">选择壁纸</div>
    </ModalHeader>

    <Tabs v-model="modelValue" :tabs="classificationTabs" :show-icon="false" class="p-5">
      <template v-for="tab in classificationTabs" :key="tab.value" #[tab.value]>
        <!-- 云端壁纸 -->
        <CloudWallpaper v-if="modelValue === 'cloud'" />
        <!-- 本地壁纸 -->
        <LocalWallpaper v-else-if="modelValue === 'local'" />
        <!-- 纯色壁纸 -->
        <ColorWallpaper v-else-if="modelValue === 'color'" />
        <!-- 最近使用 -->
        <RecentWallpaper v-else-if="modelValue === 'recent'" />
        <!-- 我的收藏 -->
        <FavoriteWallpaper v-else-if="modelValue === 'favorite'" />
      </template>
    </Tabs>
  </ModalContent>
</template>
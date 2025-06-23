<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { closeWallpaperSelector } from '@/composables/useDialog.ts'
import { ModalContent, ModalHeader } from '@/components/modal'
import { Tabs } from '@/components/tabs'
import { Image } from '@/components/image'
import { $fetch } from 'ofetch'

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

const modelValue = ref('')

const images = ref()

onMounted(() => {
  // 请求接口数据
  getWallpaperList()
})

function getWallpaperList() {
  // 请求接口数据
  $fetch(`http://localhost:3303/api/getWallpaperList`)
    .then(({ data }) => {
      console.log(data.list)
      images.value = data.list
    })
    .catch((err) => {
      console.log(err)
    })
}
</script>

<template>
  <ModalContent size="xl">
    <ModalHeader @close="closeWallpaperSelector">
      <div class="text-xl">选择</div>
    </ModalHeader>

    <Tabs v-model="modelValue" :tabs="classificationTabs" :show-icon="false" :contentHeight="400">
      <template v-for="tab in classificationTabs" :key="tab.value" #[tab.value]>
        <Image v-for="item in images" :key="item._id" :src="item.src.rawSrc" alt="image" width="200px" height="150px" />
      </template>
    </Tabs>
  </ModalContent>
</template>

<style scoped></style>

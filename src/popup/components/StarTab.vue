<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tabs } from 'webextension-polyfill'
import Label from '@/components/label/Label.vue'
import Input from '@/components/input/Input.vue'
import Button from '@/components/button/Button.vue'
import { urlToBase64 } from '@/lib'

// 网站名称
const siteName = ref('')
// 收藏夹
const folder = ref('')
// 网站图标
const favIcon = ref('')

onMounted(() => {
  tabs.query({ active: true, currentWindow: true }).then(async (response) => {
    const { title, favIconUrl } = response[0]
    if (title) {
      siteName.value = title
    }
    if (favIconUrl) {
      favIcon.value = await urlToBase64(favIconUrl)
    }
  })
})

function handleStar() {
  window.close()
}
</script>

<template>
  <div class="min-w-[380px] flex flex-col gap-4">
    <div class="flex items-center gap-[15px]">
      <Label for="siteName" class="w-[70px] text-right font-bold text-base">
        网站名称
      </Label>
      <Input
        v-model="siteName"
        id="siteName"
        type="text"
        placeholder="网站名称"
        class="flex-1"
      />
    </div>
    <div class="flex items-center gap-[15px]">
      <Label for="siteName" class="w-[70px] text-right font-bold text-base">
        收藏夹
      </Label>
      <Input
        v-model="folder"
        id="siteName"
        type="text"
        placeholder="网站名称"
        class="flex-1"
      />
    </div>
    <div class="flex items-center gap-[15px]">
      <Label for="siteName" class="w-[70px] text-right font-bold text-base">
        网站图标
      </Label>
      <div class="flex-1">
        <img class="w-10 h-10" :src="favIcon" :alt="siteName" />
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div></div>
      <div class="flex gap-2">
        <Button @click="handleStar">完成</Button>
        <Button @click="handleStar" variant="outline">移除</Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

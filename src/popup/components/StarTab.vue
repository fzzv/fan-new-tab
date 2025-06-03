<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tabs } from 'webextension-polyfill'
import Label from '@/components/label/Label.vue'
import Input from '@/components/input/Input.vue'
import Button from '@/components/button/Button.vue'
import { SelectRoot, SelectTrigger, SelectPortal, SelectContent, SelectGroup, SelectItem } from '@/components/select'
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
      <Label for="siteName" class="flex-1 text-right font-bold text-sm">网站名称</Label>
      <Input v-model="siteName" id="siteName" type="text" placeholder="网站名称" class="w-[300px] px-4 h-10 text-sm" />
    </div>
    <div class="flex items-center gap-[15px]">
      <Label for="siteName" class="flex-1 text-right font-bold text-sm">收藏夹</Label>
      <SelectRoot v-model="folder" id="siteName">
        <SelectTrigger placeholder="请选择收藏夹" class="w-[300px] text-sm py-2" />
        <SelectPortal>
          <SelectContent class="max-h-[120px] w-[300px] overflow-y-auto">
            <SelectGroup class="text-sm">
              <SelectItem :value="1">1</SelectItem>
              <SelectItem :value="2">2</SelectItem>
              <SelectItem :value="3">3</SelectItem>
              <SelectItem :value="4">4</SelectItem>
              <SelectItem :value="5">5</SelectItem>
              <SelectItem :value="12">5</SelectItem>
              <SelectItem :value="13">5</SelectItem>
              <SelectItem :value="123">5</SelectItem>
              <SelectItem :value="32">5</SelectItem>
              <SelectItem :value="1243">5</SelectItem>
              <SelectItem :value="14">5</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </div>
    <div class="flex items-center gap-[15px]">
      <Label for="siteName" class="flex-1 text-right font-bold text-sm">网站图标</Label>
      <div class="w-[300px]">
        <img class="w-10 h-10" :src="favIcon" :alt="siteName" />
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div></div>
      <div class="flex gap-2">
        <Button @click="handleStar" class="text-sm">完成</Button>
        <Button @click="handleStar" variant="outline" class="text-sm">移除</Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

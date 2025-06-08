<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import { tabs } from 'webextension-polyfill'
import Label from '@/components/label/Label.vue'
import Input from '@/components/input/Input.vue'
import Button from '@/components/button/Button.vue'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar'
import { SelectRoot, SelectTrigger, SelectPortal, SelectContent, SelectGroup, SelectItem } from '@/components/select'
import { urlToBase64, getCurrentTabUrl } from '@/lib'
import { useFavorite } from '@/composables/useFavorite.ts'
import { useSite } from '@/composables/useSite.ts'
import { useWebExtStorage } from '@/composables/useWebExtStorage.ts'

// 网站名称
const siteName = ref('')
// 收藏夹 记录上次选择的收藏夹
const { data: folder } = useWebExtStorage('folder', '')
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

const { addSite } = useSite()

async function handleStar() {
  addSite({
    id: uuidV4(),
    title: siteName.value,
    imageUrl: favIcon.value,
    url: await getCurrentTabUrl(),
    favoriteId: folder.value,
  })
  window.close()
}

const { favorites } = useFavorite()
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
              <SelectItem v-for="favorite in favorites" :key="favorite.value" :value="favorite.value">
                {{ favorite.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </div>
    <div class="flex items-center gap-[15px]">
      <Label for="siteName" class="flex-1 text-right font-bold text-sm">网站图标</Label>
      <div class="w-[300px]">
        <Avatar class="border-2 border-black w-10 h-10">
          <AvatarImage :src="favIcon" :alt="siteName" />
          <AvatarFallback>{{ siteName.charAt(0).toUpperCase() }}</AvatarFallback>
        </Avatar>
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

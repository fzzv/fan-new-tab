<script setup lang="ts">
import { ref } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import Label from '@/components/label/Label.vue'
import Input from '@/components/input/Input.vue'
import Button from '@/components/button/Button.vue'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar'
import { SelectRoot, SelectTrigger, SelectPortal, SelectContent, SelectGroup, SelectItem } from '@/components/select'
import { useFavorite } from '@/composables/useFavorite.ts'
import { useSite } from '@/composables/useSite.ts'
import { useWebExtStorage } from '@/composables/useWebExtStorage.ts'
import { closeAddSiteDialog } from '@/composables/useDialog.ts'
import ModalHeader from '@/components/modal/ModalHeader.vue'
import ModalContent from '@/components/modal/ModalContent.vue'
import ModalFooter from '@/components/modal/ModalFooter.vue'
import { getFavicon } from '@/lib'

// 网站名称
const siteName = ref('')
// 网站URL
const siteUrl = ref('')
// 收藏夹 记录上次选择的收藏夹
const { data: folder } = useWebExtStorage('folder', 'default')
// 网站图标
const favIcon = ref('')

const { addSite } = useSite()
const { favorites } = useFavorite()

// 处理图标URL输入变化
const handleIconUrlChange = (url: string) => {
  favIcon.value = getFavicon(url)
}

// 添加网站
function handleAddSite() {
  if (!siteName.value.trim()) {
    return
  }

  addSite({
    id: uuidV4(),
    title: siteName.value,
    imageUrl: favIcon.value,
    url: siteUrl.value,
    favoriteId: folder.value,
  })

  handleCancel()
}

// 取消添加
function handleCancel() {
  // 重置表单
  siteName.value = ''
  siteUrl.value = ''
  favIcon.value = ''

  closeAddSiteDialog()
}
</script>

<template>
  <ModalContent>
    <ModalHeader @close="closeAddSiteDialog">
      <div class="text-xl">添加网站</div>
    </ModalHeader>
    <form class="flex flex-col gap-4" @submit.prevent="handleAddSite">
      <div class="flex flex-col pt-6 pb-4 px-4 gap-4">
        <div class="flex items-center gap-[15px]">
          <Label for="siteName" class="flex-1 text-right font-bold text-sm">网站名称</Label>
          <Input
            v-model="siteName"
            id="siteName"
            type="text"
            placeholder="请输入网站名称"
            class="w-[300px] px-4 h-10 text-sm"
          />
        </div>

        <div class="flex items-center gap-[15px]">
          <Label for="siteUrl" class="flex-1 text-right font-bold text-sm">网站地址</Label>
          <Input
            v-model="siteUrl"
            @update:model-value="handleIconUrlChange"
            id="siteUrl"
            type="url"
            placeholder="https://example.com"
            class="w-[300px] px-4 h-10 text-sm"
          />
        </div>

        <div class="flex items-center gap-[15px]">
          <Label for="favoriteSelect" class="flex-1 text-right font-bold text-sm">收藏夹</Label>
          <SelectRoot v-model="folder" id="favoriteSelect">
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
          <Label class="flex-1 text-right font-bold text-sm">网站图标</Label>
          <div class="w-[300px]">
            <Avatar class="border-2 border-border w-10 h-10">
              <AvatarImage :src="favIcon" :alt="siteName" />
              <AvatarFallback>{{ siteName.charAt(0).toUpperCase() || '?' }}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      <ModalFooter>
        <div class="flex gap-2">
          <Button @click="handleAddSite" class="text-sm">添加</Button>
          <Button @click="handleCancel" variant="outline" class="text-sm">取消</Button>
        </div>
      </ModalFooter>
    </form>
  </ModalContent>
</template>

<style scoped></style>

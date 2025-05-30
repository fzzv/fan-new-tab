<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEngine } from '@/composables/useEngine'
import { closeAddEngineDialog } from '@/composables/useDialog'
import { isValidDomain, getFavicon, generateAvatar } from "@/lib/utils"

const engineName = ref('')
const engineUrl = ref('')
const engineIcon = ref('')
const { addSearchEngine } = useEngine()

const avatar = ref('')
const activeIcon = ref(avatar.value)

watch(engineUrl, (newValue) => {
  if (newValue && isValidDomain(newValue)) {
    engineIcon.value = getFavicon(newValue)
  }
})

watch(engineName, (newValue) => {
  avatar.value = generateAvatar(newValue)
}, { immediate: true })

const handleAddEngine = () => {
  if (engineName.value && engineUrl.value) {
    addSearchEngine({
      name: engineName.value,
      url: engineUrl.value,
      icon: activeIcon.value
    })
    closeAddEngineDialog()
  }
}
</script>

<template>
  <form
    class="flex justify-center items-center max-w-150 py-6 flex-col gap-3"
    @submit.prevent="handleAddEngine">
    <div class="text-center text-base-light text-xl mb-5">
      自定义搜索引擎
    </div>
    <div class="flex items-center gap-2 rounded w-full bg-gray-100 px-4 py-2">
      <span class="text-secondary-light me-1">名称：</span>
      <input 
        v-model="engineName"
        autocapitalize="off"
        inputmode="text"
        placeholder="请输入搜索引擎名称"
        spellcheck="false"
        autocorrect="off"
        autocomplete="off"
        class="outline-none bg-transparent w-full max-w-50"
      />
    </div>
    <div class="flex items-center gap-2 rounded w-full bg-gray-100 px-4 py-2">
      <span class="text-secondary-light me-1">URL：</span>
      <input 
        v-model="engineUrl"
        autocapitalize="off"
        inputmode="text"
        placeholder="请输入搜索引擎URL"
        spellcheck="false"
        autocorrect="off"
        autocomplete="off"
        class="outline-none bg-transparent w-full max-w-50"
      />
    </div>
    <div class="flex items-center w-full">
      <span>图标：</span>
      <img
        :src="avatar"
        class="w-10 h-10"
        :class="{ active: activeIcon === avatar}"
        alt="favicon"
        @click="activeIcon = avatar"
      />
      <img
        v-if="engineIcon"
        :src="engineIcon"
        class="w-10 h-10"
        :class="{ active: activeIcon === engineIcon}"
        alt="favicon"
        @click="activeIcon = engineIcon"
      />
    </div>
    <button
      class="bg-primary-light text-white px-5 py-2 rounded bg-amber-600"
      @click="handleAddEngine"
    >
      确定
    </button>
  </form>
</template>

<style scoped>
.active {
  border: 2px solid #E17100;
  border-radius: 50%;
}
</style>

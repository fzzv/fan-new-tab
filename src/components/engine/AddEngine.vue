<script setup lang="ts">
import { useEngine } from '@/composables/useEngine'
import { closeAddEngineDialog } from '@/composables/useDialog'

const engineName = ref('')
const engineUrl = ref('')
const { addSearchEngine } = useEngine()

const handleAddEngine = () => {
  if (engineName.value && engineUrl.value) {
    addSearchEngine({
      name: engineName.value,
      url: engineUrl.value,
      icon: 'https://www.google.com/favicon.ico'
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
    <button
      class="bg-primary-light text-white px-5 py-2 rounded bg-amber-600"
      @click="handleAddEngine"
    >
      确定
    </button>
  </form>
</template>

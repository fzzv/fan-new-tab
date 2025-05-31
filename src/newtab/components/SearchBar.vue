<script setup lang="ts">
import { ref } from 'vue'
import { openAddEngineDialog } from '@/composables/useDialog'
import { useEngine } from '@/composables/useEngine'
import { Icon } from '@iconify/vue'
import Input from '@/components/input/Input.vue'
import Popover from '@/components/popover/Popover.vue'
import { cn } from '@/lib/utils.ts'

const searchQuery = ref('')
const { selectedEngine, searchEngines, removeSearchEngine, selectEngine } = useEngine()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    window.open(selectedEngine.value.url + encodeURIComponent(searchQuery.value), '_blank')
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

</script>

<template>
  <div class="w-full max-w-[600px] my-5 mx-auto">
    <Input
      v-model="searchQuery"
      placeholder="输入搜索内容"
      class="rounded-xl py-4"
      @keydown="handleKeyDown"
    >
      <template #prefix>
        <Popover class="w-dvw max-w-[600px]" align="start" :alignOffset="-50" :sideOffset="45">
          <template #trigger>
            <img
              :src="selectedEngine.icon"
              class="w-8 h-8 px-1 py-1 rounded-full cursor-pointer border-2 border-border"
              alt="搜索引擎"
            />
          </template>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 p-2">
            <div
              v-for="(engine, index) in searchEngines"
              :key="engine.name"
              :class="cn(' relative flex flex-col items-center justify-center aspect-square p-3 rounded-xl',
                'cursor-pointer transition-all duration-200 ease-in-out border-2 border-secondary hover:-translate-y-0.5',
                { 'border-2 border-primary': selectedEngine.name === engine.name }
              )"
              @click="selectEngine(engine)"
            >
              <img class="w-5 h-5 mb-2" :src="engine.icon" :alt="engine.name" />
              <span class="text-xs text-secondary text-center overflow-hidden text-ellipsis whitespace-nowrap w-full">{{ engine.name }}</span>
              <button
                class="absolute top-1 right-1 w-5 h-5 rounded-full cursor-pointer flex items-center justify-center"
                @click.stop="removeSearchEngine(index)"
                title="删除搜索引擎"
              >
                <Icon icon="material-symbols:close-small-outline-rounded" width="24" height="24" />
              </button>
            </div>
            <div
              class="flex flex-col items-center justify-center aspect-square p-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border-2 border-secondary hover:-translate-y-0.5"
              @click="openAddEngineDialog"
            >
              <Icon class="text-secondary" icon="material-symbols:add-2-rounded" width="24" height="24" />
            </div>
          </div>
        </Popover>
      </template>
      <template #suffix>
        <button @click="handleSearch" class="cursor-pointer">
          <Icon icon="material-symbols:search-rounded" width="24" height="24" class="text-secondary" />
        </button>
      </template>
    </Input>
  </div>
</template>

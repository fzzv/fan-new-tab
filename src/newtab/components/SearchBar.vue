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

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

</script>

<template>
  <div class="w-full max-w-[600px] my-5 mx-auto">
    <div>
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="输入搜索内容"
        class="rounded-xl border-[var(--border)]"
        @keypress="handleKeyPress"
      >
        <template #prefix>
          <Popover class="w-dvw max-w-[600px]" align="start" :alignOffset="-40" :sideOffset="40">
            <template #trigger>
              <img
                :src="selectedEngine.icon"
                class="w-6 h-6 rounded-full cursor-pointer"
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
              <!-- 添加按钮 -->
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
            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
          </button>
        </template>
      </Input>
    </div>
  </div>
</template>

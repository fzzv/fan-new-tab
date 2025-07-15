<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { openAddEngineDialog } from '@/composables/useDialog'
import { useEngine } from '@/composables/useEngine'
import { useSettings } from '@/composables/useSettings'
import { Icon } from '@iconify/vue'
import Input from '@/components/input/Input.vue'
import Popover from '@/components/popover/Popover.vue'
import { cn } from '@/lib/utils.ts'

const searchQuery = ref('')
const { selectedEngine, searchEngines, removeSearchEngine, selectEngine } = useEngine()
const { searchBarConfig, searchBarConfigReady } = useSettings()

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

// 设置 CSS 变量值
const setCssVar = (varName: string, value: number) => {
  console.log(value, 'value')
  if (varName === '--search-width') {
    // 将 50-150 的值映射到 40vw-80vw
    const vwValue = 20 + value * 0.4 // 50->40vw, 150->80vw
    document.documentElement.style.setProperty(varName, `${vwValue}vw`)
  } else if (varName === '--search-height') {
    // 高度根据宽度自适应，基础高度60px，按比例调整
    const heightValue = 60 * (value / 100)
    document.documentElement.style.setProperty(varName, `${heightValue}px`)
  } else if (varName === '--search-radius') {
    document.documentElement.style.setProperty(varName, `${value}rem`)
  } else if (varName === '--search-opacity') {
    document.documentElement.style.setProperty(varName, (value / 100).toString())
  }
}

// 初始化CSS变量
const initializeCssVars = () => {
  const { size, radius, opacity } = searchBarConfig.value
  setCssVar('--search-width', size)
  setCssVar('--search-height', size)
  setCssVar('--search-radius', radius)
  setCssVar('--search-opacity', opacity)
}

// 搜索框中图标的大小
const iconSize = computed(() => {
  return Math.min(40, Math.max(26, (searchBarConfig.value.size / 100) * 60 - 20))
})

// 组件挂载时初始化CSS变量
onMounted(() => {
  searchBarConfigReady.then(() => {
    initializeCssVars()
  })
})
</script>

<template>
  <div
    v-if="searchBarConfigReady && searchBarConfig.visible"
    class="w-[var(--search-width)] h-[var(--search-height)] my-5 mx-auto min-w-[400px] max-w-[1200px]"
    :style="{ opacity: 'var(--search-opacity)' }"
  >
    <Input
      v-model="searchQuery"
      placeholder="输入搜索内容"
      class="h-full bg-background"
      :style="{ borderRadius: 'var(--search-radius)' }"
      @keydown="handleKeyDown"
    >
      <template #prefix>
        <Popover class="w-[var(--search-width)]" align="start" :alignOffset="-65" :sideOffset="45">
          <template #trigger>
            <img
              :src="selectedEngine.icon"
              class="px-1 py-1 rounded-full cursor-pointer border-2 border-border mr-2"
              alt="搜索引擎"
              :style="{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
              }"
            />
          </template>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-4 p-2">
            <div
              v-for="(engine, index) in searchEngines"
              :key="engine.name"
              :class="
                cn(
                  ' relative flex flex-col items-center justify-center aspect-square rounded-xl group',
                  'cursor-pointer transition-all duration-200 ease-in-out border-2 border-secondary',
                  { 'border-2 border-primary': selectedEngine.name === engine.name },
                )
              "
              @click="selectEngine(engine)"
            >
              <img class="w-5 h-5 mb-2" :src="engine.icon" :alt="engine.name" />
              <span class="text-xs text-secondary text-center overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {{ engine.name }}
              </span>
              <button
                :class="
                  cn(
                    'absolute -top-2 -right-2 w-5 h-5 rounded-full cursor-pointer',
                    'flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-200 ease-in-out',
                    'bg-destructive/80 text-background hover:text-primary',
                  )
                "
                @click.stop="removeSearchEngine(index)"
                title="删除搜索引擎"
              >
                <Icon icon="material-symbols:close-small-outline-rounded" width="16" height="16" />
              </button>
            </div>
            <div
              :class="
                cn(
                  'flex flex-col items-center justify-center aspect-square p-3 rounded-xl cursor-pointer',
                  'transition-all duration-200 ease-in-out border-2 border-secondary hover:-translate-y-0.5',
                )
              "
              @click="openAddEngineDialog"
            >
              <Icon class="text-secondary" icon="material-symbols:add-2-rounded" width="24" height="24" />
            </div>
          </div>
        </Popover>
      </template>
      <template #suffix>
        <button v-if="searchBarConfig.showSearchButton" @click="handleSearch" class="cursor-pointer">
          <Icon icon="material-symbols:search-rounded" :width="iconSize" :height="iconSize" class="text-secondary" />
        </button>
      </template>
    </Input>
  </div>
</template>

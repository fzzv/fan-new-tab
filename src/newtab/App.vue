<script setup lang="ts">
import { computed, onMounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import ModalContainer from '@/components/modal/ModalContainer.vue'
import Button from '@/components/button/Button.vue'
import { Toast } from '@/components/toast'
import { useTheme, Theme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'
import { openPageSettingDialog } from '@/composables/useDialog.ts'
import { useSettings } from '@/composables/useSettings'
import FavoritesMode from './components/FavoritesMode.vue'
import StandardMode from './components/StandardMode.vue'
import { cn, isColor } from '@/lib'

const { backgroundConfig, backgroundConfigReady, currentDisplayMode, themeColorConfigReady, applyThemeColors } =
  useSettings()
const { theme, themeReady } = useTheme()

onMounted(() => {
  // 设置主题模式
  themeReady.then(() => {
    document.documentElement.classList.toggle('dark', theme.value === Theme.Dark)
  })
  // 设置背景
  backgroundConfigReady.then(() => {
    const { background, blur, opacity } = backgroundConfig.value

    // 设置背景图片
    if (isColor(background)) {
      // 如果是颜色值，直接设置
      document.documentElement.style.setProperty('--background-image', background)
    } else {
      // 如果是图片URL或base64，使用url()包装
      const backgroundValue = background.startsWith('data:') ? `url("${background}")` : `url(${background})`
      document.documentElement.style.setProperty('--background-image', backgroundValue)
    }

    document.documentElement.style.setProperty('--backdrop-filter-blur', `${blur[0]}px`)
    document.documentElement.style.setProperty('--background-mask-opacity', `${opacity[0] / 100}`)
  })

  // 设置主题颜色
  themeColorConfigReady.then(() => {
    applyThemeColors()
  })
})

const isDark = computed(() => theme.value === Theme.Dark)

async function toggleDark() {
  theme.value = theme.value === Theme.Dark ? Theme.Light : Theme.Dark
  document.documentElement.classList.toggle('dark', theme.value === Theme.Dark)
}
</script>

<template>
  <div class="app-container w-full relative box-border bg-image text-base font-sans text-foreground">
    <div class="absolute top-5 right-5 z-20 flex items-center gap-2">
      <Button size="icon" @click="openPageSettingDialog">
        <Icon icon="material-symbols:settings-outline-rounded" width="24" height="24" />
      </Button>
      <Button size="icon" @click="toggleDark" class="cursor-pointer">
        <Icon v-if="isDark" icon="material-symbols:sunny-outline-rounded" width="24" height="24" />
        <Icon v-else icon="material-symbols:moon-stars-outline-rounded" width="24" height="24" />
      </Button>
    </div>
    <div :class="cn('mx-auto pb-10 relative z-10', currentDisplayMode !== 'minimal' && 'mt-40')">
      <SearchBar />
    </div>
    <div v-if="currentDisplayMode !== 'minimal'" class="flex-1 mx-auto py-20 pt-0 relative z-10">
      <FavoritesMode v-if="currentDisplayMode === 'favorites'" />
      <StandardMode v-else />
    </div>
    <ModalContainer />
    <Toast />
  </div>
</template>

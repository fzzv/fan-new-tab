<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { useSite } from '@/composables/useSite'
import SiteCardGrid from '@/newtab/components/SiteCardGrid.vue'

const { sites } = useSite()
const { currentLayoutConfig } = useSettings()

// 根据显示模式计算网格配置
const gridConfig = computed(() => {
  return {
    rows: currentLayoutConfig.value.rows,
    cols: currentLayoutConfig.value.cols,
    gap: currentLayoutConfig.value.gap,
  }
})
</script>

<template>
  <SiteCardGrid :sites="sites" :rows="gridConfig.rows" :cols="gridConfig.cols" :gap="gridConfig.gap" />
</template>

<style scoped></style>

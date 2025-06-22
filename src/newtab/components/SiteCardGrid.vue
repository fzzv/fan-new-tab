<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import SiteCard from './SiteCard.vue'
import type { ClassValue } from 'clsx'

// 网站数据接口
export interface SiteData {
  id: string | number
  title: string
  favoriteId?: string
  imageUrl: string
  url?: string
  alt?: string
}

// 组件属性
interface SiteCardGridProps {
  sites: SiteData[]
  rows?: number
  cols?: number
  gap?: number
  rowGap?: number
  colGap?: number
  maxWidth?: string
}

const props = withDefaults(defineProps<SiteCardGridProps>(), {
  sites: () => [],
  rows: 2,
  cols: 4,
  gap: 16,
  rowGap: undefined,
  colGap: undefined,
  maxWidth: '100%',
})

// 事件定义
const emit = defineEmits<{
  (e: 'site-click', site: SiteData): void
}>()

// 验证行列数范围
const validatedRows = computed(() => {
  // 如果 rows 为 0 或负数，表示无限制，根据网站数量自动计算行数
  if (props.rows <= 0) {
    const sitesCount = props.sites.length
    if (sitesCount === 0) return 1
    return Math.ceil(sitesCount / validatedCols.value)
  }
  return Math.max(1, props.rows)
})

const validatedCols = computed(() => Math.max(1, Math.min(8, props.cols)))

// 计算实际使用的间距
const actualRowGap = computed(() => props.rowGap ?? props.gap)
const actualColGap = computed(() => props.colGap ?? props.gap)

// 计算网格总容量
const totalSlots = computed(() => {
  // 如果行数无限制（props.rows <= 0），则容量等于网站数量
  if (props.rows <= 0) {
    return props.sites.length
  }
  return validatedRows.value * validatedCols.value
})

// 显示的网站数据（限制在网格容量内）
const displaySites = computed(() => props.sites.slice(0, totalSlots.value))

// 计算网格样式
const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateRows: `repeat(${validatedRows.value}, 1fr)`,
  gridTemplateColumns: `repeat(${validatedCols.value}, 1fr)`,
  gap: `${actualRowGap.value}px ${actualColGap.value}px`,
  maxWidth: props.maxWidth,
  width: '100%',
  height: 'fit-content',
}))

// 处理网站点击
const handleSiteClick = (site: SiteData) => {
  emit('site-click', site)

  // 如果有URL，在新标签页打开
  if (site.url) {
    window.open(site.url, '_blank')
  }
}
</script>

<template>
  <div :class="cn('site-card-grid', $attrs.class as ClassValue)" :style="gridStyle">
    <!-- 渲染网站卡片 -->
    <div v-for="site in displaySites" :key="site.id" class="site-card-slot">
      <SiteCard :image-url="site.imageUrl" :title="site.title" :alt="site.alt" @click="handleSiteClick(site)" />
    </div>
  </div>
</template>

<style scoped>
.site-card-grid {
  container-type: inline-size;
}

.site-card-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.site-card-slot-empty {
  min-height: 80px;
  aspect-ratio: 1;
}

/* 响应式调整 */
@container (max-width: 600px) {
  .site-card-grid {
    gap: 12px !important;
  }

  .site-card-slot-empty {
    min-height: 60px;
  }
}

@container (max-width: 400px) {
  .site-card-grid {
    gap: 8px !important;
  }

  .site-card-slot-empty {
    min-height: 50px;
    font-size: 0.75rem;
  }
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStandardModeSize } from '@/composables/useViewportSize'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Mousewheel } from 'swiper/modules'
import { useStandardModeAuto } from '@/composables/useStandardModeAuto'
import { useSettings } from '@/composables/useSettings'
import SiteCardGrid from './SiteCardGrid.vue'
import type { SiteData } from './SiteCardGrid.vue'

// Swiper 样式
import 'swiper/css'
import 'swiper/css/pagination'

const { panels, totalPanels, panelCapacity } = useStandardModeAuto()
const { currentLayoutConfig } = useSettings()

// Swiper 实例引用
const swiperRef = ref<any>(null)
const currentSlideIndex = ref(0)

// Swiper 模块
const modules = [Pagination, Mousewheel]

// 网格配置
const gridConfig = computed(() => ({
  rows: currentLayoutConfig.value.rows,
  cols: currentLayoutConfig.value.cols,
  gap: currentLayoutConfig.value.gap,
}))

// Swiper 配置
const swiperOptions = computed(() => ({
  modules,
  slidesPerView: 1,
  spaceBetween: 0,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true,
    dynamicMainBullets: 3,
  },
  mousewheel: {
    enabled: true,
    forceToAxis: false,
    sensitivity: 3,
    releaseOnEdges: true,
    thresholdDelta: 50,
  },
  on: {
    slideChange: (swiper: any) => {
      currentSlideIndex.value = swiper.activeIndex
    },
    init: (swiper: any) => {
      swiperRef.value = swiper
    },
  },
}))

// 处理网站点击
const handleSiteClick = (site: SiteData) => {
  if (site.url) {
    window.open(site.url, '_blank')
  }
}

// 计算当前面板信息
const currentPanelInfo = computed(() => {
  const current = currentSlideIndex.value + 1
  const total = totalPanels.value
  const capacity = panelCapacity.value
  const currentPanel = panels.value[currentSlideIndex.value]
  const sitesCount = currentPanel?.sites.length || 0

  return {
    current,
    total,
    capacity,
    sitesCount,
    hasMultiplePanels: total > 1,
  }
})
const { availableWidth, availableHeight } = useStandardModeSize()

// 动态计算容器样式
const containerStyle = computed(() => ({
  width: `${availableWidth.value}px`,
  height: `${availableHeight.value}px`,
  maxWidth: '100%',
  maxHeight: '100%',
}))
</script>

<template>
  <div class="flex items-center justify-center overflow-hidden" :style="containerStyle">
    <div class="w-full h-full min-h-[500px] relative">
      <!-- Swiper 容器 -->
      <Swiper v-if="panels.length > 0" v-bind="swiperOptions" class="w-full h-full overflow-hidden">
        <SwiperSlide v-for="panel in panels" :key="panel.id" class="w-full h-full flex items-center justify-center">
          <SiteCardGrid
            :sites="panel.sites"
            :rows="gridConfig.rows"
            :cols="gridConfig.cols"
            :gap="gridConfig.gap"
            @site-click="handleSiteClick"
          />
        </SwiperSlide>
        <!-- 分页指示器 (只在多面板时显示) -->
        <div v-if="currentPanelInfo.hasMultiplePanels" class="swiper-pagination"></div>
      </Swiper>
    </div>
  </div>
</template>

<style>
/* Swiper 分页器样式 */
.swiper-pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.swiper-pagination-bullet {
  background: var(--primary);
  opacity: 0.7;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.swiper-pagination-bullet-active {
  background: var(--primary);
  opacity: 1;
  transform: scale(1.2);
}

.swiper-pagination-bullet:hover {
  opacity: 0.8;
  transform: scale(1.1);
}
</style>

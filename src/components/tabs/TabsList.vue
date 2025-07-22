<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, inject } from 'vue'
import { TabsList } from 'reka-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/button'
import { Icon } from '@iconify/vue'
import { debounce } from 'lodash-es'
import type { ClassValue } from 'clsx'

defineProps<{
  asChild?: boolean
}>()

// 暴露方法给父组件使用
defineExpose({
  scrollTabIntoView,
  updateScrollState,
})

// DOM elements
const scrollContainerRef = ref<HTMLElement>()

// Scroll state
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const isScrolling = ref(false)
const hasOverflow = ref(false)

// 将父级TabsRoot中的当前选项卡值注入进来，以便监听其变化情况
const currentTabValue = inject<any>('currentTabValue', ref(null))

// 获取 scroll 容器内 TabsList 的所有 tab 元素
function getTabElements(): HTMLElement[] {
  if (!scrollContainerRef.value) return []

  // 在 scroll 容器内查找 TabsList 元素
  const tabsList = scrollContainerRef.value.querySelector('[role="tablist"]') as HTMLElement
  if (!tabsList) return []

  // 尝试不同选择器查找 tab 元素
  const selectors = [
    '[role="tab"]',
    'button[data-state]',
    'button',
    '.tab-trigger',
    '> *', // 兜底：直接子元素
  ]

  for (const selector of selectors) {
    const elements = Array.from(tabsList.querySelectorAll(selector)) as HTMLElement[]
    if (elements.length > 0) {
      return elements
    }
  }

  // 兜底：TabsList 的所有子元素
  return Array.from(tabsList.children) as HTMLElement[]
}

// 计算单个 tab 的宽度（包含间距）
function getTabWidth(): number {
  const tabs = getTabElements()
  if (tabs.length === 0) return 120 // 默认宽度

  // 获取第一个 tab 的宽度（包含间距）
  const firstTab = tabs[0]
  const rect = firstTab.getBoundingClientRect()

  // space-x-2 间距（0.5rem = 8px）
  const gapSize = 8

  return Math.ceil(rect.width + gapSize)
}

// 精确计算滚动状态
function updateScrollState() {
  if (!scrollContainerRef.value) return

  const container = scrollContainerRef.value
  const scrollLeft = container.scrollLeft
  const scrollWidth = container.scrollWidth
  const clientWidth = container.clientWidth

  // 判断内容是否溢出
  const contentOverflows = scrollWidth > clientWidth
  hasOverflow.value = contentOverflows

  // 只有溢出时才显示按钮
  if (!contentOverflows) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }

  // 更精确的判断是否可左右滚动
  const threshold = 1 // 减小浮点误差容忍度
  const newCanScrollLeft = scrollLeft > threshold
  const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - threshold

  canScrollLeft.value = newCanScrollLeft
  canScrollRight.value = newCanScrollRight
}

// 滚动指定的tab到可见区域
function scrollTabIntoView(tabValue: string) {
  if (!scrollContainerRef.value || !tabValue) return

  const container = scrollContainerRef.value
  const tabs = getTabElements()

  // 找到对应的tab元素，使用更精确的查找方式
  const targetTab = tabs.find((tab) => {
    // 检查reka-ui TabsTrigger的data-value属性
    const dataValue = tab.getAttribute('data-value')
    if (dataValue === tabValue) return true

    // 检查value属性
    const value = tab.getAttribute('value')
    if (value === tabValue) return true

    // 检查aria-controls属性（通常指向对应的content）
    const ariaControls = tab.getAttribute('aria-controls')
    return !!(ariaControls && ariaControls.includes(tabValue))
  })

  if (!targetTab) return

  const containerRect = container.getBoundingClientRect()
  const tabRect = targetTab.getBoundingClientRect()

  // 计算tab相对于容器的位置
  const tabLeft = tabRect.left - containerRect.left + container.scrollLeft
  const tabRight = tabLeft + tabRect.width

  // 检查tab是否在可见区域内
  const visibleLeft = container.scrollLeft
  const visibleRight = container.scrollLeft + container.clientWidth

  // 如果tab不在可见区域，滚动到合适位置
  if (tabLeft < visibleLeft) {
    // tab在左侧不可见，滚动到左边
    container.scrollTo({
      left: Math.max(0, tabLeft - 20), // 留一点边距
      behavior: 'smooth',
    })
  } else if (tabRight > visibleRight) {
    // tab在右侧不可见，滚动到右边
    container.scrollTo({
      left: tabRight - container.clientWidth + 20, // 留一点边距
      behavior: 'smooth',
    })
  }
}

// 计算每次滚动的距离（单个 tab 宽度）
function getScrollAmount(): number {
  return getTabWidth()
}

// 向左滚动
function scrollToLeft() {
  if (!scrollContainerRef.value || isScrolling.value || !canScrollLeft.value) return

  isScrolling.value = true
  const container = scrollContainerRef.value
  const scrollAmount = getScrollAmount()

  container.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth',
  })

  // 使用scrollend事件或fallback到timeout
  const handleScrollEnd = () => {
    isScrolling.value = false
    updateScrollState()
    container.removeEventListener('scrollend', handleScrollEnd)
  }

  if ('onscrollend' in container) {
    container.addEventListener('scrollend', handleScrollEnd, { once: true })
  } else {
    // 不支持scrollend事件的浏览器 用定时器处理
    setTimeout(handleScrollEnd, 350)
  }
}

// 向右滚动
function scrollToRight() {
  if (!scrollContainerRef.value || isScrolling.value || !canScrollRight.value) return

  isScrolling.value = true
  const container = scrollContainerRef.value
  const scrollAmount = getScrollAmount()

  container.scrollBy({
    left: scrollAmount,
    behavior: 'smooth',
  })

  // 使用scrollend事件或fallback到timeout
  const handleScrollEnd = () => {
    isScrolling.value = false
    updateScrollState()
    container.removeEventListener('scrollend', handleScrollEnd)
  }

  if ('onscrollend' in container) {
    container.addEventListener('scrollend', handleScrollEnd, { once: true })
  } else {
    // Fallback for browsers that don't support scrollend
    setTimeout(handleScrollEnd, 350)
  }
}

// 滚动事件防抖，提升性能
const debouncedUpdateScrollState = debounce(() => {
  if (!isScrolling.value) {
    updateScrollState()
  }
}, 16) // 约 60fps

function handleScroll() {
  // 立即更新状态以获得更好的响应性
  if (!isScrolling.value) {
    updateScrollState()
  }
  debouncedUpdateScrollState()
}

// 鼠标滚轮横向滚动
function handleWheel(event: WheelEvent) {
  if (!scrollContainerRef.value || !hasOverflow.value) return

  // 只处理垂直滚动，转为横向滚动
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.preventDefault()

    const container = scrollContainerRef.value
    const scrollAmount = getScrollAmount() // 每次滚动一个 tab

    if (event.deltaY > 0) {
      // 向下滚动 = 向右滚动
      if (canScrollRight.value) {
        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        })
      }
    } else {
      // 向上滚动 = 向左滚动
      if (canScrollLeft.value) {
        container.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth',
        })
      }
    }
  }
}

// 键盘左右键滚动
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' && canScrollLeft.value) {
    event.preventDefault()
    scrollToLeft()
  } else if (event.key === 'ArrowRight' && canScrollRight.value) {
    event.preventDefault()
    scrollToRight()
  }
}

// 响应式监听和内容变更监听
let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

// 监听 scroll 容器变化，更新状态
watch(scrollContainerRef, (newRef) => {
  if (newRef) {
    nextTick(() => {
      updateScrollState()
    })
  }
})

// 监听当前tab值变化，自动滚动到可见区域
watch(
  currentTabValue,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        scrollTabIntoView(newValue)
      })
    }
  },
  { immediate: false },
)

onMounted(() => {
  nextTick(() => {
    updateScrollState()

    // 设置 resize observer，监听容器尺寸变化
    if (scrollContainerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        nextTick(() => updateScrollState())
      })
      resizeObserver.observe(scrollContainerRef.value)

      // 设置 mutation observer，监听内容变更（tab 增删）
      mutationObserver = new MutationObserver(() => {
        nextTick(() => updateScrollState())
      })
      mutationObserver.observe(scrollContainerRef.value, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'], // 监听影响布局的属性
      })
    }
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
  // 取消防抖
  debouncedUpdateScrollState.cancel()
})
</script>

<template>
  <div class="relative flex items-center">
    <!-- Left scroll button -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-x-2"
      leave-to-class="opacity-0 -translate-x-2"
    >
      <Button
        v-if="canScrollLeft"
        variant="outline"
        size="icon"
        class="absolute -left-10 z-10 h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background"
        @click="scrollToLeft"
        aria-label="Scroll tabs left"
      >
        <Icon icon="material-symbols:chevron-left" width="16" height="16" />
      </Button>
    </Transition>

    <!-- Scroll container wrapper -->
    <div
      ref="scrollContainerRef"
      :class="
        cn('flex-1 overflow-x-auto scrollbar-hide scroll-smooth', canScrollLeft && 'pl-10', canScrollRight && 'pr-10')
      "
      @scroll="handleScroll"
      @wheel="handleWheel"
      @keydown="handleKeyDown"
      tabindex="0"
      role="tablist"
      aria-label="Tab navigation"
    >
      <!-- Inner TabsList with fixed width to prevent shrinking -->
      <TabsList :class="cn('flex space-x-2 w-max min-w-full', $attrs.class as ClassValue)" v-bind="$attrs">
        <slot />
      </TabsList>
    </div>

    <!-- Right scroll button -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-x-2"
      leave-to-class="opacity-0 translate-x-2"
    >
      <Button
        v-if="canScrollRight"
        variant="outline"
        size="icon"
        class="absolute -right-10 z-10 h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background"
        @click="scrollToRight"
        aria-label="Scroll tabs right"
      >
        <Icon icon="material-symbols:chevron-right" width="16" height="16" />
      </Button>
    </Transition>
  </div>
</template>

<style scoped>
/* 隐藏滚动条但保留滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 确保 tabs 保持自然宽度，不收缩 */
:deep([role='tab']) {
  flex-shrink: 0;
  white-space: nowrap;
}

/* 确保 TabsList 容器不收缩其子元素 */
:deep([role='tablist']) {
  flex-shrink: 0;
}
</style>

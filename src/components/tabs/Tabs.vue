<script setup lang="ts">
import { provide } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from './index'
import { Icon } from '@iconify/vue'
import { cn } from '@/lib/utils'
import { useContextMenu } from '@/composables/useContextMenu.ts'
import { ContextMenu } from '@/components/context-menu'
import type { Placement } from '@popperjs/core'
import type { MenuItemType } from '@/components/context-menu'
import type { TabItem } from './index'

interface TabsProps {
  asChild?: boolean
  tabs: TabItem[]
  items?: MenuItemType[]
  popperPlacement?: Placement
  enableContextMenu?: boolean
  contentHeight?: number
  showIcon?: boolean
}

const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  popperPlacement: () => 'right-start',
  enableContextMenu: () => true,
  contentHeight: undefined,
  showIcon: false,
})

const modelValue = defineModel<string>('modelValue', { required: true })

// 提供当前tab值给子组件
provide('currentTabValue', modelValue)

// 右击菜单
const { isOpen, virtualElement, currentItem, onContextMenu } = useContextMenu()
</script>

<template>
  <TabsRoot v-model="modelValue" @update:modelValue="modelValue = $event" v-bind="$attrs">
    <TabsList>
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="cn('flex items-center gap-2 px-4 py-1 border-border text-secondary')"
        @contextmenu.prevent="onContextMenu(tab)"
      >
        <template v-if="showIcon">
          <Icon
            v-if="tab.value === modelValue"
            :icon="tab.activeIcon || tab.icon || 'material-symbols:folder-open-outline'"
            width="24"
            height="24"
          />
          <Icon v-else :icon="tab.icon || 'material-symbols:folder-outline'" width="24" height="24" />
        </template>
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" :content-height="props.contentHeight">
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
  <ContextMenu
    v-if="enableContextMenu && items?.length"
    v-model="isOpen"
    :virtual-element="virtualElement"
    :popper="{ placement: popperPlacement }"
    :items="items"
    :current-item="currentItem"
  />
</template>

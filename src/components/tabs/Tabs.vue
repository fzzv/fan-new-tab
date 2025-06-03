<script setup lang="ts">
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
}

withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  popperPlacement: () => 'right-start',
  enableContextMenu: () => true,
})

const modelValue = defineModel<string>('modelValue', { required: true })

// 右击菜单
const { isOpen, virtualElement, onContextMenu } = useContextMenu()
</script>

<template>
  <TabsRoot v-model="modelValue" @update:modelValue="modelValue = $event">
    <TabsList>
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="cn('flex items-center gap-2 px-4 py-1 border-border text-secondary')"
        @contextmenu.prevent="onContextMenu"
      >
        <Icon
          v-if="tab.value === modelValue"
          :icon="tab.activeIcon || tab.icon || 'material-symbols:folder-open-outline'"
          width="24"
          height="24"
        />
        <Icon v-else :icon="tab.icon || 'material-symbols:folder-outline'" width="24" height="24" />
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
  <ContextMenu
    v-if="enableContextMenu && items?.length"
    v-model="isOpen"
    :virtual-element="virtualElement"
    :popper="{ placement: popperPlacement }"
    :items="items"
  />
</template>

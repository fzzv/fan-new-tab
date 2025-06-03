<script setup lang="ts">
import { toRef } from 'vue'
import { usePopper } from '@/composables/usePopper.ts'
import { onClickOutside } from '@/lib'
import { Icon } from '@iconify/vue'
import ContextMenuItem from './ContextMenuItem.vue'
import type { Ref, PropType } from 'vue'
import type { VirtualElement } from '@popperjs/core'
import type { PopperOptions } from '@/composables/usePopper.ts'
import type { MenuItemType } from '@/types'

const props = defineProps({
  virtualElement: {
    type: Object,
    required: true,
  },
  popper: {
    type: Object as PropType<PopperOptions>,
    default: () => ({}),
  },
  ui: {
    type: Object,
    default: () => ({}),
  },
  items: {
    type: Array as PropType<MenuItemType[]>,
    default: () => [],
  },
})

const isOpen = defineModel<boolean>({ required: true })

const virtualElement = toRef(props, 'virtualElement') as Ref<VirtualElement>

const [, container] = usePopper(props.popper, virtualElement)

onClickOutside(container, () => {
  isOpen.value = false
})
</script>

<template>
  <div v-if="isOpen" ref="container" class="bg-white border-2 shadow-md absolute top-2 min-w-20 z-20" v-bind="$attrs">
    <Transition name="menu" appear v-bind="ui.transition">
      <div>
        <div v-if="items.length" class="focus:outline-none relative">
          <ContextMenuItem v-for="(item, index) in items" :key="`item-${index}`" @click="item.click">
            <template v-if="item.icon">
              <Icon :icon="item.icon" class="w-5 h-5 mr-2" />
              <span class="text-black">{{ item.label }}</span>
            </template>
          </ContextMenuItem>
        </div>
        <div v-else class="focus:outline-none relative">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.menu-enter-active {
  transition: all 0.2s ease-out;
}
.menu-leave-active {
  transition: all 0.15s ease-in;
}
.menu-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.menu-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.menu-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

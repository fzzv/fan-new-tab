<script setup lang="ts">
import { toRef } from 'vue'
import { usePopper } from '@/composables/usePopper.ts'
import { onClickOutside } from '@/lib'
import type { Ref, PropType } from 'vue'
import type { VirtualElement } from '@popperjs/core'
import type { PopperOptions } from '@/composables/usePopper.ts'

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
})

defineEmits(['close'])

const isOpen = defineModel<boolean>({ required: true })

const virtualElement = toRef(props, 'virtualElement') as Ref<VirtualElement>

const [, container] = usePopper(props.popper, virtualElement)

onClickOutside(container, () => {
  isOpen.value = false
})

// 合并默认UI 前者覆盖后者
// const ui = defu(props.ui, CONTEXTMENU_UI)
</script>

<template>
  <div
    v-if="isOpen"
    ref="container"
    class="bg-white border-2 shadow-md absolute top-2 min-w-20 z-20"
    v-bind="$attrs"
  >
    <Transition name="menu" appear v-bind="ui.transition">
      <div>
        <!-- <div :class="[ui.base, ui.ring, ui.shadow, ui.background]"> -->
        <div class="focus:outline-none relative">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="postcss" scoped>
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

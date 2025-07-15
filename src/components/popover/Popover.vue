<script setup lang="ts">
import {
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils.ts'
import { ref } from 'vue'
import type { ClassValue } from 'clsx'

const contentRef = ref()
const popoverContentVariants = cva(
  'z-5 w-72 border-2 bg-background p-4 text-popover-foreground  outline-none data-[state=open]:animate-in ' +
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95' +
    'data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 ' +
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]',
)

withDefaults(
  defineProps<{
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
    showArrow?: boolean
  }>(),
  {
    showArrow: false,
  },
)
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverAnchor />
    <PopoverPortal>
      <PopoverContent
        ref="contentRef"
        :class="
          cn(
            popoverContentVariants({
              class: $attrs.class as ClassValue,
            }),
          )
        "
        :align="align"
        :sideOffset="sideOffset"
        v-bind="$attrs"
      >
        <PopoverClose v-if="$slots.close">
          <slot name="close" />
        </PopoverClose>
        <PopoverArrow v-if="showArrow" />
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

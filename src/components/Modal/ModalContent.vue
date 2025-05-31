<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dialogVariants = cva(
  `fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  flex flex-col border-2 shadow-md gap-4 overflow-y-auto bg-background text-foreground
  w-full h-fit max-h-[80vh] max-w-[97%] duration-300
  data-[state=open]:animate-in 
  data-[state=open]:slide-in-from-left-1/2 
  data-[state=open]:slide-in-from-top-[48%]
  data-[state=open]:fade-in-0 
  data-[state=open]:zoom-in-95 
  data-[state=closed]:animate-out 
  data-[state=closed]:fade-out-0 
  data-[state=closed]:slide-out-to-top-[48%] 
  data-[state=closed]:slide-out-to-left-1/2 
  data-[state=closed]:zoom-out-95`,
  {
    variants: {
      size: {
        auto: "max-w-fit",
        sm: "lg:max-w-[30%]",
        md: "lg:max-w-[40%]",
        lg: "lg:max-w-[50%]",
        xl: "lg:max-w-[60%]",
        "2xl": "lg:max-w-[70%]",
        "3xl": "lg:max-w-[80%]",
        "4xl": "lg:max-w-[90%]",
        screen: "max-w-[100%]",
      },
    },
    defaultVariants: {
      size: "auto",
    },
  },
);

defineProps<{
  size?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'screen'
}>()
</script>

<template>
  <div :class="cn(dialogVariants({ size }), $attrs.class)" v-bind="$attrs">
    <div class="flex flex-col relative">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Label } from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)
</script>

<template>
  <Label :class="cn(labelVariants())" v-bind="$attrs">
    <slot />
  </Label>
</template>

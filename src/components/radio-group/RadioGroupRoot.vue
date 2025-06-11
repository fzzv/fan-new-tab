<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import { cn } from '@/lib'
import type { ClassValue } from 'clsx'
</script>

<template>
  <RadioGroupRoot :class="cn('grid gap-2', $attrs.class as ClassValue)">
    <slot />
  </RadioGroupRoot>
</template>

<style scoped></style>

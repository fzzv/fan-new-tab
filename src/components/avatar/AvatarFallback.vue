<script setup lang="ts">
import { AvatarFallback } from 'reka-ui'
import { cn } from '@/lib'
</script>

<template>
  <AvatarFallback
    :class="cn('flex h-full w-full items-center justify-center rounded-full text-2xl bg-muted bg-primary')"
    v-bind="$attrs"
  >
    <slot />
  </AvatarFallback>
</template>

<style scoped></style>

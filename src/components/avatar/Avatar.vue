<script setup lang="ts">
import { AvatarRoot } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
</script>

<template>
  <AvatarRoot
    :class="cn('relative flex h-14 w-14 overflow-hidden rounded-full', $attrs.class as ClassValue)"
    as="div"
    v-bind="$attrs"
  >
    <slot />
  </AvatarRoot>
</template>

<style scoped></style>

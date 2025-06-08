<script setup lang="ts">
import { AvatarImage } from 'reka-ui'
import { cn } from '@/lib/utils'

defineProps<{
  src: string
}>()
</script>

<template>
  <AvatarImage :src="src" :class="cn('aspect-square h-full w-full')" v-bind="$attrs" />
</template>

<style scoped></style>

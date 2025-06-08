<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { ClassValue } from 'clsx'
</script>

<template>
  <SwitchRoot
    :class="
      cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer border-2 border-foreground items-center',
        'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary',
        $attrs.class as ClassValue,
      )
    "
    v-bind="$attrs"
  >
    <SwitchThumb
      :class="
        cn(
          'pointer-events-none block h-4 w-4 bg-primary border-2 mx-0.5 border-foreground ring-0',
          'transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          'data-[state=checked]:bg-background',
        )
      "
    />
  </SwitchRoot>
</template>

<style scoped></style>

<script setup lang="ts">
import { computed } from 'vue'
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/select'

interface SelectOption {
  label: string
  value: string | number
}

interface SettingSelectProps {
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<SettingSelectProps>(), {
  placeholder: '请选择',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 双向绑定
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

// 当前选中项的显示文本
const displayText = computed(() => {
  const option = props.options.find((opt) => opt.value.toString() === props.modelValue)
  return option?.label || props.placeholder
})
</script>

<template>
  <SelectRoot v-model="selectedValue" :disabled="disabled">
    <SelectTrigger>
      <SelectValue>
        {{ displayText }}
      </SelectValue>
    </SelectTrigger>
    <!-- 使用内联样式确保在 Drawer 中有足够高的 z-index -->
    <SelectContent class="z-[1001]">
      <SelectItem v-for="option in options" :key="option.value" :value="option.value.toString()">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>

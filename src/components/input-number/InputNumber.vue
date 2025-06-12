<script setup lang="ts">
import { computed } from 'vue'
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/vue'
import type { ClassValue } from 'clsx'

interface InputNumberProps {
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
}

const props = withDefaults(defineProps<InputNumberProps>(), {
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  step: 1,
  disabled: false,
  placeholder: '请输入数字',
  size: 'md',
  variant: 'default',
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined]
  valueChange: [value: number | undefined]
}>()

// 样式变体定义
const inputNumberRootVariants = cva('relative inline-flex items-center gap-1 transition-all duration-200 font-head', {
  variants: {
    variant: {
      default: '',
      outline: '',
      ghost: '',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    disabled: false,
  },
})

// 如果需要聚焦时阴影消失 添加 focus:shadow-none
const inputNumberInputVariants = cva(
  'text-foreground placeholder:text-muted-foreground focus:outline-none text-center font-head font-medium transition-all duration-200 border-2 border-black shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-background',
        outline: 'bg-transparent',
        ghost: 'bg-transparent border-muted',
      },
      size: {
        sm: 'px-3 py-1 text-sm h-8 w-[80px]',
        md: 'px-4 py-2 text-base h-10 w-[100px]',
        lg: 'px-5 py-3 text-lg h-12 w-[120px]',
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
    },
  },
)

const inputNumberButtonVariants = cva(
  'inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none font-head font-medium border-2 border-black shadow-md hover:shadow-none hover:translate-y-1 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:hover:translate-y-0 data-[disabled]:hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-black hover:bg-primary-hover data-[disabled]:hover:bg-primary',
        outline: 'bg-transparent text-secondary hover:bg-muted data-[disabled]:hover:bg-transparent',
        ghost: 'bg-muted text-foreground hover:bg-muted/70 border-muted data-[disabled]:hover:bg-muted',
      },
      size: {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-md',
        false: '',
      },
      position: {
        first: '',
        last: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
      position: 'first',
    },
  },
)

// 计算样式类
const rootClasses = computed(() =>
  cn(inputNumberRootVariants({ variant: props.variant, size: props.size, disabled: props.disabled })),
)

const inputClasses = computed(() =>
  cn(inputNumberInputVariants({ variant: props.variant, size: props.size, disabled: props.disabled })),
)

const decrementClasses = computed(() =>
  cn(
    inputNumberButtonVariants({
      variant: props.variant,
      size: props.size,
      disabled: props.disabled,
      position: 'first',
    }),
  ),
)

const incrementClasses = computed(() =>
  cn(
    inputNumberButtonVariants({
      variant: props.variant,
      size: props.size,
      disabled: props.disabled,
      position: 'last',
    }),
  ),
)

// 图标尺寸
const iconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 14
    case 'lg':
      return 20
    default:
      return 16
  }
})

// 处理值变化
const handleValueChange = (value?: number) => {
  emit('update:modelValue', value)
  emit('valueChange', value)
}
</script>

<template>
  <NumberFieldRoot
    :class="cn(rootClasses, $attrs.class as ClassValue)"
    :model-value="modelValue"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :format-options="formatOptions"
    :locale="locale"
    @update:model-value="handleValueChange"
    v-bind="$attrs"
  >
    <!-- 减少按钮 -->
    <NumberFieldDecrement :class="decrementClasses" :disabled="disabled">
      <Icon icon="material-symbols:remove" :width="iconSize" :height="iconSize" />
    </NumberFieldDecrement>

    <!-- 数字输入框 -->
    <NumberFieldInput :class="inputClasses" :placeholder="placeholder" :disabled="disabled" />

    <!-- 增加按钮 -->
    <NumberFieldIncrement :class="incrementClasses" :disabled="disabled">
      <Icon icon="material-symbols:add" :width="iconSize" :height="iconSize" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { cn } from '@/lib/utils'

export interface Props {
  // 层级
  zIndex?: number
  // 点击蒙层是否允许关闭对话框
  closeByMask?: boolean
  // 使用v-if，关闭后销毁所有内部元素
  useVIf?: boolean
  // 即使在其他视图中也保持对话框打开
  keepAlive?: boolean
  // 对话框的 aria-labelledby id
  dialogLabelledBy?: string
}

// 不接受透传属性
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
  zIndex: 100,
  closeByMask: false,
  useVIf: true,
  keepAlive: false,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 显示隐藏
const visible = defineModel<boolean>({ required: true })

const elDialogRoot = ref<HTMLDivElement>()
const elDialogMain = ref<HTMLDivElement>()

defineExpose({
  elDialogRoot,
  elDialogMain,
})

// 关闭弹窗
function close() {
  if (!visible.value)
    return
  visible.value = false
  emit('close')
}

// 点击遮罩层关闭弹窗
function clickMask() {
  if (props.closeByMask)
    close()
}

// 控制使用 v-if 还是 v-show
const isVIf = computed(() => {
  return props.useVIf
    ? visible.value
    : true
})

// 控制使用 v-if 还是 v-show
const isVShow = computed(() => {
  return !props.useVIf
    ? visible.value
    : true
})

// 将类型转换为 any
function bindTypeToAny($attrs: any) {
  return $attrs as any
}

function trapFocusDialog() {
  // 手动激活焦点陷阱
  if (isVShow.value)
    nextTick().then(() => {})
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-visible" @transitionend="trapFocusDialog">
      <div
        v-if="isVIf"
        v-show="isVShow"
        ref="elDialogRoot"
        aria-modal="true"
        :aria-labelledby="dialogLabelledBy"
        :style="{ 'z-index': zIndex }"
        class="fixed inset-0 of-y-auto scrollbar-hide overscroll-none"
      >
        <!-- 样式' scrollbar-hide overscroll-none overflow-y-scroll '和' h="[calc(100%+0.5px)]" '用于实现滚动锁定 -->
        <!-- 蒙层 -->
        <!-- TODO: getPreferences -->
        <div
          class="dialog-mask absolute inset-0 z-0 bg-transparent opacity-100 backdrop-filter touch-none"
        >
          <!-- 蒙层 -->
          <div class="dialog-mask absolute inset-0 z-0 bg-black opacity-48 touch-none h=[calc(100%+0.5px)]" @click="clickMask" />
          <!-- 弹窗内容 -->
          <div class="p-safe-area absolute inset-0 z-1 pointer-events-none opacity-100 flex">
            <div class="flex flex-1 items-center justify-center p-4">
              <div
                ref="elDialogMain"
                :class="cn('dialog-main rounded shadow-lg pointer-events-auto isolate bg-white border-white border-1px border-solid w-full',
                  'max-h-full of-y-auto overscroll-contain touch-pan-y touch-pan-x')"
                v-bind="bindTypeToAny($attrs)"
              >
                <slot />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-visible-enter-active,
.dialog-visible-leave-active {
  transition-duration: 0.25s;
}

.dialog-visible-enter-active,
.dialog-visible-leave-active .dialog-mask {
  transition: opacity 0.25s ease;
}

.dialog-visible-enter-active,
.dialog-visible-leave-active .dialog-main {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.dialog-visible-enter-from,
.dialog-visible-leave-to .dialog-mask {
  opacity: 0;
}

.dialog-visible-enter-from,
.dialog-visible-leave-to .dialog-main {
  transform: translateY(50px);
  opacity: 0;
}

.p-safe-area {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}
</style>

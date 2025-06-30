<script setup lang="ts">
import { computed, isVNode } from 'vue'
import { Icon } from '@iconify/vue'
import ModalContent from './ModalContent.vue'
import ModalHeader from './ModalHeader.vue'
import ModalFooter from './ModalFooter.vue'
import { Button } from '@/components/button'
import { confirmConfig, closeConfirmDialog } from '@/composables/useDialog'
import type { VNode } from 'vue'

// 处理确认操作
async function handleOk() {
  try {
    if (confirmConfig.value.onOk) {
      await confirmConfig.value.onOk()
    }
  } catch (error) {
    console.error('确认操作失败:', error)
  } finally {
    closeConfirmDialog()
  }
}

// 处理取消操作
function handleCancel() {
  if (confirmConfig.value.onCancel) {
    confirmConfig.value.onCancel()
  }
  closeConfirmDialog()
}

const title = computed(() => confirmConfig.value.title || '确认')
const content = computed(() => confirmConfig.value.content || '')
const okText = computed(() => confirmConfig.value.okText || '确定')
const cancelText = computed(() => confirmConfig.value.cancelText || '取消')
const icon = computed(() => confirmConfig.value.icon || 'material-symbols:help-outline')

// 判断是否为 VNode
function isVNodeContent(content: any): content is VNode {
  return isVNode(content)
}
</script>

<template>
  <ModalContent size="sm" :class="confirmConfig.class">
    <ModalHeader @close="handleCancel">
      <div class="flex items-center gap-3">
        <!-- 图标 -->
        <div class="flex-shrink-0">
          <component v-if="isVNodeContent(icon)" :is="icon" />
          <Icon v-else :icon="icon as string" width="24" height="24" class="text-orange-500" />
        </div>
        <!-- 标题 -->
        <div class="flex-1">
          <component v-if="isVNodeContent(title)" :is="title" />
          <span v-else class="font-medium">{{ title }}</span>
        </div>
      </div>
    </ModalHeader>

    <!-- 内容 -->
    <div class="px-4 py-6">
      <component v-if="isVNodeContent(content)" :is="content" />
      <div v-else class="text-sm text-foreground leading-relaxed">
        {{ content }}
      </div>
    </div>

    <ModalFooter>
      <div class="flex gap-3">
        <Button v-if="cancelText" variant="outline" @click="handleCancel">
          {{ cancelText }}
        </Button>
        <Button @click="handleOk">
          {{ okText }}
        </Button>
      </div>
    </ModalFooter>
  </ModalContent>
</template>

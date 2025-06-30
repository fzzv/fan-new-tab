import { openConfirmDialog } from '@/composables/useDialog'
import type { ConfirmConfig } from '@/composables/useDialog'

/**
 * Modal 对象，提供确认弹窗功能
 */
export const Modal = {
  /**
   * 显示确认弹窗
   * @param config 确认弹窗配置
   */
  confirm(config: ConfirmConfig) {
    openConfirmDialog(config)
  },
}

// 默认导出
export default Modal

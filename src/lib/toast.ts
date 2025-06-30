import { toast as sonnerToast } from 'vue-sonner'

/**
 * Toast 工具函数
 * 基于 vue-sonner 封装，提供统一的 toast 提示功能
 */
export const toast = {
  /**
   * 成功提示
   * @param message 提示信息
   * @param options 配置选项
   */
  success(message: string, options?: any) {
    return sonnerToast.success(message, options)
  },

  /**
   * 错误提示
   * @param message 提示信息
   * @param options 配置选项
   */
  error(message: string, options?: any) {
    return sonnerToast.error(message, options)
  },

  /**
   * 警告提示
   * @param message 提示信息
   * @param options 配置选项
   */
  warning(message: string, options?: any) {
    return sonnerToast.warning(message, options)
  },

  /**
   * 信息提示
   * @param message 提示信息
   * @param options 配置选项
   */
  info(message: string, options?: any) {
    return sonnerToast.info(message, options)
  },

  /**
   * 普通提示
   * @param message 提示信息
   * @param options 配置选项
   */
  message(message: string, options?: any) {
    return sonnerToast(message, options)
  },

  /**
   * 加载提示
   * @param message 提示信息
   * @param options 配置选项
   */
  loading(message: string, options?: any) {
    return sonnerToast.loading(message, options)
  },

  /**
   * 自定义提示
   * @param message 提示信息
   * @param options 配置选项
   */
  custom(message: string, options?: any) {
    return sonnerToast.custom(() => message, options)
  },

  /**
   * 关闭指定 toast
   * @param id toast ID
   */
  dismiss(id?: string | number) {
    return sonnerToast.dismiss(id)
  },
}

// 默认导出
export default toast

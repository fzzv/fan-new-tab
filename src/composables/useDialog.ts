import { ref } from 'vue'
import type { VNode } from 'vue'

// 添加搜索引擎 弹窗
export const isAddEngineDialog = ref(false)

export const openAddEngineDialog = () => {
  isAddEngineDialog.value = true
}

export const closeAddEngineDialog = () => {
  isAddEngineDialog.value = false
}

// 添加收藏夹 弹窗
export const isAddFavoriteDialog = ref(false)

export const openAddFavoriteDialog = () => {
  isAddFavoriteDialog.value = true
}

export const closeAddFavoriteDialog = () => {
  isAddFavoriteDialog.value = false
}

// 设置功能 弹窗
export const isPageSettingDialog = ref(false)

export const openPageSettingDialog = () => {
  isPageSettingDialog.value = true
}

export const closePageSettingDialog = () => {
  isPageSettingDialog.value = false
}

// 壁纸选择
export const isWallpaperSelector = ref(false)

export const openWallpaperSelector = () => {
  isWallpaperSelector.value = true
}

export const closeWallpaperSelector = () => {
  isWallpaperSelector.value = false
}

// 颜色选择器
export const isColorPickerDialog = ref(false)

export const openColorPickerDialog = () => {
  isColorPickerDialog.value = true
}

export const closeColorPickerDialog = () => {
  isColorPickerDialog.value = false
}

// 收藏自定义网站弹窗
export const isAddSiteDialog = ref(false)

export const openAddSiteDialog = () => {
  isAddSiteDialog.value = true
}

export const closeAddSiteDialog = () => {
  isAddSiteDialog.value = false
}

// 确认弹窗配置接口
export interface ConfirmConfig {
  title?: string | VNode
  icon?: string | VNode
  content?: string | VNode
  okText?: string
  cancelText?: string
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  class?: string
  zIndex?: number
}

// 确认弹窗
export const isConfirmDialog = ref(false)
export const confirmConfig = ref<ConfirmConfig>({})

export const openConfirmDialog = (config: ConfirmConfig) => {
  confirmConfig.value = config
  isConfirmDialog.value = true
}

export const closeConfirmDialog = () => {
  isConfirmDialog.value = false
  confirmConfig.value = {}
}

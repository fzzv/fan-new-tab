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
export const addFavoritePosition = ref<number | null>(null)

export const openAddFavoriteDialog = (position?: number) => {
  addFavoritePosition.value = position ?? null
  isAddFavoriteDialog.value = true
}

export const closeAddFavoriteDialog = () => {
  isAddFavoriteDialog.value = false
  addFavoritePosition.value = null
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

// 网站弹窗（统一的添加/编辑弹窗）
export const isSiteDialog = ref(false)
export const siteDialogMode = ref<'add' | 'edit'>('add')
export const siteDialogData = ref<any>(null)

export const openAddSiteDialog = () => {
  siteDialogMode.value = 'add'
  siteDialogData.value = null
  isSiteDialog.value = true
}

export const openEditSiteDialog = (siteData: any) => {
  siteDialogMode.value = 'edit'
  siteDialogData.value = siteData
  isSiteDialog.value = true
}

export const closeSiteDialog = () => {
  isSiteDialog.value = false
  siteDialogMode.value = 'add'
  siteDialogData.value = null
}

// 保持向后兼容性
export const closeAddSiteDialog = closeSiteDialog
export const closeEditSiteDialog = closeSiteDialog

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

import { ref } from 'vue'

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

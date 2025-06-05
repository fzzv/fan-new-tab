import { ref } from 'vue'

export const isAddEngineDialog = ref(false)

export const openAddEngineDialog = () => {
  isAddEngineDialog.value = true
}

export const closeAddEngineDialog = () => {
  isAddEngineDialog.value = false
}

export const isAddFavoriteDialog = ref(false)

export const openAddFavoriteDialog = () => {
  isAddFavoriteDialog.value = true
}

export const closeAddFavoriteDialog = () => {
  isAddFavoriteDialog.value = false
}

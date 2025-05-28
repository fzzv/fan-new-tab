import { ref } from 'vue'

export const isAddEngineDialog = ref(false)

export const openAddEngineDialog = () => {
  isAddEngineDialog.value = true
}

export const closeAddEngineDialog = () => {
  isAddEngineDialog.value = false
}

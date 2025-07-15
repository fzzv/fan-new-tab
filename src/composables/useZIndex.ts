import { ref } from 'vue'

let currentZIndex = 10 // 起始层级

export function useZIndex(base = 10) {
  currentZIndex = base
  const zIndex = ref(currentZIndex)
  currentZIndex += 1
  return {
    zIndex,
  }
}

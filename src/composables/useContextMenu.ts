import { ref, unref } from 'vue'
import { useMouse } from '@/composables/useMouse.ts'
import { useWindowScroll } from '@/composables/useWindowScroll.ts'

export function useContextMenu() {
  const { x, y } = useMouse()
  const { y: windowY } = useWindowScroll()

  const isOpen = ref(false)
  const virtualElement = ref({ getBoundingClientRect: () => ({}) })

  const currentItem = ref<any>(null)

  function onContextMenu(item?: any) {
    const top = unref(y) - unref(windowY)
    const left = unref(x)

    virtualElement.value.getBoundingClientRect = function () {
      return {
        width: 0,
        height: 0,
        top,
        left,
      }
    }

    isOpen.value = true
    currentItem.value = item
  }

  return {
    isOpen,
    currentItem,
    virtualElement,
    onContextMenu,
  }
}

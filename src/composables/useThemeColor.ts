import { ref, onMounted, onUnmounted } from 'vue'
import { getCssVar } from '@/lib/utils'

export function useThemeColor(varName: string) {
  const color = ref('')

  // 更新颜色值
  const updateColor = () => {
    color.value = getCssVar(varName)
  }

  // 监听主题变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateColor()
      }
    })
  })

  onMounted(() => {
    // 初始化颜色
    updateColor()
    
    // 监听 class 变化（主题切换）
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  })

  onUnmounted(() => {
    observer.disconnect()
  })

  return color
}

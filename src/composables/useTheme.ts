import { useWebExtStorage } from '@/composables/useWebExtStorage.ts'

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

const { data: theme, dataReady: themeReady } = useWebExtStorage('theme', Theme.Light)

export function useTheme() {
  return {
    theme,
    themeReady,
  }
}

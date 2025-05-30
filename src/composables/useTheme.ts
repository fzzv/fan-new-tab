import { useWebExtStorage } from "@/composables/useWebExtStorage.ts"

export const { data: theme } = useWebExtStorage('theme', 'light')
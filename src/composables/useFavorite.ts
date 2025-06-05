import { useWebExtStorage } from '@/composables/useWebExtStorage'
import type { TabItem } from '@/components/tabs'
import { v4 as uuidV4 } from 'uuid'

const { data: favorites, dataReady: favoritesReady } = useWebExtStorage('favorite', [
  {
    id: '1',
    label: 'Google',
    value: '1',
  },
] as TabItem[])

export function useFavorite() {
  // 添加收藏夹
  const addFavorite = (favorite: TabItem) => {
    const id = uuidV4()
    const newFavorite: TabItem = {
      id,
      label: favorite.label,
      value: id,
      icon: favorite?.icon,
      activeIcon: favorite?.activeIcon,
    }
    favorites.value = [...favorites.value, newFavorite]
  }

  // 删除收藏夹
  const removeFavorite = (favorite: TabItem) => {
    favorites.value = favorites.value.filter((item) => item.id !== favorite.id)
  }

  return {
    favorites,
    favoritesReady,
    addFavorite,
    removeFavorite,
  }
}

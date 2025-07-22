import { useWebExtStorage } from '@/composables/useWebExtStorage'
import type { TabItem } from '@/components/tabs'
import { v4 as uuidV4 } from 'uuid'

const { data: favorites, dataReady: favoritesReady } = useWebExtStorage('favorites', [
  {
    id: 'default',
    label: '默认收藏夹',
    value: 'default',
    icon: 'material-symbols:star-outline-rounded',
    activeIcon: 'material-symbols:star-rounded',
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

  // 在指定位置添加收藏夹
  const addFavoriteAtPosition = (favorite: TabItem, position: number) => {
    const id = uuidV4()
    const newFavorite: TabItem = {
      id,
      label: favorite.label,
      value: id,
      icon: favorite?.icon,
      activeIcon: favorite?.activeIcon,
    }
    const newFavorites = [...favorites.value]
    newFavorites.splice(position, 0, newFavorite)
    favorites.value = newFavorites
  }

  // 删除收藏夹
  const removeFavorite = (favorite: TabItem) => {
    favorites.value = favorites.value.filter((item) => item.id !== favorite.id)
  }

  return {
    favorites,
    favoritesReady,
    addFavorite,
    addFavoriteAtPosition,
    removeFavorite,
  }
}
